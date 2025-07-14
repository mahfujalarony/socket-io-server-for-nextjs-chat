import express from "express";
import cors from "cors";
import messageRoutes from "./routes/message.routes";
import userRoutes from "./routes/user.routes";
import conversationRoutes from "./routes/conv.routes";

const app = express();

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK", 
    message: "Backend server is running",
    timestamp: new Date().toISOString()
  });
});

app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);
app.use("/api/conversations", conversationRoutes); 

export default app;
