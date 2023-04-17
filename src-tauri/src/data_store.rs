// 导入需要的库
use std::sync::Mutex;
use std::vec::Vec;

// 定义上传进度条项的结构体
#[derive(Clone, serde::Serialize, Debug)]
pub struct UploadProgressItem {
    pub id: String,          // 上传文件的id
    pub progress: f32,       // 上传进度百分比
    pub errors: Vec<String>, // 错误信息数组
}

// 定义上传进度条的存储结构体
#[derive(Clone, serde::Serialize, Debug)]
pub struct UploadProgressStore {
    pub data: Vec<UploadProgressItem>, // 上传进度条项的集合
}

// 为上传进度条的存储结构体添加方法实现
impl UploadProgressStore {
    // 创建一个新的上传进度条存储结构体实例
    pub fn new() -> UploadProgressStore {
        UploadProgressStore { data: Vec::new() }
    }

    // 从上传进度条集合中删除一个指定id的进度条项
    pub fn remove_item(&mut self, id: String) {
        self.data.retain(|item| item.id != id);
    }

    // 向上传进度条集合中添加一个新的进度条项
    pub fn add(&mut self, id: String, progress: Option<f32>, error: Option<String>) {
        if let Some(existing_item) = self.data.iter_mut().find(|i| i.id == id) {
            if let Some(new_progress) = progress {
                existing_item.progress = new_progress;
            }
            if let Some(new_error) = error {
                existing_item.errors.push(new_error);
            }
        } else {
            let mut new_item = UploadProgressItem {
                id: id.clone(),
                progress: progress.unwrap_or(0.0),
                errors: Vec::new(),
            };
            if let Some(new_error) = error {
                new_item.errors.push(new_error);
            }
            self.data.push(new_item.clone());
        }
    }

    // 从上传进度条集合中清空所有的进度条项
    pub fn remove(&mut self) {
        self.data.clear();
    }

    // 添加一个 geterrors 方法，可以传入 id 获取对应的错误
    pub fn get_errors(&self, id: String) -> Option<Vec<String>> {
        if let Some(item) = self.data.iter().find(|i| i.id == id) {
            Some(item.errors.clone())
        } else {
            None
        }
    }

    // 获取上传进度条集合中所有的进度条项
    pub fn get(&self) -> Vec<UploadProgressItem> {
        self.data
            .iter()
            .map(|item| UploadProgressItem {
                id: item.id.to_owned(),
                progress: item.progress,
                errors: item.errors.clone(),
            })
            .collect()
    }
}

// 定义上传完成条目的结构体
#[derive(Clone, serde::Serialize, Debug)]
pub struct UploadCompleteItem {
    id: String,
    pub errors: Vec<String>, // 错误信息数组
}
// 定义上传完成的存储结构体
pub struct UploadCompleteStore {
    pub data: Vec<UploadCompleteItem>, // 上传完成项的集合
}

// 为上传完成的存储结构体添加方法实现
impl UploadCompleteStore {
    // 创建一个新的上传完成存储结构体实例
    pub fn new() -> UploadCompleteStore {
        UploadCompleteStore { data: Vec::new() }
    }

    // 向上传完成集合中添加一个新的上传完成项
    pub fn add(&mut self, id: String, error: Option<String>) {
        let _id = id.clone();
        let mut errors = Vec::new();
        // 取出进度上传中的错误插进去
        let progress_errors = UPLOAD_PROGRESS_STORE
            .lock()
            .unwrap()
            .get_errors(_id.clone());

        if let Some(err) = progress_errors {
            errors.extend(err);
        }
        if let Some(err) = error {
            errors.push(err);
        }

        if !self.data.iter().any(|item| item.id == id) {
            self.data.push(UploadCompleteItem { id, errors });
        } else {
            if let Some(item) = self.data.iter_mut().find(|item| item.id == id) {
                item.errors = errors;
            }
        }

        // 进度内删除该文件
        UPLOAD_PROGRESS_STORE
            .lock()
            .unwrap()
            .remove_item(_id.clone());
    }

    // 从上传完成集合中清空所有的上传完成项
    pub fn remove(&mut self) {
        self.data.clear();
    }

    // 获取上传完成集合中所有的上传完成项的id
    pub fn get(&mut self) -> Vec<UploadCompleteItem> {
        return self.data.clone();
    }
}

// 定义下载进度条项的结构体
#[derive(Clone, serde::Serialize, Debug)]
pub struct DownloadProgressItem {
    pub id: String,          // 下载文件的id
    pub progress: f32,       // 下载进度
    pub errors: Vec<String>, // 错误信息数组
}

