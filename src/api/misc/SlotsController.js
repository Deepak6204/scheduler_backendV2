import dayjs from 'dayjs';
import getAvailableSlots from '../../utils/GetAvailableSlots.js';
import { getAvailabilitiesByUserId } from '../availability/AvailabilityModel.js';
import { getEventsByHostModel } from '../events/EventModel.js';

export const getFreeSlotsByDate = async (req, res) => {
  try {
    const { userId } = req.params;
    const { date, duration = 30, timezone = 'Asia/Kolkata' } = req.query;

    if (!userId || !date) {
      return res.status(400).json({ error: 'userId and date are required' });
    }

    const dayOfWeek = dayjs(date).format('dddd');
    const weeklyAvailability = await getAvailabilitiesByUserId(userId);
    const dayAvailability = weeklyAvailability.find(
      av => av.dayOfWeek === dayOfWeek && av.isActive
    );
    if (!dayAvailability) {
      return res.status(200).json({ slots: [] }); 
    }

    const availability = {
      start: `${date}T${dayAvailability.startTime}`,
      end: `${date}T${dayAvailability.endTime}`
    };

    const allMeetings = await getEventsByHostModel(userId);
    const meetingsOnDate = allMeetings.filter(meeting =>
      dayjs(meeting.date).isSame(date, 'day')
    );

    const formattedMeetings = meetingsOnDate.map(meeting => ({
      start: `${date}T${meeting.startTime}`,
      end: `${date}T${meeting.endTime}`
    }));

    const availableSlots = getAvailableSlots(
      availability,
      formattedMeetings,
      Number(duration),
      timezone
    );

    return res.status(200).json({ slots: availableSlots });
  } catch (error) {
    console.error('Error fetching slots:', error);
    res.status(500).json({ error: 'Failed to fetch available slots' });
  }
};
