use crate::data_store::{DOWNLOAD_COMPLETE_STORE, DOWNLOAD_PROGRESS_STORE};
use crate::queue::DOWNLOAD_CONCURRENT_QUEUE;
use async_recursion::async_recursion;
use chrono::{Local, SecondsFormat};
use futures_util::StreamExt;
use pathdiff::diff_paths;
use percent_encoding::{utf8_percent_encode, AsciiSet, CONTROLS};
use reqwest_middleware::ClientBuilder;
use reqwest_retry::{policies::ExponentialBackoff, RetryTransientMiddleware};
use std::fs;
use std::fs::File;
use std::io::Write;
use std::path::Path;
use std::path::PathBuf;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Arc;
use std::time::Duration;
use url::Url;
// 定义结构体，用于存储下载进度
#[derive(Clone, serde::Serialize)]
pub struct DownloadProgress {
    current: u64,
    id: String,
}

// 定义结构体，用于存储下载完成状态
#[derive(Clone, serde::Serialize)]
pub struct DownloadComplete {
    id: String,
}

// 定义异步函数，用于下载文件并保存到本地
pub async fn download_core(
    url: String,                             // 文件下载地址
    local_path: String,                      // 本地文件保存路径
    auth: String,                            // 请求头中的 Authorization 字段
    file_name: String,                       // 文件名称
    id: String,                              // 文件唯一标识符
    current_downloaded_size: Arc<AtomicU64>, // 当前下载的尺寸，主要是兼容文件夹下载，文件下载固定传入 0
    total_size: u64,                         // 下载的总大小
) -> Result<(), Box<dyn std::error::Error>> {
    const FRAGMENT: &AsciiSet = &CONTROLS
        .add(b' ')
        .add(b'"')
        .add(b'<')
        .add(b'>')
        .add(b'`')
        .add(b'#');
    let url = utf8_percent_encode(&url.clone(), FRAGMENT).to_string();
    // 将文件名称中非法字符替换为下划线
    let file_name = format!(
        "{}",
        file_name.replace(
            |item: char| ['\\', '/', ':', '?', '*', '"', '<', '>', '|'].contains(&item),
            "_",
        )
    );

    // 克隆文件唯一标识符
    let _id = id.clone();

    // 定义临时文件名，并将其与本地文件保存路径拼接成完整路径
    let file_tmp_name = format!("{}_temp", file_name);

    // 如果文件夹不存在，创建一下
    match fs::create_dir_all(local_path.clone()) {
        Ok(_) => {}
        Err(..) => {}
    }
    let file_path = Path::new(&local_path).join(file_tmp_name);

    // 发送 GET 请求，获取文件内容
    let res = match reqwest::Client::new()
        .get(url)
        .header("Authorization", auth)
        .send()
        .await
    {
        Ok(res) => res,
        Err(e) => {
            return Err(Box::new(e));
        }
    };

    // 判断响应状态码是否为成功状态
    if !res.status().is_success() {
        let status_code = res.status().as_u16();
        let body = res.text().await.map_err(|e| format!("{}", e))?;
        if let Err(e) = std::fs::remove_file(&file_path) {
            eprintln!("删除文件失败: {}", e);
        }
        return Err(format!(
            "Request failed with status code {}, body: {}",
            status_code, body
        )
        .into());
    }

    // 创建字节流
    let mut stream = res.bytes_stream();

    let mut file = File::create(&file_path).map_err(|_| "文件创建失败")?;

    // 定义变量，用于保存已下载文件的长度

    // 循环遍历字节流，将数据写入本地文件，并通过原子变量保存下载进度
    while let Some(chunk) = stream.next().await {
        let chunk = chunk.map_err(|_| "网络错误")?;

        file.write_all(&chunk).map_err(|_| "文件写入失败")?;
        let len: u64 = chunk.len() as u64;
        let current_len = current_downloaded_size.fetch_add(len, Ordering::Relaxed);
        // load 获取的是 feat_add之前的值，还要加上当前的值
        let progress: f32 = (current_len + len) as f32 / total_size as f32;
        DOWNLOAD_PROGRESS_STORE
            .lock()
            .unwrap()
            .add(_id.clone(), Some(progress), None);
    }

    // 将下载完成的文件重命名
    let new_file_path = Path::new(&local_path).join(&file_name);
    if new_file_path.exists() {
        match fs::remove_file(&new_file_path) {
            Ok(res) => res,
            Err(e) => println!("Error 删除文件失败: {}", e),
        }
    }

    match fs::rename(&file_path, &new_file_path) {
        Ok(res) => res,
        Err(e) => println!("Error 重命名文件失败: {}", e),
    }

    Ok(())
}

