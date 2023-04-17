const fs = require("fs");
const path = require("path");
const imageExtensions = ["jpg", "png", "gif"]; // 支持的图片扩展名
const localPath = "/Users/jinzhuming/Downloads/测试文件夹/内江-35kV东区变电站-底图补充"; // 源文件夹路径
const targetPath = "/Users/jinzhuming/Downloads/测试文件夹/测试图片"; // 目标文件夹路径

// 遍历文件夹及其子文件夹内的所有文件
function traverseFiles(folderPath) {
  const files = fs.readdirSync(folderPath);

  for (const file of files) {
    const filepath = path.join(folderPath, file);

    if (fs.statSync(filepath).isDirectory()) {
      // 如果是文件夹，递归遍历
      traverseFiles(filepath);
    } else {
      // 如果是文件，移动图片至目标文件夹
      const ext = path.extname(file).toLowerCase().substring(1); // 获取文件扩展名（去除前面的点号）
      if (imageExtensions.includes(ext)) {
        // 如果是支持的图片扩展名
        const newpath = targetPath + "/" + file; // 目标文件夹路径 + 原文件名
        fs.renameSync(filepath, newpath);
      }
    }
  }
}

traverseFiles(localPath);
