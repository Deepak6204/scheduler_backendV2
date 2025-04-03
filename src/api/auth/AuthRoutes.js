import express from 'express';
import { signup, login } from './AuthController.js';

const router = express.Router();

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Register a new user
 *     description: Allows a user to sign up by providing name, email, password, and phone number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: integer
 *                     email:
 *                       type: string
 *       400:
 *         description: Email already registered
 *       500:
 *         description: Internal server error
 */
router.post('/signup', signup);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login to the application
 *     description: Authenticate the user and generate a JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful with JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         email:
 *                           type: string
 *                         name:
 *                           type: string
 *                         phoneNumber:
 *                           type: string
 *       401:
 *         description: Invalid email or password
 *       500:
 *         description: Internal server error
 */
router.post('/signin', login);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get user profile
 *     description: Returns the user's profile information.
 *     responses:
 *       200:
 *         description: User profile data
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get('/profile', getProfile); // Protect this route

/**
 * @swagger
 * /api/auth/delete:
 *   delete:
 *     summary: Delete user account
 *     description: Permanently deletes the user's account.
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.delete('/delete', deleteUser); // Protect this route

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Send a reset password email
 *     description: Sends a reset password email with a token to the user.
 *     responses:
 *       200:
 *         description: Reset password email sent
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.post('/forgot-password', forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset the user's password
 *     description: Allows the user to reset their password using a reset token.
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       404:
 *         description: User not found or invalid token
 *       500:
 *         description: Internal server error
 */
router.post('/reset-password', resetPassword);

export default router;