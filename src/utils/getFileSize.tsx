export const getFileSize = (size?: number) => {
  if (!size) return "";

  const units = ["B", "KB", "MB", "GB", "TB"];
  let fileSize = size;
  let unitIndex = 0;
  const maxIterations = units.length - 1; // 最大循环次数

  while (fileSize >= 1000 && unitIndex < maxIterations) {
    fileSize /= 1000;
    unitIndex++;
  }

  if (unitIndex >= units.length) {
    // 处理超出单位数组范围的情况
    unitIndex = units.length - 1;
  }

  return `${fileSize.toFixed(2)}${units[unitIndex]}`.replace(".00", "");
};
