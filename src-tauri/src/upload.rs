use crate::crypto::get_sha256;
use crate::data_store::UPLOAD_PROGRESS_STORE;
use chrono::{Local, SecondsFormat};
use futures_util::StreamExt;
use mime_guess::from_path;
use reqwest_middleware::ClientBuilder;
use reqwest_retry::{policies::ExponentialBackoff, RetryTransientMiddleware};
use std::fs::metadata;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Arc;
use std::time::Duration;
use tokio::fs::File;
use tokio_util::io::ReaderStream;
use url::Url;

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
    // 认证信息
    auth: String,
    // 文件ID
    id: String,
    // 已上传长度
    uploaded_len: Arc<AtomicU64>,
    // 文件总长度
    total_len: Arc<AtomicU64>,
    window: tauri::Window,
) -> Result<(), Box<dyn std::error::Error>> {
    // 支持重试
    let retry_policy = ExponentialBackoff {
        max_n_retries: 2,
        max_retry_interval: std::time::Duration::from_millis(10000),
        min_retry_interval: std::time::Duration::from_millis(3000),
        backoff_exponent: 2,
    };

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
    let url = match Url::parse_with_params(
        &url.clone(),
        &[
            ("authorization", auth.clone()),
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
    // 拼接检查对象是否存在的URL
    let check_object_url = match Url::parse_with_params(
        &check_object_url.clone(),
        &[
            ("authorization", auth.clone()),
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

    let res = match ClientBuilder::new(reqwest::Client::new())
        .with(RetryTransientMiddleware::new_with_policy(retry_policy))
        .build()
        .get(check_object_url)
        .timeout(Duration::from_secs(300))
        .bearer_auth(auth.clone())
        .send()
        .await
    {
        Ok(res) => res,
        Err(e) => {
            return Err(Box::new(e));
        }
    };

    // 如果返回码为200，则表示该对象已经存在，则直接做秒传处理
    if res.status().is_success() {
        // 发送上传请求
        match ClientBuilder::new(reqwest::Client::new())
            .with(RetryTransientMiddleware::new_with_policy(retry_policy))
            .build()
            .post(url.as_str().clone())
            .timeout(Duration::from_secs(300))
            .bearer_auth(auth.clone())
            .header("content-type", "application/octet-stream")
            .send()
            .await
        {
            Ok(res) => {
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
                return Err(Box::new(e));
            }
        }
    }

    // 存储一下一共上传的进度，如果上传失败，就把总进度减去这部分进度
    let before_upload_len = Arc::new(AtomicU64::new(0));
    let _before_upload_len = before_upload_len.clone();
    let mut reader_stream = ReaderStream::new(file);
    // 将文件数据流包装为异步流
    let async_stream = async_stream::stream! {
        while let Some(chunk) = reader_stream.next().await {
            if let Ok(chunk) = &chunk {
            let len: u64 = chunk.len() as u64;
            // 保存当前上传进度
            _before_upload_len.fetch_add(len, Ordering::Relaxed);

            let total = _total_len.load(Ordering::Relaxed);
            // 更新已上传长度
            _uploaded_len.fetch_add(len,Ordering::Relaxed);
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
        //上传失败减去本次上传的进度
        let len = before_upload_len.load(Ordering::Relaxed);
        uploaded_len.fetch_sub(len, Ordering::Relaxed);
    };

    // 发送上传请求
    match reqwest::Client::new()
        .post(url.as_str())
        .bearer_auth(auth.clone())
        .header("content-type", "application/octet-stream")
        .body(reqwest::Body::wrap_stream(async_stream))
        .send()
        .await
    {
        Ok(res) => {
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

                reset_upload_len();
                return Err(Box::new(err));
            }
        }
        Err(e) => {
            //上传失败减去本次上传的进度
            reset_upload_len();
            return Err(Box::new(e));
        }
    }
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
    // 认证信息
    auth: String,
    // 文件ID
    id: String,
    // 已上传长度
    uploaded_len: Arc<AtomicU64>,
    // 文件总长度
    total_len: Arc<AtomicU64>,
    window: tauri::Window,
) -> Result<(), Box<dyn std::error::Error>> {
    let mut retry_count: u64 = 0;
    loop {
        match upload_core(
            url.clone(),
            check_object_url.clone(),
            origin_path.clone(),
            local_path.clone(),
            auth.clone(),
            id.clone(),
            uploaded_len.clone(),
            total_len.clone(),
            window.clone(),
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
                    println!("上传失败重试中... ({}/3), {}", retry_count, timestamp);
                } else {
                    println!("彻底失败了");
                    // 重试之后依旧失败也要更新已上传长度
                    let total = total_len.load(Ordering::Relaxed);
                    let file_size = match metadata(local_path.clone()) {
                        Ok(metadata) => metadata.len(),
                        Err(e) => {
                            eprintln!("获取 file size 失败 {:?}", e);
                            return Err(Box::new(e));
                        }
                    };
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
struct MyError {
    message: String,
}

impl std::error::Error for MyError {}

impl std::fmt::Display for MyError {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        write!(f, "{}", self.message)
    }
}
