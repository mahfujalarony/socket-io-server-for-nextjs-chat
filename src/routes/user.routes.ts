import express from 'express';
import { getAllUsers, getUser, getMongoId } from '../controllers/user.controller';

const router = express.Router();


router.get('/getAllUsers/:firebaseUid', getAllUsers);
router.get('/:id', getUser);
router.get('/getMongoId/:firebaseUid', getMongoId);

export default router;
