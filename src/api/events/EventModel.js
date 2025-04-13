import pool from '../../config/DatabaseConfig.js';
import { generateUuidV7Binary, uuidToBinary } from '../../services/UuidGen.js';

export const createEventModel = async ({ hostId, guestEmail, title, description, startTime, endTime, meeting_url, date }) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const eventId = generateUuidV7Binary();
        const eventIdBinary = uuidToBinary(eventId);
        const hostIdBinary = uuidToBinary(hostId);
        startTime = startTime.slice(0, 19).replace('T', ' ');
        endTime = endTime.slice(0, 19).replace('T', ' ');

        const query = `
            INSERT INTO events (
                event_id, host_id, guest_email, title, description, date, start_time, end_time, meeting_url
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            eventIdBinary,
            hostIdBinary,
            guestEmail,
            title,
            description,
            date,
            startTime,
            endTime,
            meeting_url
        ];

        await connection.query(query, values);
        await connection.commit();
        return { eventId, hostId, guestEmail, title, description, date, startTime, endTime, meeting_url };
    } catch (err) {
        await connection.rollback();
        console.error("Error creating event:", err);
        throw err;
    } finally {
        connection.release();
    }
}

export const updateEventModel = async (eventId, updatedData) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const eventIdBinary = uuidToBinary(eventId);

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

export const deleteEventModel = async (eventId, hostId) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const eventIdBinary = uuidToBinary(eventId);
        const hostIdBinary = uuidToBinary(hostId);

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

export const getEventsByHostModel = async (hostId) => {
    const connection = await pool.getConnection();
    try {
        const hostIdBinary = uuidToBinary(hostId);
        const [rows] = await connection.query(
            `SELECT 
                event_id AS eventId,
                host_id AS hostId,
                guest_email AS guestEmail,
                title,
                description,
                date,
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

export const getEventByIdModel = async (eventId) => {
    const connection = await pool.getConnection();
    try {
        const eventIdBinary = uuidToBinary(eventId);

        const [rows] = await connection.query(
            `SELECT 
                event_id AS eventId,
                host_id AS hostId,
                guest_email AS guestEmail,
                title,
                description,
                date,
                start_time AS startTime,
                end_time AS endTime,
                meeting_url AS meetingUrl
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