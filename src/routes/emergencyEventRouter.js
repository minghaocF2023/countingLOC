/**
 * @swagger
 * components:
 *   schemas:
 *     EmergencyEvent:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: The emergency event title
 *           example: "Flood"
 *         description:
 *           type: string
 *           description: The emergency event description
 *           example: "Flood in the city"
 *         timestamp:
 *           type: number
 *           description: The emergency event timestamp
 *           example: 1622512800000
 *         location:
 *           type: string
 *           description: The emergency event location
 *           example: "Mountain View, CA 94043, US"
 *         severity:
 *           type: integer
 *           description: The emergency event severity
 *           minimum: 1
 *           maximum: 10
 *           example: 1
 *         range_affected:
 *           type: string
 *           description: The emergency event range affected
 *           example: "5 miles"
 */

/**
 * @swagger
 * /emergency/events:
 *   get:
 *     tags: [Emergency Event]
 *     summary: Get all emergency events
 *     description: Get all emergency events
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Response'
 *                 - type: obejct
 *                   properties:
 *                     events:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/EmergencyEvent'
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Invalid request
 *       403:
 *         description: Invalid request
 *   post:
 *     tags: [Emergency Event]
 *     summary: Create a new emergency event
 *     description: Create a new emergency event
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmergencyEvent'
 *     responses:
 *       201:
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Response'
 *                 - type: obejct
 *                   properties:
 *                     eid:
 *                       type: string
 *                       description: Message ID
 *                       example: 650b635c9d39c281eac33bbf
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Invalid request
 *       403:
 *         description: Invalid request
 * /emergency/events/{id}:
 *   get:
 *     tags: [Emergency Event]
 *     summary: Get an emergency event by id
 *     description: Get an emergency event by id
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           description: Emergency event id
 *         required: true
 *         example: 650b635c9d39c281eac33bbf
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Invalid request
 *       403:
 *         description: Invalid request
 *       404:
 *         description: Invalid request
 *   put:
 *     tags: [Emergency Event]
 *     summary: Update an emergency event by id
 *     description: Update an emergency event by id
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           description: Emergency event id
 *         required: true
 *         example: 650b635c9d39c281eac33bbf
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Invalid request
 *       403:
 *         description: Invalid request
 *       404:
 *         description: Invalid request
 *   delete:
 *     tags: [Emergency Event]
 *     summary: Delete an emergency event by id
 *     description: Delete an emergency event by id
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           description: Emergency event id
 *         required: true
 *         example: 650b635c9d39c281eac33bbf
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Invalid request
 *       403:
 *         description: Invalid request
 *       404:
 *         description: Invalid request
 */
import express from 'express';
import ReportEventController from '../controllers/reportEventController.js';
import { emergencyEventModel, testEmergencyEventModel } from '../models/models.js';

const router = express.Router();

const reportEventController = new ReportEventController(emergencyEventModel);
const testReportEventController = new ReportEventController(testEmergencyEventModel);

router.get('/', (req, res) => {
  if (req.query.istest === 'true') {
    testReportEventController.getEmergencyEvents(req, res);
  } else {
    reportEventController.getEmergencyEvents(req, res);
  }
});

router.post('/', (req, res) => {
  if (req.query.istest === 'true') {
    testReportEventController.createEmergencyEvent(req, res);
  } else {
    reportEventController.createEmergencyEvent(req, res);
  }
});

export default router;
