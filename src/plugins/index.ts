import "./tailWind/index";
import "./routes/index";

export const getFileSize = (size: number) => {
  if (size < 1000) return `${size.toFixed(2)}KB`.replace(".00", "");
  if (size < 1000 * 1000) return `${(size / 1000).toFixed(2)}MB`.replace(".00", "");
  if (size < 1000 * 1000 * 1000) return `${(size / 1000 / 1000).toFixed(2)}GB`.replace(".00", "");
  return `${(size / 1000 / 1000 / 1000).toFixed(2)}TB`.replace(".00", "");
};
