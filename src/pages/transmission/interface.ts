export interface ITransmission {
  id: string;
  progress: number;
  size: number;
  name: string;
  created: string;

  type: "UPLOAD" | "DOWNLOAD";

  // 路径（包含下载到本地和系统内的)
  path: string;

  // 上传或者下载的 error 信息，因为文件夹实际是多个上传任务，所以存为数组
  errs?: string[];
}
