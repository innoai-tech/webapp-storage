const fs = require("fs");
const path = require("path");

const localPath = "/Users/jinzhuming/Downloads/芷泉街";
const targetPath = "/Users/jinzhuming/Downloads/图片";

function moveFiles(sourceDir, targetDir) {
  fs.readdirSync(sourceDir).forEach((file) => {
    const sourceFile = path.join(sourceDir, file);
    const targetFile = path.join(targetDir, file);

    if (fs.statSync(sourceFile).isDirectory()) {
      // 如果是文件夹则递归移动其内部文件
      moveFiles(sourceFile, targetDir);
      // 移动完内部文件后删除空文件夹
      fs.rmdirSync(sourceFile);
    } else {
      // 如果是文件则直接移动
      fs.renameSync(sourceFile, targetFile);
    }
  });
}

moveFiles(localPath, targetPath);
