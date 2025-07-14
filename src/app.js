"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const message_routes_1 = __importDefault(require("./routes/message.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const conv_routes_1 = __importDefault(require("./routes/conv.routes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Health check endpoint
app.get("/api/health", (req, res) => {
    res.json({
        status: "OK",
        message: "Backend server is running",
        timestamp: new Date().toISOString()
    });
});
app.use("/api/messages", message_routes_1.default);
app.use("/api/users", user_routes_1.default);
app.use("/api/conversations", conv_routes_1.default);
exports.default = app;
