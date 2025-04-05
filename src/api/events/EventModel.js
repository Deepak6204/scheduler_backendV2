import UuidGen from '../../services/UuidGen.js';
import pool from '../../config/DatabaseConfig.js';

class EventModel {
    static async createEvent({ hostId, guestEmail, title, description, startTime, endTime, meeting_url }) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const eventId = UuidGen.generateUuidV7Binary();
            const eventIdBinary = UuidGen.uuidToBinary(eventId);
            const hostIdBinary = UuidGen.uuidToBinary(hostId);
            startTime = startTime.slice(0, 19).replace('T', ' ');
            endTime = endTime.slice(0, 19).replace('T', ' ');

            const query = `
                INSERT INTO events (
                    event_id, host_id, guest_email, title, description, start_time, end_time, meeting_url
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const values = [
                eventIdBinary,
                hostIdBinary,
                guestEmail,
                title,
                description,
                startTime,
                endTime,
                meeting_url
            ];

            await connection.query(query, values);
            await connection.commit();
            return { eventId, hostId, guestEmail, title, description, startTime, endTime, meeting_url };
        } catch (err) {
            await connection.rollback();
            console.error("Error creating event:", err);
            throw err;
        } finally {
            connection.release();
        }
    }

    static async updateEvent(eventId, updatedData) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const eventIdBinary = UuidGen.uuidToBinary(eventId);

            const fields = [];
            const values = [];

            if (updatedData.title !== undefined) {
                fields.push("title = ?");
                values.push(updatedData.title);
            }
            if (updatedData.description !== undefined) {
                fields.push("description = ?");
                values.push(updatedData.description);
            }
            if (updatedData.startTime !== undefined) {
                fields.push("start_time = ?");
                values.push(updatedData.startTime);
            }
            if (updatedData.endTime !== undefined) {
                fields.push("end_time = ?");
                values.push(updatedData.endTime);
            }
            if (updatedData.meeting_url !== undefined) {
                fields.push("meeting_url = ?");
                values.push(updatedData.meeting_url);
            }

            if (fields.length === 0) {
                throw new Error("No fields to update");
            }

            values.push(eventIdBinary);

            const query = `
                UPDATE events
                SET ${fields.join(', ')}
                WHERE event_id = ?
            `;

            const [result] = await connection.query(query, values);
            await connection.commit();

            return result.affectedRows > 0;
        } catch (err) {
            await connection.rollback();
            console.error("Error updating event:", err);
            throw err;
        } finally {
            connection.release();
        }
    }

    static async deleteEvent(eventId, hostId) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const eventIdBinary = UuidGen.uuidToBinary(eventId);
            const hostIdBinary = UuidGen.uuidToBinary(hostId);

            const [result] = await connection.query(
                `DELETE FROM events WHERE event_id = ? AND host_id = ?`,
                [eventIdBinary, hostIdBinary]
            );

            await connection.commit();
            return result.affectedRows > 0;
        } catch (err) {
            await connection.rollback();
            console.error("Error deleting event:", err);
            throw err;
        } finally {
            connection.release();
        }
    }

    static async getEventsByHost(hostId) {
        const connection = await pool.getConnection();
        try {
            const hostIdBinary = UuidGen.uuidToBinary(hostId);
            const [rows] = await connection.query(
                `SELECT 
                    event_id AS eventId,
                    host_id AS hostId,
                    guest_email AS guestEmail,
                    title,
                    description,
                    start_time AS startTime,
                    end_time AS endTime,
                    meeting_url AS meetingUrl
                 FROM events
                 WHERE host_id = ?
                 ORDER BY start_time ASC`,
                [hostIdBinary]
            );
            return rows;
        } catch (err) {
            console.error("Error fetching events:", err);
            throw err;
        } finally {
            connection.release();
        }
    }

    static async getEventById(eventId) {
        const connection = await pool.getConnection();
        try {
            const eventIdBinary = UuidGen.uuidToBinary(eventId);

            const [rows] = await connection.query(
                `SELECT 
                    event_id AS eventId,
                    host_id AS hostId,
                    guest_email AS guestEmail,
                    title,
                    description,
                    start_time AS startTime,
                    end_time AS endTime
                 FROM events
                 WHERE event_id = ?`,
                [eventIdBinary]
            );
            return rows[0] || null;
        } catch (err) {
            console.error("Error fetching event by ID:", err);
            throw err;
        } finally {
            connection.release();
        }
    }
}

export default EventModel;
