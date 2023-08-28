use std::collections::HashSet;
use std::sync::mpsc::{channel, Sender};
use std::sync::{Arc, Mutex, RwLock};
use std::thread;
use std::time::Duration;
use reqwest_retry::{policies::ExponentialBackoff, RetryTransientMiddleware};
use reqwest_middleware::ClientBuilder;
use url::Url;
type Task = Box<dyn FnOnce() + Send>;
// 任务信息枚举类型，包括任务和终止信息
enum Message {
    Task(Task),
    Terminate,
}

pub struct ConcurrentQueue {
    sender: Arc<Mutex<Sender<(Task, String)>>>,
}

lazy_static::lazy_static! {
  pub static ref INVALID_IDS: Arc<RwLock<HashSet<String>>> = Arc::new(RwLock::new(HashSet::new()));
  pub static ref REFRESH_AUTH_TOKEN_URL: Mutex<String> = Mutex::new(String::from(""));
  pub static ref AUTH_TOKEN: Mutex<String> = Mutex::new(String::from(""));
  pub static ref AUTH_TOKEN_LOADING: Mutex<bool> = Mutex::new(false);
}

pub struct TokenStore;

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

impl TokenStore {
  pub async fn refresh_token(token: &str) -> Result<(), Box<dyn std::error::Error>> {
      let mut loading = AUTH_TOKEN_LOADING.lock().unwrap();
      let refresh_token_url = REFRESH_AUTH_TOKEN_URL.lock().unwrap();
      if *loading {
          return Err(Box::new(MyError {
              message: "正在加载中，请稍后重试".to_string(),
          }));
      }

      *loading = true;

      let retry_policy = ExponentialBackoff {
          max_n_retries: 2,
          max_retry_interval: std::time::Duration::from_millis(10000),
          min_retry_interval: std::time::Duration::from_millis(3000),
          backoff_exponent: 2,
      };

      let refresh_url = Url::parse_with_params(
          &refresh_token_url,
          &[("authorization", token)],
      ).map_err(|e| {
          let error_message = format!("刷新 token 失败: {:?}", e);
          eprintln!("{}", error_message);
          MyError {
              message: error_message,
          }
      })?;

      let res = ClientBuilder::new(reqwest::Client::new())
          .with(RetryTransientMiddleware::new_with_policy(retry_policy))
          .build()
          .get(refresh_url)
          .timeout(Duration::from_secs(300))
          .bearer_auth(token.clone())
          .send()
          .await
          .map_err(|e| {
              let error_message = format!("刷新 token 失败: {:?}", e);
              eprintln!("{}", error_message);
              *loading = false;
              MyError {
                  message: error_message,
              }
          })?;

      let mut current_token = AUTH_TOKEN.lock().unwrap();
      *current_token = String::from("new_token");
      *loading = false;

      Ok(())
  }
}

impl ConcurrentQueue {
    // 创建一个并发队列
    pub fn new(concurrency: usize) -> Self {
        let (sender, receiver) = channel::<(Task, String)>();
        let receiver = Arc::new(Mutex::new(receiver));
        for _ in 0..concurrency {
            let receiver = receiver.clone();
            thread::spawn(move || loop {
                let invalid_ids = INVALID_IDS.clone();
                let msg = receiver.lock().unwrap().recv().unwrap();
                let (task, task_id) = msg;

                let task_invalid_ids = invalid_ids.read().unwrap().clone();
                if task_invalid_ids.contains(&task_id) {
                    continue;
                }

                task();
            });
        }
        Self {
            sender: Arc::new(Mutex::new(sender)),
        }
    }

    // 将任务加入队列
    pub fn push<T: FnOnce() + Send + 'static>(&self, task: T, task_id: String) {
        let task = Box::new(task);
        let _ = self.sender.lock().unwrap().send((task, task_id));
    }

    // 停止并发队列
    pub fn stop(&self) {
        let _ = self
            .sender
            .lock()
            .unwrap()
            .send((Box::new(|| {}), String::new()));
    }

    // 添加无效的任务 id
    pub fn add_invalid_ids(&self, task_ids: Vec<String>) {
        let invalid_ids = INVALID_IDS.clone();
        let mut invalid_ids = invalid_ids.write().unwrap();
        for task_id in task_ids {
            invalid_ids.insert(task_id);
        }
    }
}
// 创建一个下载并发队列和一个上传并发队列
// 这里使用了懒加载宏，确保只有在需要使用的时候才会创建队列
lazy_static::lazy_static! {
    pub static ref DOWNLOAD_CONCURRENT_QUEUE: Arc<ConcurrentQueue> = Arc::new(ConcurrentQueue::new(15));
    pub static ref UPLOAD_CONCURRENT_QUEUE: Arc<ConcurrentQueue> = Arc::new(ConcurrentQueue::new(15));
}
