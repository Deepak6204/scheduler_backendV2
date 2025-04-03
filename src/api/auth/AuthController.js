import jwt from 'jsonwebtoken';
import { createUser, getUserByEmail } from './AuthModel.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

class AuthController {
    static async signup(req, res) {
        const { name, email, password, phoneNumber } = req.body;

        try {
            const existingUser = await getUserByEmail(email);
            if (existingUser) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Email is already registered',
                });
            }

            const newUser = await createUser({ name, email, password, phoneNumber });
            return res.status(201).json({
                status: 'success',
                message: 'User created successfully',
                data: {
                    userId: newUser.insertId,
                    email: email,
                },
            });
        } catch (err) {
            console.error('Error during signup:', err);
            return res.status(500).json({
                status: 'error',
                message: 'Internal server error',
            });
        }
    };

    static async login(req, res) {
        const { email, password } = req.body;

        try {
            const user = await getUserByEmail(email);
            if (!user) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Invalid email or password',
                });
            }

            const isMatch = await comparePassword(password, user.password);
            if (!isMatch) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Invalid email or password',
                });
            }

            const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

            return res.status(200).json({
                status: 'success',
                message: 'Login successful',
                data: {
                    token,
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        phoneNumber: user.phoneNumber,
                    },
                },
            });
        } catch (err) {
            console.error('Error during login:', err);
            return res.status(500).json({
                status: 'error',
                message: 'Internal server error',
            });
        }
    };

    static async getProfile(req, res) {
        try {
            const user = await getUserByEmail(req.user.email);  // Get the user by email (from JWT)

            if (!user) {
                return res.status(404).json({
                    status: 'error',
                    message: 'User not found',
                });
            }

            return res.status(200).json({
                status: 'success',
                data: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phoneNumber: user.phoneNumber,
                },
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Internal server error',
            });
        }
    };

    static async deleteUser(req, res) {
        const { email } = req.user;

        try {
            const user = await getUserByEmail(email);
            if (!user) {
                return res.status(404).json({
                    status: 'error',
                    message: 'User not found',
                });
            }

            // Delete user from database
            const connection = await pool.getConnection();
            const result = await connection.query('DELETE FROM users WHERE email = ?', [email]);
            connection.release();

            return res.status(200).json({
                status: 'success',
                message: 'User deleted successfully',
            });
        } catch (error) {
            console.error('Error deleting user:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Internal server error',
            });
        }
    };

    static async forgotPassword(req, res) {
        const { email } = req.body;

        try {
            const user = await getUserByEmail(email);
            if (!user) {
                return res.status(404).json({
                    status: 'error',
                    message: 'User not found',
                });
            }

            // Create a JWT reset token (expires in 1 hour)
            const resetToken = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: '1h' });

            // Send the reset password email
            await sendResetPasswordEmail(user.email, resetToken);

            return res.status(200).json({
                status: 'success',
                message: 'Reset password email sent',
            });
        } catch (error) {
            console.error('Error sending reset password email:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Internal server error',
            });
        }
    };

    static async resetPassword(req, res) {
        const { token, newPassword } = req.body;

        try {
            // Verify the reset token
            const decoded = jwt.verify(token, JWT_SECRET);
            const { email } = decoded;

            // Check if user exists
            const user = await getUserByEmail(email);
            if (!user) {
                return res.status(404).json({
                    status: 'error',
                    message: 'User not found',
                });
            }

            // Hash the new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Update the user's password
            const connection = await pool.getConnection();
            await connection.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);
            connection.release();

            return res.status(200).json({
                status: 'success',
                message: 'Password reset successfully',
            });
        } catch (error) {
            console.error('Error resetting password:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Internal server error',
            });
        }
    };


}

export default AuthController;