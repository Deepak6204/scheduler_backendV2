import { createEventModel, deleteEventModel, getEventByIdModel, getEventsByHostModel, updateEventModel } from './EventModel.js';
import { binaryToUuid } from '../../services/UuidGen.js';

export const createEvent = async (req, res) => {
  try {
    const { guestEmail, title, description, startTime, endTime, meeting_url, date } = req.body;
    const hostId = req.user.userId;

    if (!hostId || !guestEmail || !title || !startTime || !endTime) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields',
      });
    }

    const eventData = await createEvent({ hostId, guestEmail, title, description, startTime, endTime, meeting_url, date });

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
};

export const updateEvent = async (req, res) => {
  const { eventId } = req.params;
  const updatedData = req.body;

  try {
    const success = await updateEvent(eventId, updatedData);

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
    console.error('Error updating event:', err);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

export const deleteEvent = async (req, res) => {
  const { eventId } = req.params;
  const hostId = req.user.userId;

  try {
    const success = await deleteEvent(eventId, hostId);

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
    console.error('Error deleting event:', err);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

export const getEventByHost = async (req, res) => {
  const hostId = req.user.userId;

  try {
    const events = await getEventsByHost(hostId);

    const formattedEvents = events.map((event) => ({
      ...event,
      eventId: binaryToUuid(event.eventId),
      hostId: binaryToUuid(event.hostId),
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
};

export const getEventById = async (req, res) => {
  const { eventId } = req.params;

  try {
    const event = await getEventById(eventId);

    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found',
      });
    }

    const formattedEvent = {
      ...event,
      eventId: binaryToUuid(event.eventId),
      hostId: binaryToUuid(event.hostId),
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
};

