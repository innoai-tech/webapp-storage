use std::collections::HashSet;
use std::sync::mpsc::{channel, Sender};
use std::sync::{Arc, Mutex, RwLock};
use std::thread;
type Task = Box<dyn FnOnce() + Send>;
// 任务信息枚举类型，包括任务和终止信息
enum Message {
    Task(Task),
    Terminate,
}

pub struct ConcurrentQueue {
    sender: Arc<Mutex<Sender<(Task, String)>>>,
}

// 全局的无效任务 ID 集合
lazy_static::lazy_static! {
    pub static ref INVALID_IDS: Arc<RwLock<HashSet<String>>> = Arc::new(RwLock::new(HashSet::new()));
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
        println!("id 已添加: {}", task_id);
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
