const http = require("http");
// 创建http服务器
const server = http.createServer((req, res) => {
  // 设置响应头信息
  res.writeHead(200, { "Content-Type": "text/plain" });
  // 发送响应消息
  res.end("Hello World!\n");
});

// 启动服务并绑定到端口3003
server.listen(3003, () => {
  console.log("Server is running on port 3003");
});
