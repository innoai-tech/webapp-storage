use crate::data_store::{
    DOWNLOAD_COMPLETE_STORE, DOWNLOAD_PROGRESS_STORE, UPLOAD_COMPLETE_STORE, UPLOAD_PROGRESS_STORE,
};
use crate::download::{download, download_dir};
use crate::queue::{DOWNLOAD_CONCURRENT_QUEUE, UPLOAD_CONCURRENT_QUEUE};
use crate::upload::upload;
use opener::open;
use pathdiff::diff_paths;
use std::fs;
use std::string::String;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Arc;
use tokio::fs::File;
use walkdir::WalkDir;
use wasm_bindgen::prelude::*;

// 文件夹批量下载
#[derive(serde::Deserialize)]
pub struct DownloadDirsParams {
    get_files_base_url: String,      // 获取文件夹下的文件 url
    download_files_base_url: String, // 获取文件 blob 信息的 url
    local_path: String,
    auth: String,
    dirs: Vec<DownloadDirsParamsData>,
}

#[derive(serde::Deserialize)]
pub struct DownloadDirsParamsData {
    path: String,
    name: String,
    id: String,
}

#[tauri::command]
pub async fn download_dirs(dirs_json_str: String) {
    // 解析传入的 JSON 字符串
    let params: DownloadDirsParams = serde_json::from_str(&dirs_json_str).unwrap();
    let dirs: Vec<DownloadDirsParamsData> = params.dirs;
    let get_files_base_url = params.get_files_base_url;
    let download_files_base_url = params.download_files_base_url;
    let local_path = params.local_path;
    let auth = params.auth;
    let rt = tokio::runtime::Runtime::new().unwrap();
    let downloaded_file_count = Arc::new(AtomicU64::new(0));
    // 遍历文件列表，将每个文件的上传任务加入上传队列
    UPLOAD_CONCURRENT_QUEUE.push(move || {
        rt.block_on(async {
            for dir in dirs {
                let id = dir.id.clone();

                let total_file_count = Arc::new(AtomicU64::new(0));
                match download_dir(
                    get_files_base_url.clone(),
                    download_files_base_url.clone(),
                    dir.name.clone(),
                    dir.path.clone(),
                    local_path.clone(),
                    auth.clone(),
                    id.clone(),
                    total_file_count.clone(),
                )
                .await
                {
                    Ok(_) => {}
                    Err(err) => {
                        let err_str = format!("ID:{} \n \n  DOWNLOAD ERR: {}", id.clone(), err);
                        // 失败的时候判断一下下载完了吗，下载完了就结束，没下载完插入一个错误信息
                        let count = downloaded_file_count.fetch_add(1, Ordering::Relaxed);
                        // 获取的是 -1 前的值，所以手动-1 判断一下是否都下载完毕了
                        println!("{}", count);
                        if total_file_count.load(Ordering::Relaxed) == count + 1 {
                            DOWNLOAD_COMPLETE_STORE
                                .lock()
                                .unwrap()
                                .add(id.clone(), Some(err_str.clone()));
                        } else {
                            DOWNLOAD_PROGRESS_STORE.lock().unwrap().add(
                                id.clone(),
                                None,
                                Some(err_str.clone()),
                            );
                        }
                    }
                }
            }
        })
    });
}

// 文件批量下载
#[derive(serde::Deserialize)]
pub struct DownloadFilesParams {
    url: String,
    file_name: String,
    local_path: String,
    auth: String,
    id: String,
    size: u64,
}

