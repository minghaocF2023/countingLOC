/**
 * @swagger
 * components:
 *   schemas:
 *     Allergy:
 *       type: string
 *       description: Allergy
 *       example: ibuprofen
 *     Health:
 *       type: string
 *       description: Health condition
 *       example: Lung Cancer
 *     Profile:
 *       type: object
 *       description: user profile
 *       properties:
 *         firstName:
 *           type: string
 *           description: first name
 *           example: Leo
 *         lastName:
 *           type: string
 *           description: last name
 *           example: Bot
 *         profileImage:
 *           type: string
 *           description: profile image url
 *           example: https://cdn.custom-cursor.com/cursors/pack2195.png
 *         birthdate:
 *           type: string
 *           description: user birthdate
 *           example: 01/01/2023
 *         phone:
 *           type: string
 *           description: user phone number
 *           example: 6500000000
 *         email:
 *           type: string
 *           description: user email
 *           example: leobot@andrew.cmu.edu
 *         drugAllergy:
 *           type: array
 *           description: drug allergy list
 *           items:
 *             $ref: '#/components/schemas/Allergy'
 *         healthCondition:
 *           type: array
 *           description: health condition list
 *           items:
 *             $ref: '#/components/schemas/Health'
 *     email:
 *       type: object
 *       description: email
 *       required:
 *         - content
 *       properties:
 *         email:
 *           type: string
 *           description: email to send
 *           example: lalala@andrew.cmu.edu
 *         profile:
 *           description: user profile
 *           $ref: '#/components/schemas/Profile'
 */
import express from 'express';
import MailAlertController from '../controllers/mailAlertController.js';
import { ProfileModel, userModel } from '../models/models.js';

// eslint-disable-next-line new-cap
const mailAlertController = new MailAlertController(new userModel(), new ProfileModel());
/**
 * @swagger
 * /mail:
 *   post:
 *     tags: [Mail]
 *     summary: Send emergency email to someone
 *     description: Send emergency email to someone
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/email'
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *                 - $ref: '#/components/schemas/Response'
 *       404:
 *         description: Not a registered user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *             examples:
 *               userNotFound:
 *                 value:
 *                   message: User not found
 *               bannedUser:
 *                 value:
 *                   message: Banned username
 */
const router = express.Router();
router.post('/', (req, res) => {
  mailAlertController.sendMailAlert(req, res);
});

export default router;
