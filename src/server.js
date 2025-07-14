"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const app_1 = __importDefault(require("./app"));
const db_1 = require("./config/db");
const socket_1 = require("./config/socket");
const server = http_1.default.createServer(app_1.default);
const PORT = process.env.PORT || 5000;
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, db_1.connectDB)();
        (0, socket_1.initSocket)(server);
        server.listen(PORT, () => {
            console.log(`🚀 Server listening on http://localhost:${PORT}`);
        });
    });
}
start();
