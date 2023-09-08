use crate::crypto::get_sha256;
use crate::data_store::UPLOAD_PROGRESS_STORE;
use crate::queue::{refresh_token, AUTH_TOKEN};
use chrono::{Local, SecondsFormat};
use futures_util::StreamExt;
use mime_guess::from_path;
use reqwest::StatusCode;
use reqwest_middleware::{ClientBuilder, ClientWithMiddleware};
use reqwest_retry::{policies::ExponentialBackoff, RetryTransientMiddleware};
use std::error::Error;
use std::fmt;
use std::fs::metadata;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Arc;
use std::time::Duration;
use tokio::fs::File;
use tokio_util::io::ReaderStream;
use url::Url;

#[derive(Debug)]
struct CustomError {
    status: StatusCode,
    message: String,
}

impl Error for CustomError {}

impl fmt::Display for CustomError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "CustomError: {} - {}", self.status, self.message)
    }
}

// 定义上传函数
pub async fn upload_core(
    // 上传地址url
    url: String,
    // 检查对象是否存在的url
    check_object_url: String,
    // 远程文件路径
    origin_path: String,
    // 本地文件路径
    local_path: String,
    // 文件ID
    id: String,
    // 已上传长度
    uploaded_len: Arc<AtomicU64>,
    // 文件总长度
    total_len: Arc<AtomicU64>,
    window: tauri::Window,
    // 携带一个任务 id
    task_id: Option<String>,
) -> Result<(), Box<dyn std::error::Error>> {
    // 读取 token
    let auth_token_str = AUTH_TOKEN.read().unwrap();

    let _window = window.clone();
    // 克隆文件ID
    let _id = id.clone();
    // 克隆已上传长度
    let _uploaded_len = uploaded_len.clone();
    // 克隆文件总长度
    let _total_len = total_len.clone();
    // 打开文件
    let file = match File::open(local_path.clone()).await {
        Ok(file) => file,
        Err(e) => {
            eprintln!("打开文件失败 {:?}", e);
            return Err(Box::new(e));
        }
    };

    // 获取文件MIME类型
    let content_type = from_path(local_path.clone()).first_or_octet_stream();
    // 获取文件SHA256哈希值
    let sha256 = match get_sha256(local_path.clone()) {
        Ok(hash) => hash,
        Err(e) => {
            eprintln!("获取文件：{} 的sha256失败: {:?}", local_path.clone(), e);
            return Err(Box::new(e));
        }
    };

    // 拼接上传文件URL
    let mut params = vec![
        ("authorization", auth_token_str.clone().to_string()),
        ("path", origin_path.clone()),
        ("SHA256", sha256.clone()),
        ("content-type", content_type.to_string()),
    ];
    if let Some(task_id) = task_id {
        params.push(("taskCode", task_id.to_string()));
    }
    let url = Url::parse_with_params(&url, &params).map_err(|e| {
        eprintln!("获取文件：{} 的sha256失败: {:?}", local_path.clone(), e);
        Box::new(e)
    })?;

    // 支持重试
    let retry_policy = ExponentialBackoff {
        max_n_retries: 2,
        max_retry_interval: std::time::Duration::from_millis(10000),
        min_retry_interval: std::time::Duration::from_millis(3000),
        backoff_exponent: 2,
    };
    let client_retry = ClientBuilder::new(reqwest::Client::new())
        .with(RetryTransientMiddleware::new_with_policy(retry_policy))
        .build();

    // 拼接检查对象是否存在的URL
    let check_object_url = match Url::parse_with_params(
        &check_object_url.clone(),
        &[
            ("authorization", auth_token_str.clone().to_string()),
            ("path", origin_path.clone()),
            ("SHA256", sha256.clone()),
            ("content-type", content_type.to_string()),
        ],
    ) {
        Ok(url) => url,
        Err(e) => {
            eprintln!("获取文件：{} 的sha256失败: {:?}", local_path.clone(), e);
            return Err(Box::new(e));
        }
    };

    // 发送检查请求，添加一个重试机制
    let res = match client_retry
        .get(check_object_url)
        .timeout(Duration::from_secs(300))
        .bearer_auth(auth_token_str.clone().to_string())
        .send()
        .await
    {
        Ok(res) => res,
        Err(e) => {
            eprintln!("检查 SHA256 请求失败: {:?}", e);
            drop(client_retry);
            return Err(Box::new(e));
        }
    };
    if res.status() == StatusCode::UNAUTHORIZED {
        refresh_token(&window);
        let error = CustomError {
            status: res.status(),
            message: format!("401: {:?}", local_path.clone()),
        };

        drop(client_retry);
        return Err(Box::new(error));
    }

    // 如果返回码为200，则表示该对象已经存在，则直接做秒传处理
    if res.status().is_success() {
        // 发送上传请求
        match client_retry
            .post(url.as_str().clone())
            .timeout(Duration::from_secs(300))
            .bearer_auth(auth_token_str.clone().to_string())
            .header("content-type", "application/octet-stream")
            .send()
            .await
        {
            Ok(res) => {
                drop(client_retry);
                if res.status().is_success() || res.status() == 400 {
                    return Ok(());
                } else {
                    let status = res.status();
                    let body = res.text().await?;
                    let err = MyError {
                        message: format!(
                            "秒传失败,状态码 {:?}， body: {:?}， url: {:?}",
                            status,
                            body,
                            url.clone()
                        ),
                    };
                    return Err(Box::new(err));
                }
            }
            Err(e) => {
                drop(client_retry);
                return Err(Box::new(e));
            }
        }
    }

    // 上传客户端，目前重试无法充实上传文件，所以这里不重试
    let client = reqwest::Client::new();
    // 目前发现接口响应错误后，文件流依旧读取记录导致进度不正确，这里处理一下，有响应就关掉 state 停止读取
    let read_file_state = Arc::new(AtomicU64::new(1));
    // 存储一下一共上传的进度，如果上传失败，就把总进度减去这部分进度
    let record_upload_len = Arc::new(AtomicU64::new(0));
    let _record_upload_len = record_upload_len.clone();
    let _read_file_state = read_file_state.clone();
    let mut reader_stream = ReaderStream::new(file);
    // 将文件数据流包装为异步流
    let async_stream = async_stream::stream! {
        while let Some(chunk) = reader_stream.next().await {
            //0停止 1 读取
            if _read_file_state.load(Ordering::Relaxed) == 0 {
                break;
            }

            if let Ok(chunk) = &chunk {
            let len: u64 = chunk.len() as u64;
            // 保存当前上传进度
            _record_upload_len.fetch_add(len, Ordering::Relaxed);

            let total = _total_len.load(Ordering::Relaxed);
            // 更新已上传长度
            _uploaded_len.fetch_add(len, Ordering::Relaxed);
            let new_len = _uploaded_len.load(Ordering::Relaxed);

            UPLOAD_PROGRESS_STORE
                .lock()
                .unwrap()
                .add(
                    _id.clone(),
                    Some(new_len as f32 / total.clone() as f32),
                    None,
                );
            }
            yield chunk;
        }
    };

    let reset_upload_len = move || {
        // 通知文件流停止读取
        read_file_state.store(0, Ordering::Relaxed);

        //减去本次上传的进度(上传中添加的进度只是为了实时展示，上传完毕会重新添加整个文件的进去，就删除上传中的这部分避免重复添加)

        uploaded_len.fetch_sub(record_upload_len.load(Ordering::Relaxed), Ordering::Relaxed);

        // 清空记录的
        record_upload_len.store(0, Ordering::Relaxed);

        // 更新一下前端进度
        let total = total_len.load(Ordering::Relaxed);
        let new_len = uploaded_len.load(Ordering::Relaxed);

        UPLOAD_PROGRESS_STORE.lock().unwrap().add(
            id.clone(),
            Some(new_len as f32 / total.clone() as f32),
            None,
        );
    };

    // 发送上传请求
    let _ = match client
        .post(url.as_str())
        .bearer_auth(auth_token_str.clone().to_string())
        .header("content-type", "application/octet-stream")
        .body(reqwest::Body::wrap_stream(async_stream))
        .send()
        .await
    {
        Ok(res) => {
            drop(client);
            reset_upload_len();
            if res.status().is_success() || res.status() == 400 {
                return Ok(());
            } else {
                let status = res.status();
                let body = res.text().await?;
                let err = MyError {
                    message: format!(
                        "文件上传失败,状态码 {:?}， body: {:?},请求 url: {:?}",
                        status,
                        body,
                        url.clone()
                    ),
                };

                return Err(Box::new(err));
            }
        }
        Err(e) => {
            drop(client);
            reset_upload_len();
            return Err(Box::new(e));
        }
    };
}

