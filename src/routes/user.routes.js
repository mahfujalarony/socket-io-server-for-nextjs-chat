"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const router = express_1.default.Router();
router.get('/getAllUsers/:firebaseUid', user_controller_1.getAllUsers);
router.get('/:id', user_controller_1.getUser);
router.get('/getMongoId/:firebaseUid', user_controller_1.getMongoId);
exports.default = router;
