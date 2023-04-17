use ring::digest::{Context, SHA256};
use std::fs::File;
use std::io::{BufReader, Read};
pub fn get_sha256(filepath: String) -> Result<String, std::io::Error> {
    let f = File::open(&filepath.clone())?;
    let mut reader = BufReader::new(f);

    let mut hasher = Context::new(&SHA256);
    let mut buffer = [0; 1024 * 1024];
    loop {
        let n = reader.read(&mut buffer)?;
        if n == 0 {
            break;
        }
        hasher.update(&buffer[..n]);
    }

    let result = hasher.finish();
    return Ok(hex::encode(result));
}
