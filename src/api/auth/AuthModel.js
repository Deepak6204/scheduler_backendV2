import pool from '../../config/DatabaseConfig.js';
import bcrypt from 'bcryptjs';

export const getUserByEmail = async (email) => {
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
};

export const createUser = async (userData) => {
  const { name, email, password, phoneNumber } = userData;
  const connection = await pool.getConnection();
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO users (name, email, password, phoneNumber)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await connection.query(query, [name, email, hashedPassword, phoneNumber]);
    return result;
  } catch (err) {
    console.error('Error creating user:', err);
    throw err;
  } finally {
    connection.release();
  }
};

export const comparePassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};