use std::collections::HashSet;
use std::sync::mpsc::{channel, Sender};
use std::sync::{Arc, Mutex, RwLock};
use std::thread;
type Task = Box<dyn FnOnce() + Send>;
use isahc::{config::RedirectPolicy, prelude::*, HttpClient};
use std::time::Duration;
use tokio::sync::Semaphore;
// 任务信息枚举类型，包括任务和终止信息
pub struct ConcurrentQueue {
    sender: Arc<Mutex<Sender<(Task, String)>>>,
}

lazy_static::lazy_static! {
  pub static ref INVALID_IDS: Arc<RwLock<HashSet<String>>> = Arc::new(RwLock::new(HashSet::new()));
  pub static ref REFRESH_AUTH_TOKEN_URL: Mutex<String> = Mutex::new(String::from(""));
  pub static ref AUTH_TOKEN: Arc<RwLock<String>> = Arc::new(RwLock::new(String::from("")));
  pub static ref GET_AUTH_TOKEN_LOADING: Mutex<bool> = Mutex::new(false);
  pub static ref QUEUE_PERMIT: Arc<Semaphore> = Arc::new(Semaphore::new(15));
}

pub fn refresh_token(window: &tauri::Window) {
    let mut lock = GET_AUTH_TOKEN_LOADING.lock().unwrap(); // 获取读锁
    if *lock {
        return;
    }
    *lock = true;
    match window.emit("tauri://refresh_token", "") {
        Ok(res) => {
            println!("EMIT RES: {:?}", res);
        }
        Err(err) => {
            println!("EMIT ERR: {:?}", err);
        }
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
                let msg = receiver.lock().unwrap().recv().unwrap();
                let (task, task_id) = msg;

                task();
            });
        }
        Self {
            sender: Arc::new(Mutex::new(sender)),
        }
    }

    // 将任务加入队列
    pub async fn push<T: FnOnce() + Send + 'static>(&self, task: T, task_id: String) {
        let semaphore_permit = QUEUE_PERMIT.acquire().await.unwrap();
        let id = task_id.clone();
        let task = Box::new(move || {
            let invalid_ids = INVALID_IDS.clone();

            let task_invalid_ids = invalid_ids.read().unwrap().clone();
            println!("准备执行任务");
            if task_invalid_ids.contains(&id) == false {
                task();
            }
            drop(semaphore_permit);
        });
        self.sender.lock().unwrap().send((task, task_id));
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

lazy_static::lazy_static! {
    pub static ref DOWNLOAD_CONCURRENT_QUEUE: Arc<ConcurrentQueue> = Arc::new(ConcurrentQueue::new(15));
    pub static ref UPLOAD_CONCURRENT_QUEUE: Arc<ConcurrentQueue> = Arc::new(ConcurrentQueue::new(15));
    pub static ref CLIENT_RETRY: HttpClient = {
       // 支持重试
       let client = match HttpClient::builder()
       .timeout(Duration::from_secs(300))
       .redirect_policy(RedirectPolicy::Follow)

       .build() {
           Ok(client) => client,
           Err(err) => panic!("Failed to create HTTP client: {}", err),
       };
   client

    };
}