pub async fn upload(
    // 上传地址url
    url: String,
    // 检查对象是否存在的url
    check_object_url: String,
    // 文件夹的远程路径
    origin_path: String,
    // 本地文件路径
    local_path: String,
    // 文件ID
    id: String,
    // 已上传长度
    uploaded_len: Arc<AtomicU64>,
    // 文件总长度
    total_len: Arc<AtomicU64>,
    window: tauri::Window,
    // 创建任务
    task_id: Option<String>,
) -> Result<(), Box<dyn std::error::Error>> {
    // 创建这批次任务 ID

    // 获取文件size
    let mut retry_count: u64 = 0;
    let file_size = match metadata(local_path.clone()) {
        Ok(metadata) => metadata.len(),
        Err(e) => {
            eprintln!("获取 file size 失败 {:?}", e);
            return Err(Box::new(e));
        }
    };

    loop {
        match upload_core(
            url.clone(),
            check_object_url.clone(),
            origin_path.clone(),
            local_path.clone(),
            id.clone(),
            uploaded_len.clone(),
            total_len.clone(),
            window.clone(),
            task_id.clone(),
        )
        .await
        {
            Ok(res) => {
                let total = total_len.load(Ordering::Relaxed);
                uploaded_len.fetch_add(file_size, Ordering::Relaxed);
                let new_len = uploaded_len.load(Ordering::Relaxed);
                UPLOAD_PROGRESS_STORE.lock().unwrap().add(
                    id.clone(),
                    Some(new_len.clone() as f32 / total.clone() as f32),
                    None,
                );
                return Ok(res);
            }
            Err(e) => {
                if retry_count < 3 {
                    retry_count += 1;
                    let timestamp = Local::now().to_rfc3339_opts(SecondsFormat::Secs, true);
                    let delay_ms: u64 =
                        retry_count.pow(retry_count.try_into().unwrap()) * 1000 + 2000;
                    tokio::time::sleep(Duration::from_millis(delay_ms)).await;
                    println!("上传失败重试中... ({}/3), {}", retry_count, timestamp);
                } else {
                    let total = total_len.load(Ordering::Relaxed);
                    uploaded_len.fetch_add(file_size, Ordering::Relaxed);
                    let new_len = uploaded_len.load(Ordering::Relaxed);
                    UPLOAD_PROGRESS_STORE.lock().unwrap().add(
                        id.clone(),
                        Some(new_len as f32 / total.clone() as f32),
                        None,
                    );
                    return Err(e);
                }
            }
        }
    }
}

#[derive(Clone, serde::Serialize, Debug)]
pub struct MyError {
    message: String,
}

impl std::error::Error for MyError {}

impl std::fmt::Display for MyError {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        write!(f, "{}", self.message)
    }
}
