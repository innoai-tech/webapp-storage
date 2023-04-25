#[tauri::command]
pub async fn download_dirs(dirs_json_str: String) {
    // 解析传入的 JSON 字符串
    let params: DownloadDirsParams = serde_json::from_str(&dirs_json_str).unwrap();
    let dirs: Vec<DownloadDirsParamsData> = params.dirs;
    // 遍历文件列表，将每个文件的上传任务加入上传队列
    let get_files_base_url = params.get_files_base_url;
    let download_files_base_url = params.download_files_base_url;
    let local_path = params.local_path;
    let auth = params.auth;
    let downloaded_file_count = Arc::new(AtomicU64::new(0));
    for dir in dirs {
        let id = dir.id.clone();
        let _id = id.clone();
        let create_task_url = dir.create_task_url.clone();
        let get_files_base_url = get_files_base_url.clone();
        let download_files_base_url = download_files_base_url.clone();
        let local_path = local_path.clone();
        let auth = auth.clone();
        let downloaded_file_count = downloaded_file_count.clone();

        UPLOAD_CONCURRENT_QUEUE.push(
            move || {
                let rt = tokio::runtime::Runtime::new().unwrap();
                rt.block_on(async {
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
                        create_task_url.clone(),
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
                })
            },
            _id.clone(),
        );
    }
}