#[tauri::command]
pub async fn download_files(files_json_str: String) -> String {
    // 解析传入的 JSON 字符串
    let files: Vec<DownloadFilesParams> = serde_json::from_str(&files_json_str).unwrap();

    // 遍历文件列表，将每个文件的上传任务加入上传队列
    for file in files {
        let size = file.size.clone();
        let auth = file.auth.clone();
        let id = file.id.clone();
        let file_name = file.file_name.clone();
        let url = file.url.clone();
        let local_path = file.local_path.clone();

        DOWNLOAD_CONCURRENT_QUEUE.push(move || {
            let rt = tokio::runtime::Runtime::new().unwrap();
            rt.block_on(async {
                let _local_path = local_path.clone();
                match download(
                    url,
                    local_path,
                    auth,
                    file_name,
                    id.clone(),
                    Arc::new(AtomicU64::new(0)),
                    size.clone(),
                )
                .await
                {
                    Ok(_) => {
                        DOWNLOAD_COMPLETE_STORE
                            .lock()
                            .unwrap()
                            .add(id.clone(), None);
                    }
                    Err(err) => {
                        let err_str = format!(
                            "ID:{} \n PATH:{} \n  UPLOAD ERR: {}",
                            id.clone(),
                            _local_path.to_string().clone(),
                            err
                        );

                        // 多个文件错一个继续下载，但是插入一条错误信息
                        DOWNLOAD_COMPLETE_STORE
                            .lock()
                            .unwrap()
                            .add(id.clone(), Some(err_str.clone()));

                        eprintln!("UPLOAD ERR: {}", err_str)
                    }
                }
            });
        });
    }
    "ok".to_string()
}

// 文件上传
#[tauri::command]
pub async fn upload_file(
    url: String,
    origin_path: String,
    check_object_url: String,
    local_path: String,
    auth: String,
    id: String,
    window: tauri::Window,
) {
    let rt = tokio::runtime::Runtime::new().unwrap();
    // 将上传任务加入上传队列
    UPLOAD_CONCURRENT_QUEUE.push(move || {
        rt.block_on(async {
            // 获取文件大小，并设置进度相关的变量
            match get_file_size(&local_path) {
                Ok(size) => {
                    let uploaded_len = Arc::new(AtomicU64::new(0));
                    let total_len = Arc::new(AtomicU64::new(size));
                    let _local_path = local_path.clone();
                    match upload(
                        url,
                        check_object_url.clone(),
                        origin_path,
                        local_path,
                        auth,
                        id.clone(),
                        uploaded_len,
                        total_len,
                        window,
                    )
                    .await
                    {
                        Ok(_) => {
                            UPLOAD_COMPLETE_STORE.lock().unwrap().add(id.clone(), None);
                        }
                        Err(err) => {
                            let err_str = format!(
                                "ID:{} \n PATH:{} \n  UPLOAD ERR: {}",
                                id.clone(),
                                _local_path.to_string().clone(),
                                err
                            );
                            // 文件的错误直接结束，并且放入错误信息
                            UPLOAD_COMPLETE_STORE
                                .lock()
                                .unwrap()
                                .add(id.clone(), Some(err_str.clone()));
                            eprintln!("UPLOAD ERR: {}", err_str)
                        }
                    }
                }
                Err(e) => eprintln!("Error: {:?}", e),
            }
        });
    });
}

// 文件批量上传
#[derive(serde::Deserialize)]
pub struct UploadFilesParams {
    url: String,
    check_object_url: String,
    origin_path: String,
    local_path: String,
    auth: String,
    id: String,
}