// 定义下载进度条的存储结构体
#[derive(Clone, serde::Serialize, Debug)]
pub struct DownloadProgressStore {
    pub data: Vec<DownloadProgressItem>, // 下载进度条项的集合
}

// 为下载进度条的存储结构体添加方法实现
impl DownloadProgressStore {
    // 创建一个新的下载进度条存储结构体实例
    pub fn new() -> DownloadProgressStore {
        DownloadProgressStore { data: Vec::new() }
    }

    // 添加一个 geterrors 方法，可以传入 id 获取对应的错误
    pub fn get_errors(&self, id: String) -> Option<Vec<String>> {
        if let Some(item) = self.data.iter().find(|i| i.id == id) {
            Some(item.errors.clone())
        } else {
            None
        }
    }

    // 从下载进度条集合中删除一个指定id的进度条项
    pub fn remove_item(&mut self, id: String) {
        self.data.retain(|item| item.id != id);
    }

    // 向下载进度条集合中添加一个新的进度条项
    pub fn add(&mut self, id: String, progress: Option<f32>, error: Option<String>) {
        if let Some(existing_item) = self.data.iter_mut().find(|i| i.id == id) {
            if let Some(new_progress) = progress {
                existing_item.progress = new_progress;
            }
            if let Some(new_error) = error {
                existing_item.errors.push(new_error);
            }
        } else {
            let mut new_item = DownloadProgressItem {
                id: id.clone(),
                progress: progress.unwrap_or(0.0),
                errors: Vec::new(),
            };
            if let Some(new_error) = error {
                new_item.errors.push(new_error);
            }
            self.data.push(new_item.clone());
        }
    }

    // 从下载进度条集合中清空所有的进度条项
    pub fn remove(&mut self) {
        self.data.clear();
    }

    // 获取下载进度条集合中所有的进度条项
    pub fn get(&self) -> Vec<DownloadProgressItem> {
        return self.data.clone();
    }
}

// 定义下载完成条目的结构体
#[derive(Clone, serde::Serialize, Debug)]
pub struct DownloadCompleteItem {
    id: String,
    pub errors: Vec<String>, // 错误信息数组
}

// 定义下载完成的存储结构体
pub struct DownloadCompleteStore {
    pub data: Vec<DownloadCompleteItem>, // 下载完成项的集合
}

// 为下载完成的存储结构体添加方法实现
impl DownloadCompleteStore {
    // 创建一个新的下载完成存储结构体实例
    pub fn new() -> DownloadCompleteStore {
        DownloadCompleteStore { data: Vec::new() }
    }

    // 向下载完成集合中添加一个新的下载完成项
    pub fn add(&mut self, id: String, error: Option<String>) {
        let _id = id.clone();
        let mut errors = Vec::new();
        // 取出进度上传中的错误插进去
        let progress_errors = DOWNLOAD_PROGRESS_STORE
            .lock()
            .unwrap()
            .get_errors(_id.clone());

        if let Some(err) = progress_errors {
            errors.extend(err);
        }
        if let Some(err) = error {
            errors.push(err);
        }
        if !self.data.iter().any(|item| item.id == id) {
            self.data.push(DownloadCompleteItem { id, errors });
        } else {
            if let Some(item) = self.data.iter_mut().find(|item| item.id == id) {
                item.errors = errors;
            }
        }

        // 进度内删除该文件
        DOWNLOAD_PROGRESS_STORE.lock().unwrap().remove_item(_id);
    }

    // 从下载完成集合中清空所有的下载完成项
    pub fn remove(&mut self) {
        self.data.clear();
    }

    // 获取下载完成集合中所有的下载完成项的id
    pub fn get(&mut self) -> Vec<DownloadCompleteItem> {
        return self.data.clone();
    }
}

// 使用 lazy_static 宏创建全局变量
lazy_static::lazy_static! {
    // 上传进度条的存储结构体的全局变量
    pub static ref UPLOAD_PROGRESS_STORE: Mutex<UploadProgressStore> = Mutex::new(UploadProgressStore::new());
    // 上传完成的存储结构体的全局变量
    pub static ref UPLOAD_COMPLETE_STORE: Mutex<UploadCompleteStore> = Mutex::new(UploadCompleteStore::new());
    // 下载进度条的存储结构体的全局变量
    pub static ref DOWNLOAD_PROGRESS_STORE: Mutex<DownloadProgressStore> = Mutex::new(DownloadProgressStore::new());
    // 下载完成的存储结构体的全局变量
    pub static ref DOWNLOAD_COMPLETE_STORE: Mutex<DownloadCompleteStore> = Mutex::new(DownloadCompleteStore::new());
}
