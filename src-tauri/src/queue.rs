use std::sync::mpsc::{channel, Sender};
use std::sync::{Arc, Mutex};
use std::thread;

type Task = Box<dyn FnOnce() + Send>;

// 任务信息枚举类型，包括任务和终止信息
enum Message {
    Task(Task),
    Terminate,
}

// 并发队列结构体
pub struct ConcurrentQueue {
    sender: Arc<Mutex<Sender<Message>>>,
}

impl ConcurrentQueue {
    // 创建一个并发队列
    pub fn new(concurrency: usize) -> Self {
        // 创建消息发送端和接收端
        let (sender, receiver) = channel::<Message>();
        // 将接收端包装在互斥锁中
        let receiver = Arc::new(Mutex::new(receiver));
        // 启动多个工作者线程
        for _ in 0..concurrency {
            let receiver = Arc::clone(&receiver);
            thread::spawn(move || {
                loop {
                    // 等待接收消息
                    let message = receiver.lock().unwrap().recv().unwrap();
                    // 处理不同类型的消息
                    match message {
                        Message::Task(task) => task(),
                        Message::Terminate => break,
                    }
                }
            });
        }
        // 返回一个新的并发队列
        Self {
            sender: Arc::new(Mutex::new(sender)),
        }
    }

    // 将任务加入队列
    pub fn push<T: FnOnce() + Send + 'static>(&self, task: T) {
        let task = Box::new(task);
        let _ = self.sender.lock().unwrap().send(Message::Task(task));
    }

    // 停止并发队列
    pub fn stop(&self) {
        let _ = self.sender.lock().unwrap().send(Message::Terminate);
    }
}

// 创建一个下载并发队列和一个上传并发队列
// 这里使用了懒加载宏，确保只有在需要使用的时候才会创建队列
lazy_static::lazy_static! {
    pub static ref DOWNLOAD_CONCURRENT_QUEUE: Arc<ConcurrentQueue> = Arc::new(ConcurrentQueue::new(15));
    pub static ref UPLOAD_CONCURRENT_QUEUE: Arc<ConcurrentQueue> = Arc::new(ConcurrentQueue::new(15));
}
