use crate::data_store::{
    DownloadCompleteItem, DownloadProgressItem, UploadCompleteItem, UploadProgressItem,
    DOWNLOAD_COMPLETE_STORE, DOWNLOAD_PROGRESS_STORE, UPLOAD_COMPLETE_STORE, UPLOAD_PROGRESS_STORE,
};
use tauri::Window;
use tokio::time::{self, Duration};

#[derive(Clone, serde::Serialize)]
pub struct TransmissionDownloadEmit {
    download_progress: Vec<DownloadProgressItem>,
    download_complete_infos: Vec<DownloadCompleteItem>,
}

#[derive(Clone, serde::Serialize)]
pub struct TransmissionUploadEmit {
    upload_complete_infos: Vec<UploadCompleteItem>,
    upload_progress: Vec<UploadProgressItem>,
}

#[tauri::command]
pub async fn emit_every_second(window: Window) {
    static mut EMIT_ALREADY_STARTED: bool = false;

    if unsafe { EMIT_ALREADY_STARTED } {
        // 如果已经启动过就直接返回
        return;
    }

    unsafe {
        EMIT_ALREADY_STARTED = true;
    }

    // 初始化一个每秒执行一次的定时器
    let mut interval = time::interval(Duration::from_secs(1));
    loop {
        interval.tick().await;
        // 获取上传完成和上传进度存储对象的锁
        let mut upload_complete_store = UPLOAD_COMPLETE_STORE.lock().unwrap();
        let upload_progress_store = UPLOAD_PROGRESS_STORE.lock().unwrap();
        // 获取上传完成和上传进度信息
        let upload_complete_infos = upload_complete_store.get();
        let upload_progress = upload_progress_store.get();

        // 获取下载完成和下载进度存储对象的锁
        let mut download_complete_store = DOWNLOAD_COMPLETE_STORE.lock().unwrap();
        let dwnload_progress_store = DOWNLOAD_PROGRESS_STORE.lock().unwrap();
        // 获取下载完成和下载进度信息
        let download_complete_infos = download_complete_store.get();
        let download_progress = dwnload_progress_store.get();

        // 发送上传数据到前端
        if !upload_complete_infos.is_empty() || !upload_progress.is_empty() {
            match window.emit(
                "tauri://transmission-upload-emit",
                TransmissionUploadEmit {
                    upload_complete_infos: upload_complete_infos,
                    upload_progress: upload_progress,
                },
            ) {
                Ok(res) => res,
                Err(err) => {
                    println!("EMIT ERR: {:?}", err);
                }
            }

            // 将已经发送给前端的数据清空
            upload_complete_store.remove();
        };

        // 发送下载数据到前端
        if !download_progress.is_empty() || !download_complete_infos.is_empty() {
            match window.emit(
                "tauri://transmission-download-emit",
                TransmissionDownloadEmit {
                    download_progress: download_progress,
                    download_complete_infos: download_complete_infos,
                },
            ) {
                Ok(res) => res,
                Err(err) => {
                    println!("EMIT ERR: {:?}", err);
                }
            }

            // 将已经发送给前端的数据清空
            download_complete_store.remove();
        }
    }
}
