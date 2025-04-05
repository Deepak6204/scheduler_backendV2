import express from 'express';
import AvailabilityController from './AvailabilityController.js';
import authMiddleware from '../../middleware/AuthMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Availability
 *   description: API endpoints for user availability
 */

/**
 * @swagger
 * /api/availabilities:
 *   post:
 *     summary: Add multiple availabilities
 *     tags: [Availability]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               availabilities:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                     dayOfWeek:
 *                       type: string
 *                     startTime:
 *                       type: string
 *                     endTime:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *     responses:
 *       201:
 *         description: Availabilities added
 */
router.post('/', authMiddleware(true), AvailabilityController.addMultiple);

/**
 * @swagger
 * /api/availabilities/{userId}:
 *   get:
 *     summary: Get all availabilities for a user
 *     tags: [Availability]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of user availabilities
 */
router.get('/:userId', AvailabilityController.getByUserId);

/**
 * @swagger
 * /api/availabilities/{availabilityId}:
 *   put:
 *     summary: Update an availability
 *     tags: [Availability]
 *     parameters:
 *       - in: path
 *         name: availabilityId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dayOfWeek:
 *                 type: string
 *               startTime:
 *                 type: string
 *               endTime:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Availability updated
 */
router.put('/:availabilityId', AvailabilityController.update);

/**
 * @swagger
 * /api/availabilities/{availabilityId}:
 *   delete:
 *     summary: Delete an availability
 *     tags: [Availability]
 *     parameters:
 *       - in: path
 *         name: availabilityId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: softDelete
 *         schema:
 *           type: boolean
 *         description: If true, mark inactive instead of deleting
 *     responses:
 *       200:
 *         description: Availability deleted
 */
router.delete('/:availabilityId', AvailabilityController.delete);

export default router;