pub async fn download(
    url: String,                             // 文件下载地址
    local_path: String,                      // 本地文件保存路径
    auth: String,                            // 请求头中的 Authorization 字段
    file_name: String,                       // 文件名称
    id: String,                              // 文件唯一标识符
    current_downloaded_size: Arc<AtomicU64>, // 当前下载的尺寸，主要是兼容文件夹下载，文件下载固定传入 0
    total_size: u64,                         // 文件下载的总大小
) -> Result<(), Box<dyn std::error::Error>> {
    let mut retry_count: u64 = 0;
    loop {
        match download_core(
            url.clone(),
            local_path.clone(),
            auth.clone(),
            file_name.clone(),
            id.clone(),
            current_downloaded_size.clone(),
            total_size.clone(),
        )
        .await
        {
            Ok(res) => {
                return Ok(res);
            }
            Err(e) => {
                if retry_count < 3 {
                    retry_count += 1;
                    let timestamp = Local::now().to_rfc3339_opts(SecondsFormat::Secs, true);
                    let delay_ms: u64 = retry_count.pow(retry_count.try_into().unwrap()) * 1000;
                    tokio::time::sleep(Duration::from_millis(delay_ms)).await;
                    println!(
                        "下载失败重试中... ({}/3), {}, {:?}",
                        retry_count, timestamp, e
                    );
                } else {
                    return Err(e.into());
                }
            }
        }
    }
}

pub async fn download_dir(
    get_files_base_url: String,       // 文件下载地址
    download_files_base_url: String,  // 读取文件夹下文件的 url
    dir_name: String,                 //文件夹名字
    dir_path: String,                 //文件夹在系统内的 path
    local_path: String,               // 本地文件保存路径
    auth: String,                     // 请求头中的 Authorization 字段
    id: String,                       // 文件唯一标识符
    total_file_count: Arc<AtomicU64>, // 总下载数量
) -> Result<(), Box<dyn std::error::Error>> {
    // 支持重试
    let files = get_files(
        get_files_base_url.clone(),
        local_path.clone(),
        dir_name.clone(),
        dir_path.clone(),
        auth.clone(),
    )
    .await?;

    let files_total_size = files.iter().fold(0, |acc, file| acc + file.size);
    let downloaded_size = Arc::new(AtomicU64::new(0));

    // 更新一下总数
    total_file_count.fetch_add(files.len().clone().try_into().unwrap(), Ordering::Relaxed);
    // 记录一下当前已下载数量
    let downloaded_file_count = Arc::new(AtomicU64::new(0));
    for file in files {
        let url = match Url::parse_with_params(
            &download_files_base_url.clone(),
            &[("authorization", auth.clone()), ("path", file.path.clone())],
        ) {
            Ok(url) => url.to_string(),
            Err(err) => {
                return Err(err.into());
            }
        };
        // 获取文件相对于文件夹的路径
        let boxed_dir_path: Box<str> = dir_path.clone().into();
        let file_path_buf = PathBuf::from(&file.path.clone());
        // 因为之前通用的下载函数是分开传递文件所在文件夹和文件名的，所以这里拆一下，文件所在文件夹就是父级地址，文件名可以直接拿到
        let file_name = file.name.clone();
        let file_dir_path = file_path_buf.parent().expect("文件没有父级路径");
        let relative_path = if let Some(path) = diff_paths(&file_dir_path.clone(), &*boxed_dir_path)
        {
            path
        } else {
            return Err("获取相对路径错误".into());
        };

        // 拼接一下下载文件路径
        let mut local_path_buf = PathBuf::from(local_path.clone());
        // 插入根文件夹路径
        local_path_buf.push(&dir_name.clone());
        // 插入当前文件夹相对于根的路径
        local_path_buf.push(&relative_path.display().to_string());
        let local_path = local_path_buf.to_str().unwrap();

        let downloaded_size = downloaded_size.clone();
        let total_file_count = total_file_count.clone();
        let downloaded_file_count = downloaded_file_count.clone();
        let files_total_size = files_total_size.clone();
        let id = id.clone();
        let _id = id.clone();
        let file_name = file_name.clone();
        let auth = auth.clone();
        let url = url.clone();
        let local_path = local_path.to_string().clone();

        DOWNLOAD_CONCURRENT_QUEUE.push(
            move || {
                let rt = tokio::runtime::Runtime::new().unwrap();
                rt.block_on(async {
                    match download(
                        url,
                        local_path,
                        auth,
                        file_name,
                        id.clone(),
                        downloaded_size.clone(),
                        files_total_size,
                    )
                    .await
                    {
                        Ok(_) => {
                            //  +1 并且获取一下值
                            let count = downloaded_file_count.fetch_add(1, Ordering::Relaxed);
                            // 获取的是 +1 前的值，所以手动+1 判断一下是否都下载完毕了
                            if total_file_count.load(Ordering::Relaxed) == count + 1 {
                                DOWNLOAD_COMPLETE_STORE
                                    .lock()
                                    .unwrap()
                                    .add(id.clone(), None);
                            }
                        }
                        Err(err) => {
                            return Err(err);
                        }
                    };
                    Ok(())
                });
            },
            _id.clone(),
        );
    }
    Ok(())
}

