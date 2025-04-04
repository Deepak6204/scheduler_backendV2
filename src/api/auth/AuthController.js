import jwt from 'jsonwebtoken';
import AuthModel from './AuthModel.js';
import bcrypt from 'bcryptjs';
import { sendResetPasswordEmail } from '../../services/EmailService.js';
import pool from '../../config/DatabaseConfig.js';
import AvModel from '../availability/AvailabilityModel.js';
import UuidGen from '../../services/UuidGen.js';
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

class AuthController {
  static async signup(req, res) {
    const { name, email, password, phoneNumber, availabilities } = req.body;
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const existingUser = await AuthModel.getUserByEmail(email);
      if (existingUser) {
        connection.release();
        return res.status(400).json({
          status: 'error',
          message: 'Email is already registered',
        });
      }

      const { userId, userIdBinary } = await AuthModel.createUser({
        name,
        email,
        password,
        phoneNumber,
        connection,
      });

      if (Array.isArray(availabilities) && availabilities.length > 0) {
        const availabilityWithUserId = availabilities.map(item => ({
          ...item,
          userId,
        }));

        await AvModel.addMultipleAvailabilities(availabilityWithUserId, connection);
      }

      await connection.commit();
      connection.release();

      return res.status(201).json({
        status: 'success',
        message: 'User and availabilities created successfully',
        data: {
          userId,
          email,
        },
      });
    } catch (err) {
      await connection.rollback();
      connection.release();
      console.error('Error during signup:', err);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }


  static async login(req, res) {
    const { email, password } = req.body;

    try {
      const user = await AuthModel.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid email or password',
        });
      }

      const isMatch = await AuthModel.comparePassword(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid email or password',
        });
      }

      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
        expiresIn: '1h',
      });

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
  }

  static async getProfile(req, res) {
    try {
      const user = await AuthModel.getUserByEmail(req.user.email);
      console.log('User:', user); 
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found',
        });
      }

      user.user_id = UuidGen.binaryToUuid(user.user_id);

      return res.status(200).json({
        status: 'success',
        data: {
          id: user.user_id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
        },
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  static async deleteUser(req, res) {
    const { email } = req.user;

    try {
      const user = await AuthModel.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found',
        });
      }

      const deleted = await AuthModel.deleteUserByEmail(email);
      if (!deleted) {
        return res.status(500).json({
          status: 'error',
          message: 'Failed to delete user',
        });
      }

      return res.status(200).json({
        status: 'success',
        message: 'User deleted successfully',
      });
    } catch (err) {
      console.error('Error deleting user:', err);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  static async forgotPassword(req, res) {
    const { email } = req.body;

    try {
      const user = await AuthModel.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found',
        });
      }

      const resetToken = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: '1h' });

      await sendResetPasswordEmail(user.email, resetToken);

      return res.status(200).json({
        status: 'success',
        message: 'Reset password email sent',
      });
    } catch (err) {
      console.error('Error sending reset password email:', err);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  static async resetPassword(req, res) {
    const { token, newPassword } = req.body;

    try {
      const { email } = jwt.verify(token, JWT_SECRET);

      const user = await AuthModel.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found',
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await AuthModel.updatePasswordByEmail(email, hashedPassword);

      return res.status(200).json({
        status: 'success',
        message: 'Password reset successfully',
      });
    } catch (err) {
      console.error('Error resetting password:', err);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }
}

export default AuthController;
