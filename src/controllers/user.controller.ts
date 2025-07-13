import { Request, Response } from 'express';
import User from '../models/User';

// একক ইউজার (firebaseUid দিয়ে)
export const getUser = async (req: Request, res: Response) => {
    try {
        const firebaseUid = req.params.id;
        const user = await User.findOne({ firebaseUid })
            .select('username email isOnline avatar firebaseUid')
            .lean();

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Error in getUser:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error', 
            error 
        });
    }
};

// সব ইউজার (কন্টাক্ট লিস্ট)
export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.find()
            .select('username email isOnline avatar firebaseUid')
            .lean();

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        console.error('Error in getAllUsers:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error', 
            error 
        });
    }
};

// MongoDB ObjectId (firebaseUid দিয়ে)
export const getMongoId = async (req: Request, res: Response) => {
    try {
        const { firebaseUid } = req.params;

        const user = await User.findOne({ firebaseUid }).select('_id').lean();

        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }

        res.status(200).json({
            success: true,
            data: { mongoId: user._id }
        });
    } catch (error) {
        console.error('Error in getMongoId:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error', 
            error 
        });
    }
};