import pool from '../../config/DatabaseConfig.js';
import bcrypt from 'bcryptjs';
import UuidGen from '../../services/UuidGen.js';

class AuthModel {
  static async getUserByEmail(email) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
      return rows[0];
    } catch (err) {
      console.error('Error fetching user by email:', err);
      throw err;
    } finally {
      connection.release();
    }
  }

  static async createUser({ name, email, password, phoneNumber, connection = null }) {
    let localConnection = connection;
    let isLocalConnection = false;

    if (!connection) {
      localConnection = await pool.getConnection();
      isLocalConnection = true;
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = UuidGen.generateUuidV7Binary();
      const userIdBinary = UuidGen.uuidToBinary(userId);
      const query = `
        INSERT INTO users (user_id, name, email, password, phoneNumber)
        VALUES (?, ?, ?, ?, ?)
      `;
      await localConnection.query(query, [userIdBinary, name, email, hashedPassword, phoneNumber]);
      return { userId, userIdBinary };
    } catch (err) {
      console.error('Error creating user:', err);
      throw err;
    } finally {
      if (isLocalConnection) {
        localConnection.release();
      }
    }
  }

  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async deleteUserByEmail(email) {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.query('DELETE FROM users WHERE email = ?', [email]);
      return result.affectedRows > 0;
    } catch (err) {
      console.error('Error deleting user:', err);
      throw err;
    } finally {
      connection.release();
    }
  }

  static async updatePasswordByEmail(email, hashedPassword) {
    const connection = await pool.getConnection();
    try {
      await connection.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);
    } catch (err) {
      console.error('Error updating password:', err);
      throw err;
    } finally {
      connection.release();
    }
  }
}

export default AuthModel;
