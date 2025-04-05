import UuidGen from "../../services/UuidGen.js";
import pool from "../../config/DatabaseConfig.js";

class AvailabilityModel {
    static async addMultipleAvailabilities(dataArray, connection = null) {
        let localConnection = connection;
        let isLocalConnection = false;

        if (!connection) {
            localConnection = await pool.getConnection();
            isLocalConnection = true;
        }

        try {
            if (!Array.isArray(dataArray) || dataArray.length === 0) {
                throw new Error('Invalid input: dataArray must be a non-empty array');
            }

            const values = [];
            const placeholders = [];

            dataArray.forEach((entry) => {
                const availabilityId = UuidGen.generateUuidV7Binary();
                const availabilityIdBinary = UuidGen.uuidToBinary(availabilityId);
                const userIdBinary = UuidGen.uuidToBinary(dataArray.userId);

                values.push(
                    availabilityIdBinary,
                    userIdBinary,
                    entry.dayOfWeek,
                    entry.startTime,
                    entry.endTime,
                    entry.isActive ?? true
                );

                placeholders.push('(?, ?, ?, ?, ?, ?)');
            });

            const query = `
                INSERT INTO user_availability (
                    availability_id,
                    user_id,
                    day_of_week,
                    start_time,
                    end_time,
                    is_active
                ) VALUES ${placeholders.join(', ')}
            `;

            await localConnection.query(query, values);
            return true;
        } catch (err) {
            console.error('Error inserting multiple availabilities:', err);
            throw err;
        } finally {
            if (isLocalConnection) {
                localConnection.release();
            }
        }
    }

    static async getAvailabilitiesByUserId(userId) {
        const connection = await pool.getConnection();
        try {
            const userIdBinary = UuidGen.uuidToBinary(userId);
            const [rows] = await connection.query(
                `SELECT 
                    day_of_week AS dayOfWeek,
                    start_time AS startTime,
                    end_time AS endTime,
                    is_active AS isActive
                 FROM user_availability
                 WHERE user_id = ?`,
                [userIdBinary]
            );
            return rows;
        } catch (err) {
            console.error("Error fetching availabilities:", err);
            throw err;
        } finally {
            connection.release();
        }
    }

    static async updateAvailability(availabilityId, updatedData) {
        const connection = await pool.getConnection();
        try {
            const availabilityIdBinary = UuidGen.uuidToBinary(availabilityId);

            const fields = [];
            const values = [];

            if (updatedData.dayOfWeek !== undefined) {
                fields.push("day_of_week = ?");
                values.push(updatedData.dayOfWeek);
            }

            if (updatedData.startTime !== undefined) {
                fields.push("start_time = ?");
                values.push(updatedData.startTime);
            }

            if (updatedData.endTime !== undefined) {
                fields.push("end_time = ?");
                values.push(updatedData.endTime);
            }

            if (updatedData.isActive !== undefined) {
                fields.push("is_active = ?");
                values.push(updatedData.isActive);
            }

            if (fields.length === 0) {
                throw new Error("No fields to update");
            }

            values.push(availabilityIdBinary);

            const query = `
                UPDATE user_availability
                SET ${fields.join(', ')}
                WHERE availability_id = ?
            `;

            await connection.query(query, values);
            return true;
        } catch (err) {
            console.error("Error updating availability:", err);
            throw err;
        } finally {
            connection.release();
        }
    }

    static async deleteAvailability(availabilityId, softDelete = true) {
        const connection = await pool.getConnection();
        try {
            const availabilityIdBinary = UuidGen.uuidToBinary(availabilityId);

            if (softDelete) {
                await connection.query(
                    `UPDATE user_availability SET is_active = false WHERE availability_id = ?`,
                    [availabilityIdBinary]
                );
            } else {
                await connection.query(
                    `DELETE FROM user_availability WHERE availability_id = ?`,
                    [availabilityIdBinary]
                );
            }

            return true;
        } catch (err) {
            console.error("Error deleting availability:", err);
            throw err;
        } finally {
            connection.release();
        }
    }
}

export default AvailabilityModel;