#[async_recursion]
async fn get_files(
    url: String,
    local_path: String,
    dir_name: String,
    path: String, // 服务器上存的 path
    auth: String,
) -> Result<Vec<GetFilesResData>, Box<dyn std::error::Error>> {
    // 拼接一下文件夹路径
    let mut local_path_buf = PathBuf::from(local_path.clone());
    local_path_buf.push(dir_name.clone());
    let dir_path = local_path_buf.to_str().unwrap();

    let base_url = url.clone();
    let url = match Url::parse_with_params(
        &url.clone(),
        &[("authorization", auth.clone()), ("path", path.clone())],
    ) {
        Ok(url) => url.to_string(),
        Err(err) => {
            return Err(err.into());
        }
    };

    // 支持重试
    let retry_policy = ExponentialBackoff {
        max_n_retries: 3,
        max_retry_interval: std::time::Duration::from_millis(10000),
        min_retry_interval: std::time::Duration::from_millis(3000),
        backoff_exponent: 2,
    };

    let client = ClientBuilder::new(reqwest::Client::new())
        .with(RetryTransientMiddleware::new_with_policy(retry_policy))
        .build();
    let mut dirs: Vec<GetFilesResData> = vec![];
    let mut files: Vec<GetFilesResData> = vec![];

    match client
        .get(url)
        .timeout(Duration::from_secs(300))
        .bearer_auth(auth.clone())
        .send()
        .await
    {
        Ok(res) => {
            if res.status().is_success() {
                let res_json_str = res.json::<GetFilesRes>().await?;
                for item in res_json_str.data {
                    if item.is_dir {
                        dirs.push(item)
                    } else {
                        files.push(item)
                    }
                }

                for dir in dirs {
                    // 拼接一下当前文件夹完整路径
                    let dir_files = get_files(
                        base_url.clone(),
                        dir_path.to_string().clone(),
                        dir.name.clone(),
                        dir.path.clone(),
                        auth.clone(),
                    )
                    .await?;
                    files.extend(dir_files);
                }
            } else {
                let status = res.status();
                let body = res.text().await?;
                println!("文件夹下载失败: CODE: {}, BODY: {:?}", status, body);
            }
        }
        Err(err) => {
            println!("错误了: {:?}", err);
        }
    };
    Ok(files)
}

#[derive(serde::Deserialize)]
pub struct GetFilesRes {
    data: Vec<GetFilesResData>,
}

#[derive(serde::Deserialize)]
pub struct GetFilesResData {
    #[serde(rename = "isDir")]
    is_dir: bool,
    name: String,
    path: String,
    size: u64,
}