#[tauri::command]
pub async fn upload_files(files_json_str: String, window: tauri::Window) {
    // 解析传入的 JSON 字符串
    let files: Vec<UploadFilesParams> = serde_json::from_str(&files_json_str).unwrap();

    // 遍历文件列表，将每个文件的上传任务加入上传队列
    for file in files {
        let auth = file.auth.clone();
        let origin_path = file.origin_path.clone();
        let id = file.id.clone();
        let url = file.url.clone();
        let local_path = file.local_path.clone();
        let check_object_url = file.check_object_url.clone();
        let window = window.clone();
        UPLOAD_CONCURRENT_QUEUE.push(move || {
            let rt = tokio::runtime::Runtime::new().unwrap();
            rt.block_on(async {
                // 获取文件大小，并设置进度相关的变量
                match get_file_size(&local_path) {
                    Ok(size) => {
                        let uploaded_size_len = Arc::new(AtomicU64::new(0));
                        let total_size_len = Arc::new(AtomicU64::new(size));
                        let _local_path = local_path.clone();
                        match upload(
                            url,
                            check_object_url,
                            origin_path,
                            local_path,
                            auth,
                            id.clone(),
                            uploaded_size_len,
                            total_size_len,
                            window,
                        )
                        .await
                        {
                            Ok(_) => {
                                UPLOAD_COMPLETE_STORE.lock().unwrap().add(id.clone(), None);
                            }
                            Err(err) => {
                                let err_str = format!(
                                    "ID:{} \n PATH:{} \n  UPLOAD ERR: {}",
                                    id.clone(),
                                    _local_path.to_string().clone(),
                                    err
                                );

                                // 多个文件错一个继续上传，但是插入一条错误信息
                                UPLOAD_COMPLETE_STORE
                                    .lock()
                                    .unwrap()
                                    .add(id.clone(), Some(err_str.clone()));

                                eprintln!("UPLOAD ERR: {}", err_str)
                            }
                        }
                    }
                    Err(e) => eprintln!("Error: {:?}", e),
                }
            });
        });
    }
}

// 文件夹上传
#[tauri::command]
pub async fn upload_dir(
    url: String,
    dir_path: String,
    origin_path: String,
    check_object_url: String,
    auth: String,
    id: String,
    window: tauri::Window,
) {
    let uploaded_len = Arc::new(AtomicU64::new(0));
    let total_len = Arc::new(AtomicU64::new(0));
    let total_len_clone = total_len.clone();
    let total_file_count = Arc::new(AtomicU64::new(0));

    let mut path_list = Vec::new(); // 定义一个数组变量，用于存储成功获取到 size 的路径
    for entry_result in WalkDir::new(&dir_path).into_iter() {
        match entry_result {
            Ok(res) => {
                let entry_clone = res.clone();
                // 打开文件
                if !entry_clone.file_type().is_dir() && !is_hidden(&entry_clone) {
                    let entry_path = entry_clone.path().display().to_string();

                    match File::open(entry_path.clone()).await {
                        Ok(_) => {}
                        Err(e) => {
                            print!("{}, {:?}", entry_path.clone(), e)
                        }
                    }

                    let total_len_clone_inner = total_len_clone.clone();
                    match get_file_size(&entry_path.clone()) {
                        Ok(size) => {
                            total_len_clone_inner.fetch_add(size, Ordering::Relaxed);
                            path_list.push(entry_path.clone()); // 将成功获取到 size 的路径存入数组中
                        }
                        Err(e) => {
                            eprintln!("获取文件 {} 的 size 失败: {:?}", entry_path.clone(), e);
                        }
                    }
                }
            }
            Err(e) => {
                eprintln!("读取文件失败 {:?}", e);
            }
        }
    }

    let boxed_dir_path: Box<str> = dir_path.clone().into();
    let uploaded_len_clone = uploaded_len.clone();
    let current_complete_file_count = Arc::new(AtomicU64::new(0));

    // 遍历存储的路径
    for path in &path_list {
        let _path = path.clone();
        let uploaded_len_clone_inner = uploaded_len_clone.clone();
        let total_len_clone_inner = total_len_clone.clone();
        let relative_path = diff_paths(&path, &*boxed_dir_path).unwrap();
        let _check_object_url = check_object_url.clone();
        let _url = url.clone();
        let _id = id.clone();
        let _auth = auth.clone();
        let _window = window.clone();
        // 文件夹的远程 path 是用固定的远程系统内的文件夹 path + 相对于这个 path 的路径，这里需要处理一下
        let _origin_path = format!(
            "{}/{}",
            origin_path,
            replace_file_name(&relative_path.display().to_string())
        );
        let _current_complete_file_count = current_complete_file_count.clone();
        let _total_file_count = total_file_count.clone();
        // 总数+1
        total_file_count.fetch_add(1, Ordering::Relaxed);
        // 将每个文件的上传任务加入上传队列
        UPLOAD_CONCURRENT_QUEUE.push(move || {
            let rt = tokio::runtime::Runtime::new().unwrap();
            rt.block_on(async {
                let path = _path.clone();
                match upload(
                    _url,
                    _check_object_url,
                    _origin_path,
                    _path,
                    _auth,
                    _id.clone(),
                    uploaded_len_clone_inner,
                    total_len_clone_inner.clone(),
                    _window,
                )
                .await
                {
                    Ok(_) => {}
                    Err(err) => {
                        let err_str = format!(
                            "ID:{}\nPATH:{}\nUPLOAD ERR: {}",
                            _id.clone(),
                            path.to_string().clone(),
                            err
                        );
                        // 文件夹错误继续上传，但是插入一条错误信息
                        UPLOAD_PROGRESS_STORE.lock().unwrap().add(
                            _id.clone(),
                            None,
                            Some(err_str.clone()),
                        );
                        println!("UPLOAD ERR: {}", err)
                    }
                }
                // 上传完毕判断一下，甭管成功失败都+1，当所有传输完毕，哪怕有失败的进度没到 100%也给扔进已完成去
                let current_complete_len =
                    _current_complete_file_count.fetch_add(1, Ordering::Relaxed) + 1;
                let total_len = _total_file_count.load(Ordering::Relaxed);
                println!("总共：{}, 当前已上传 {}", total_len, current_complete_len);
                if current_complete_len == _total_file_count.load(Ordering::Relaxed) {
                    UPLOAD_COMPLETE_STORE.lock().unwrap().add(_id.clone(), None);
                }
            });
        });
    }
}

