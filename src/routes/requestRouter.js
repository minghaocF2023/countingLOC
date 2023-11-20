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
import RequestController from '../controllers/requestController.js';
import {
  medicineModel,
  testMedicineModel,
  userModel,
  testUserModel,
  requestModel,
  testRequestModel,
} from '../models/models.js';

const router = express.Router();
const medicineController = new MedicineController(medicineModel, userModel);
const testMedicineController = new MedicineController(testMedicineModel, testUserModel);
const requestController = new RequestController(requestModel, medicineModel, userModel);
// eslint-disable-next-line max-len
const testRequestController = new RequestController(testRequestModel, testMedicineModel, testUserModel);

/**
 * @swagger
 * /requests:
 *   get:
 *     tags: [Requests]
 *     summary: Get all requests
 *     description: Retrieve a list of all requests
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
 *                         $ref: '#/components/schemas/Request'
 */
router.get('/', (req, res) => {
  if (req.query.istest === 'true') {
    testRequestController.getAllRequests(req, res);
  } else {
    requestController.getAllRequests(req, res);
  }
});

/**
   * @swagger
   * /requests:
   *   post:
   *     tags: [Requests]
   *     summary: Post a new request
   *     description: Create a new request entry
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/NewRequest'
   *     responses:
   *       201:
   *         description: Request posted successfully
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/Response'
   *                 - type: object
   *                   properties:
   *                     medicine:
   *                       $ref: '#/components/schemas/Request'
   */
router.post('/', (req, res) => {
  if (req.query.istest === 'true') {
    testRequestController.postNewRequest(req, res);
  } else if (req.query.isspeedtest === 'true') {
    // TODO
    res.status(500).json({ message: 'speedtest' });
  } else {
    requestController.postNewRequest(req, res);
  }
});

/**
   * @swagger
   * /requests/{username}:
   *   get:
   *     tags: [Requests]
   *     summary: Get all requests from a user
   *     description: Retrieve a list of request sent by a sepcific user
   *     parameters:
   *       - in: path
   *         name: username
   *         required: true
   *         schema:
   *           type: string
   *         description: The username of the user to retrieve requests for.
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
   *                     requests:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/Request'
   */
router.get('/:username', (req, res) => {
  if (req.query.istest === 'true') {
    testRequestController.getUserRequests(req, res);
  } else if (req.query.isspeedtest === 'true') {
    res.status(500).json({ message: 'speedtest' });
  } else {
    requestController.getUserRequests(req, res);
  }
});

/**
   * @swagger
   * /requests/{requestId}:
   *   put:
   *     tags: [Requests]
   *     summary: Update request status
   *     description: Approves or rejects a request based on the provided status in the request body.
   *     parameters:
   *       - in: path
   *         name: requestId
   *         required: true
   *         schema:
   *           type: string
   *         description: The ID of the request to be updated.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - status
   *             properties:
   *               status:
   *                 type: string
   *                 description: The new status of the request (e.g., 'Approved', 'Rejected').
   *     responses:
   *       200:
   *         description: Request status updated successfully.
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/Response'
   *                 - type: object
   *                   properties:
   *                     message:
   *                       type: string
   *                       example: Request status updated successfully.
   *       400:
   *         description: Invalid request or other client error.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Response'
   *             example:
   *               message: Invalid request or other client error.
   *       404:
   *         description: Request not found.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Response'
   *             example:
   *               message: Request not found.
   */

router.put('/:requestId', (req, res) => {
  if (req.query.istest === 'true') {
    testRequestController.updateRequest(req, res);
  } else if (req.query.isspeedtest === 'true') {
    res.status(500).json({ message: 'speedtest' });
  } else {
    requestController.updateRequest(req, res);
  }
});

export default router;
