import http from "http";
import app from "./app";
import { connectDB } from "./config/db";
import { initSocket } from "./config/socket";

const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  initSocket(server);

  server.listen(PORT, () => {
    console.log(`🚀 Server listening on http://localhost:${PORT}`);
  });
}

start();
