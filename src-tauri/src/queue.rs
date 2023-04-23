use std::collections::HashSet;
use std::sync::mpsc::{channel, Sender};
use std::sync::{Arc, Mutex};
use std::thread;
type Task = Box<dyn FnOnce() + Send>;
// 任务信息枚举类型，包括任务和终止信息
enum Message {
    Task(Task),
    Terminate,
}

pub struct ConcurrentQueue {
    sender: Arc<Mutex<Sender<(Task, String)>>>,
    invalid_ids: Arc<Mutex<HashSet<String>>>,
}

impl ConcurrentQueue {
    // 创建一个并发队列
    pub fn new(concurrency: usize) -> Self {
        // 创建消息发送端和接收端
        let (sender, receiver) = channel::<(Task, String)>();
        // 将接收端包装在互斥锁中
        let receiver = Arc::new(Mutex::new(receiver));
        // 创建无效 id 数组
        let invalid_ids = Arc::new(Mutex::new(HashSet::new()));
        // 启动多个工作者线程
        for _ in 0..concurrency {
            let receiver = Arc::clone(&receiver);
            let invalid_ids = Arc::clone(&invalid_ids);
            thread::spawn(move || {
                loop {
                    // 等待接收消息
                    let msg = receiver.lock().unwrap().recv().unwrap();
                    let (task, task_id) = msg;
                    // 判断当前 task_id 是否在无效的任务 id 数组中
                    if invalid_ids.lock().unwrap().contains(&task_id) {
                        continue;
                    }
                    // 执行任务
                    task();
                }
            });
        }
        // 返回一个新的并发队列
        Self {
            sender: Arc::new(Mutex::new(sender)),
            invalid_ids,
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
        let mut invalid_ids = self.invalid_ids.lock().unwrap();
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
