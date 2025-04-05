import express from 'express';
import EventController from './EventController.js';
import authMiddleware from '../../middleware/AuthMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Events
 *   description: Event management endpoints
 */

/**
 * @swagger
 * /api/events:
 *   post:
 *     summary: Create a new event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [guestEmail, title, startTime, endTime]
 *             properties:
 *               guestEmail:
 *                 type: string
 *                 format: email
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *               meeting_url:
 *                type: string
 *                format: uri
 *     responses:
 *       201:
 *         description: Event created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */
router.post('/', authMiddleware(true), EventController.create);

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: Get all events for the authenticated host
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of events
 *       500:
 *         description: Internal server error
 */
router.get('/', authMiddleware(true), EventController.getByHost);

/**
 * @swagger
 * /api/events/{eventId}:
 *   get:
 *     summary: Get event by ID
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Event details
 *       404:
 *         description: Event not found
 *       500:
 *         description: Internal server error
 */
router.get('/:eventId', authMiddleware(true), EventController.getById);

/**
 * @swagger
 * /api/events/{eventId}:
 *   put:
 *     summary: Update an event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *               meeting_url:
 *                type: string
 *                format: uri
 *     responses:
 *       200:
 *         description: Event updated successfully
 *       404:
 *         description: Event not found
 *       500:
 *         description: Internal server error
 */
router.put('/:eventId', authMiddleware(true), EventController.update);

/**
 * @swagger
 * /api/events/{eventId}:
 *   delete:
 *     summary: Delete an event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *       404:
 *         description: Event not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:eventId', authMiddleware(true), EventController.delete);

export default router;
