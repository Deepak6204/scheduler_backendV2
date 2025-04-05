import express from 'express';
import { getFreeSlotsByDate } from './SlotsController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Slots
 *     description: Endpoints related to available time slots
 */


/**
 * @swagger
 * /api/slots/{userId}:
 *   get:
 *     summary: Get available slots for a user on a given day
 *     description: Fetches free time slots for the specified user based on their daily availability and already booked events.
 *     tags:
 *       - Slots
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user whose availability is being queried
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: The date for which slots are being requested (e.g., 2025-04-05)
 *       - in: query
 *         name: duration
 *         required: false
 *         schema:
 *           type: integer
 *         description: Duration (in minutes) for each slot (default is 30)
 *       - in: query
 *         name: timezone
 *         required: false
 *         schema:
 *           type: string
 *         description: Timezone identifier (default is UTC)
 *     responses:
 *       200:
 *         description: List of available time slots
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 slots:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       start:
 *                         type: string
 *                         format: date-time
 *                       end:
 *                         type: string
 *                         format: date-time
 *       400:
 *         description: Bad request (missing required parameters)
 *       500:
 *         description: Server error
 */
router.get('/:userId', getFreeSlotsByDate);

export default router;
