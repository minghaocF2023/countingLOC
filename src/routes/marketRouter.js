/**
 * @swagger
 * components:
 *   schemas:
 *     Medicinename:
 *       type: string
 *       description: the name of a medicine
 *       example: Medicine 1
 *     NewMedicine:
 *       type: object
 *       description: New medicine entry
 *       required:
 *         - medicinename
 *         - quantity
 *       properties:
 *         medicinename:
 *           $ref: '#/components/schemas/Medicinename'
 *         quantity:
 *           type: integer
 *           description: Quantity of the medicine in stock
 *           example: 100
 *     Medicine:
 *       allOf:
 *         - $ref: '#/components/schemas/NewMedicine'
 *         - type: object
 *           properties:
 *             id:
 *               type: string
 *               description: Unique identifier for the medicine
 *               example: 5f8d4fe168b5b91364f2a234
 *     NewRequest:
 *       type: object
 *       description: New medicine entry
 *       required:
 *         - medicinename
 *         - quantity
 *       properties:
 *         medicinename:
 *           $ref: '#/components/schemas/Medicinename'
 *         quantity:
 *           type: integer
 *           description: Quantity of the medicine in stock
 *           example: 100
 *     Request:
 *        allOf:
 *         - $ref: '#/components/schemas/NewRequest'
 *         - type: object
 *           properties:
 *             id:
 *               type: string
 *               description: Unique identifier for the medicine
 *               example: 5f8d4fe168b5b91364f2a234
 */

/**
 * @swagger
 * parameters:
 *   username:
 *     name: username
 *     in: path
 *     description: Username of a user
 *     required: true
 *     schema:
 *       type: string
 *     example: testUser
 *   medicinename:
 *     name: medicinename
 *     in: path
 *     description: name of a medicine
 *     required: true
 *     schema:
 *       type: string
 *     example: Medicine 1
 */

import express from 'express';
import MedicineController from '../controllers/medicineController.js';
import {
  medicineModel,
  testMedicineModel,
  userModel,
  testUserModel,
} from '../models/models.js';

const router = express.Router();
const medicineController = new MedicineController(medicineModel, userModel);
const testMedicineController = new MedicineController(testMedicineModel, testUserModel);
// eslint-disable-next-line max-len

/**
 * @swagger
 * /market/medicines:
 *   get:
 *     tags: [Medicines]
 *     summary: Get all medicines
 *     description: Retrieve a list of all available medicines
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Response'
 *                 - type: object
 *                   properties:
 *                     medicines:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Medicine'
 */
router.get('/medicines', (req, res) => {
  if (req.query.istest === 'true') {
    testMedicineController.getAllMedicines(req, res);
  } else {
    medicineController.getAllMedicines(req, res);
  }
});

/**
 * @swagger
 * /market/medicines:
 *   post:
 *     tags: [Medicines]
 *     summary: Add a new medicine
 *     description: Create a new medicine entry
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewMedicine'
 *     responses:
 *       201:
 *         description: Medicine created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Response'
 *                 - type: object
 *                   properties:
 *                     medicine:
 *                       $ref: '#/components/schemas/Medicine'
 */
router.post('/medicines', (req, res) => {
  if (req.query.istest === 'true') {
    // TODO
    testMedicineController.donateNewMedicine(req, res);
  } else if (req.query.isspeedtest === 'true') {
    // TODO
    res.status(500).json({ message: 'speedtest' });
  } else {
    medicineController.donateNewMedicine(req, res);
  }
});

router.delete('/medicines', (req, res) => {
  if (req.query.istest === 'true') {
    testMedicineController.deleteMedicine(req, res);
  } else {
    medicineController.deleteMedicine(req, res);
  }
});

export default router;