// 检查是否为隐藏文件或文件夹
fn is_hidden(entry: &walkdir::DirEntry) -> bool {
    entry
        .path()
        .components()
        .any(|c| c.as_os_str().to_str().map_or(false, |s| s.starts_with('.')))
}

// 获取文件大小
pub fn get_file_size(local_path: &str) -> Result<u64, std::io::Error> {
    let metadata = fs::metadata(local_path)?;
    Ok(metadata.len())
}

// 打开指定文件夹
#[tauri::command]
pub fn open_folder(path: String) -> String {
    // 打开 URL
    match open(path) {
        Ok(_) => return format!("success").into(),
        Err(e) => return format!("{}", e).into(),
    }

    // 这个是在传入的上一级导入，暂时不需要它
    // #[cfg(target_os = "windows")]
    // {
    //     Command::new("explorer")
    //         .args(["/select,", &path]) // The comma after select is not a typo
    //         .spawn()
    //         .unwrap();
    // }

    // #[cfg(target_os = "linux")]
    // {
    //     if path.contains(",") {
    //         // see https://gitlab.freedesktop.org/dbus/dbus/-/issues/76
    //         let new_path = match metadata(&path).unwrap().is_dir() {
    //             true => path,
    //             false => {
    //                 let mut path2 = PathBuf::from(path);
    //                 path2.pop();
    //                 path2.into_os_string().into_string().unwrap()
    //             }
    //         };
    //         Command::new("xdg-open").arg(&new_path).spawn().unwrap();
    //     } else {
    //         Command::new("dbus-send")
    //             .args([
    //                 "--session",
    //                 "--dest=org.freedesktop.FileManager1",
    //                 "--type=method_call",
    //                 "/org/freedesktop/FileManager1",
    //                 "org.freedesktop.FileManager1.ShowItems",
    //                 format!("array:string:\"file://{path}\"").as_str(),
    //                 "string:\"\"",
    //             ])
    //             .spawn()
    //             .unwrap();
    //     }
    // }

    // #[cfg(target_os = "macos")]
    // {
    //     Command::new("open").args(["-R", &path]).spawn().unwrap();
    // }
}
#[wasm_bindgen]
pub fn replace_file_name(name: &str) -> String {
    let replaced_name = name.replace(":", "：");
    String::from(replaced_name)
}
