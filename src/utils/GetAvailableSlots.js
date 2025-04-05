import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore.js';
import isBetween from 'dayjs/plugin/isBetween.js';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrBefore);
dayjs.extend(isBetween);

const BREAK_DURATION = 15;

function getValidChunks(start, end, chunkSize) {
  const chunks = [];
  let slotStart = dayjs(start);

  while (slotStart.add(chunkSize, 'minute').isSameOrBefore(end)) {
    const slotEnd = slotStart.add(chunkSize, 'minute');
    chunks.push({ start: slotStart, end: slotEnd });
    slotStart = slotEnd;
  }

  return chunks;
}

function getAvailableSlots(availability, meetings, chunkSize = 60, timezone = 'UTC') {
  const availableSlots = [];
  let currentStart = dayjs(availability.start);
  const endTime = dayjs(availability.end);

  meetings = meetings
    .map(meeting => ({
      start: dayjs(meeting.start),
      end: dayjs(meeting.end)
    }))
    .sort((a, b) => a.start - b.start);

  // Handle time before first meeting
  for (let i = 0; i < meetings.length; i++) {
    const meeting = meetings[i];
    const nextMeetingStart = meeting.start;

    const freeStart = currentStart;
    const freeEnd = nextMeetingStart;

    if (freeStart.isBefore(freeEnd)) {
      const chunks = getValidChunks(freeStart, freeEnd, chunkSize);
      chunks.forEach(slot => {
        const overlaps = meetings.some(meet =>
          slot.start.isBefore(meet.end) && slot.end.isAfter(meet.start)
        );

        if (!overlaps) {
          availableSlots.push({
            start: slot.start.tz(timezone).format('HH:mm'),
            end: slot.end.tz(timezone).format('HH:mm')
          });
        }
      });
    }

    // Move currentStart to after meeting + break
    currentStart = meeting.end.add(BREAK_DURATION, 'minute');
  }

  // Handle time after last meeting
  if (currentStart.isBefore(endTime)) {
    const chunks = getValidChunks(currentStart, endTime, chunkSize);
    chunks.forEach(slot => {
      const overlaps = meetings.some(meet =>
        slot.start.isBefore(meet.end) && slot.end.isAfter(meet.start)
      );

      if (!overlaps) {
        availableSlots.push({
          start: slot.start.tz(timezone).format('HH:mm'),
          end: slot.end.tz(timezone).format('HH:mm')
        });
      }
    });
  }

  return availableSlots;
}

export default getAvailableSlots;
