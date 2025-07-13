import express from "express";
import cors from "cors";
import messageRoutes from "./routes/message.routes";
import userRoutes from "./routes/user.routes";
import conversationRoutes from "./routes/conv.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);
app.use("/api/conversations", conversationRoutes); 

export default app;
