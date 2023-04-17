// use crate::data_store::{
//     DownloadProgressItem, UploadProgressItem, DOWNLOAD_COMPLETE_STORE, DOWNLOAD_PROGRESS_STORE,
//     UPLOAD_COMPLETE_STORE, UPLOAD_PROGRESS_STORE,
// };
// use lazy_static::lazy_static;
// use std::sync::Mutex;
// use std::time::{Duration, Instant};
// use tauri::Window;

// #[derive(Clone, serde::Serialize)]
// pub struct TransmissionEmit {
//     upload_complete_ids: Vec<String>,
//     upload_progress: Vec<UploadProgressItem>,
//     download_progress: Vec<DownloadProgressItem>,
//     download_complete_ids: Vec<String>,
// }

// lazy_static! {
//     // 全局节流锁
//     static ref THROTTLE_LOCK: Mutex<()> = Mutex::new(());
//     // 最近一次触发节流的时间
//     static ref LAST_THROTTLE_TIME: Mutex<Instant> = Mutex::new(Instant::now());
// }
// pub fn throttle(interval: Duration, window: Window) {
//     let lock = THROTTLE_LOCK.lock().unwrap_or_else(|e| e.into_inner());
//     let mut last_time = LAST_THROTTLE_TIME.lock().unwrap();
//     let now = Instant::now();
//     let elapsed = now.duration_since(*last_time);

//     let _window = window.clone();
//     let emit = move || {
//         // 执行要发送的代码逻辑
//         let mut upload_complete_store = UPLOAD_COMPLETE_STORE.lock().unwrap();
//         let upload_progress_store = UPLOAD_PROGRESS_STORE.lock().unwrap();
//         let upload_complete_ids = upload_complete_store.get();
//         let upload_progress = upload_progress_store.get();

//         let mut download_complete_store = DOWNLOAD_COMPLETE_STORE.lock().unwrap();
//         let dwnload_progress_store = DOWNLOAD_PROGRESS_STORE.lock().unwrap();
//         let download_complete_ids = download_complete_store.get();
//         let download_progress = dwnload_progress_store.get();

//         _window
//             .emit(
//                 "tauri://transmission-emit",
//                 TransmissionEmit {
//                     upload_complete_ids: upload_complete_ids,
//                     upload_progress: upload_progress,
//                     download_progress: download_progress,
//                     download_complete_ids: download_complete_ids,
//                 },
//             )
//             .unwrap();
//         upload_complete_store.remove();
//         download_complete_store.remove();
//     };

//     if elapsed >= interval {
//         // 如果时间间隔大于等于指定的节流时间，可以直接触发节流函数
//         *last_time = now;
//         emit();
//     }
//     drop(lock); // 手动释放锁避免锁的寿命过长
// }
