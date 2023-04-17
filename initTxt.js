const fs = require("fs");
const os = require("os");
const path = require("path");

// 随机生成一个指定大小的 Buffer
function generateBuffer(size) {
  const buffer = Buffer.alloc(size); // 创建指定大小的 Buffer
  for (let i = 0; i < size; i++) {
    buffer[i] = Math.floor(Math.random() * 256); // 随机初始化每一位
  }
  return buffer;
}

// 随机生成一个指定大小的文件，并将其写入指定目录下的随机子目录中
function generateFile(dir, size) {
  // 随机生成一个目录路径
  const subdir = `${Math.floor(Math.random() * 10)}/${Math.floor(Math.random() * 10)}/${Math.floor(
    Math.random() * 10,
  )}`;
  const filepath = path.join(dir, subdir, `${Date.now()}.txt`); // 创建文件路径
  const buffer = generateBuffer(size);
  fs.mkdirSync(path.dirname(filepath), { recursive: true }); // 创建目录
  fs.writeFileSync(filepath, buffer);
  console.log(`Generated file: ${filepath}`);
}

// 生成 n 个指定大小的文件
function generateFiles(dir, n, minSize, maxSize) {
  for (let i = 0; i < n; i++) {
    const size = Math.floor(Math.random() * (maxSize - minSize + 1) + minSize) * 1024; // 随机生成文件大小
    generateFile(dir, size);
  }
}

// 主程序
const dir = "/Users/jinzhuming/Downloads/测试文件夹2"; // 指定文件夹
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}
generateFiles(dir, 10000, 500, 1000); // 生成 10 个文件，大小在 500KB - 2000KB 之间
