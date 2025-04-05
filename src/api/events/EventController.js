import EventModel from './EventModel.js';
import pool from '../../config/DatabaseConfig.js';
import UuidGen from '../../services/UuidGen.js';

class EventController {
  static async create(req, res) {

    try {
      const { guestEmail, title, description, startTime, endTime, meeting_url } = req.body;
      const hostId = req.user.userId;
      if (!hostId || !guestEmail || !title || !startTime || !endTime) {
        return res.status(400).json({
          status: 'error',
          message: 'Missing required fields',
        });
      }

      const eventData = await EventModel.createEvent({ hostId, guestEmail, title, description, startTime, endTime, meeting_url });

      return res.status(201).json({
        status: 'success',
        message: 'Event created successfully',
        data: eventData,
      });
    } catch (err) {
      console.error('Error creating event:', err);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  static async update(req, res) {
    const { eventId } = req.params;
    const updatedData = req.body;

    const connection = await pool.getConnection();

    try {
      const success = await EventModel.updateEvent(eventId, updatedData, connection);
      connection.release();

      if (!success) {
        return res.status(404).json({
          status: 'error',
          message: 'Event not found or no updates made',
        });
      }

      return res.status(200).json({
        status: 'success',
        message: 'Event updated successfully',
      });
    } catch (err) {
      connection.release();
      console.error('Error updating event:', err);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  static async delete(req, res) {
    const { eventId } = req.params;
    const hostdata = req.user.userId;

    const connection = await pool.getConnection();

    try {
      const success = await EventModel.deleteEvent(eventId, hostId, connection);
      connection.release();

      if (!success) {
        return res.status(404).json({
          status: 'error',
          message: 'Event not found',
        });
      }

      return res.status(200).json({
        status: 'success',
        message: 'Event deleted successfully',
      });
    } catch (err) {
      connection.release();
      console.error('Error deleting event:', err);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  static async getByHost(req, res) {
    const hostId = req.user.userId;

    try {
      const events = await EventModel.getEventsByHost(hostId);

      const formattedEvents = events.map((event) => ({
        ...event,
        eventId: UuidGen.binaryToUuid(event.eventId),
        hostId: UuidGen.binaryToUuid(event.hostId),
      }));

      return res.status(200).json({
        status: 'success',
        data: formattedEvents,
      });
    } catch (err) {
      console.error('Error fetching events:', err);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  static async getById(req, res) {
    const { eventId } = req.params;

    try {
      const event = await EventModel.getEventById(eventId);

      if (!event) {
        return res.status(404).json({
          status: 'error',
          message: 'Event not found',
        });
      }

      const formattedEvent = {
        ...event,
        eventId: UuidGen.binaryToUuid(event.eventId),
        hostId: UuidGen.binaryToUuid(event.hostId),
      };

      return res.status(200).json({
        status: 'success',
        data: formattedEvent,
      });
    } catch (err) {
      console.error('Error fetching event by ID:', err);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }
}

export default EventController;
