use chrono::Local;
use std::env;
use std::fs::{create_dir_all, OpenOptions};
use std::io::{BufWriter, Write};
use std::path::PathBuf;
#[derive(Clone, serde::Serialize, Debug)]
pub struct Logger {
    pub target_path: String,
    pub file_name: String,
}

impl Logger {
    pub fn init(&self) -> std::io::Result<()> {
        let mut path = PathBuf::new();
        path.push(env::current_dir().unwrap());

        let log_file_path = format!(
            "{}/{}/{}.txt",
            path.to_str().unwrap(),
            self.target_path,
            self.file_name
        );
        println!("{}", log_file_path);
        let file_exists = std::path::Path::new(&log_file_path).exists();

        if file_exists {
            let mut file = OpenOptions::new().append(true).open(log_file_path)?;
            let datetime = Local::now().to_string();
            writeln!(file, "{}", datetime)?;
        } else {
            create_dir_all(&self.target_path)?;
            let mut file = BufWriter::new(
                OpenOptions::new()
                    .write(true)
                    .create(true)
                    .open(log_file_path)?,
            );
            let datetime = Local::now().to_string();
            writeln!(file, "{}\n", datetime)?;
        }

        Ok(())
    }

    pub fn add_log(&self, content: String) -> std::io::Result<()> {
        let mut path = PathBuf::new();
        path.push(env::current_dir().unwrap());

        let log_file_path = format!(
            "{}/{}/{}.txt",
            path.to_str().unwrap(),
            self.target_path,
            self.file_name
        );
        let mut file = OpenOptions::new().append(true).open(log_file_path)?;
        writeln!(file, "{}\n", content)?;

        Ok(())
    }
}
