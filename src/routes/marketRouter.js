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
  } else if (req.query.isspeedtest === 'true') {
    // TODO
    res.status(500).json({ message: 'speedtest' });
  } else {
    medicineController.donateNewMedicine(req, res);
  }
});

// /**
//  * @swagger
//  * /market/requests:
//  *   get:
//  *     tags: [Requests]
//  *     summary: Get all requests
//  *     description: Retrieve a list of all requests
//  *     responses:
//  *       200:
//  *         description: Success
//  *         content:
//  *           application/json:
//  *             schema:
//  *               allOf:
//  *                 - $ref: '#/components/schemas/Response'
//  *                 - type: object
//  *                   properties:
//  *                     medicines:
//  *                       type: array
//  *                       items:
//  *                         $ref: '#/components/schemas/Request'
//  */
// router.get('/requests', (req, res) => {
//   if (req.query.istest === 'true') {
//     testRequestController.getAllRequests(req, res);
//   } else {
//     requestController.getAllRequests(req, res);
//   }
// });

// /**
//  * @swagger
//  * /requests:
//  *   post:
//  *     tags: [Requests]
//  *     summary: Post a new request
//  *     description: Create a new request entry
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             $ref: '#/components/schemas/NewRequest'
//  *     responses:
//  *       201:
//  *         description: Request posted successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               allOf:
//  *                 - $ref: '#/components/schemas/Response'
//  *                 - type: object
//  *                   properties:
//  *                     medicine:
//  *                       $ref: '#/components/schemas/Request'
//  */
// router.post('/requests', (req, res) => {
//   // console.log('route ok2');
//   if (req.query.istest === 'true') {
//     // TODO
//   } else if (req.query.isspeedtest === 'true') {
//     // TODO
//     res.status(500).json({ message: 'speedtest' });
//   } else {
//     requestController.postNewRequest(req, res);
//   }
// });

// /**
//  * @swagger
//  * /market/requests/{username}:
//  *   get:
//  *     tags: [Requests]
//  *     summary: Get all requests from a user
//  *     description: Retrieve a list of request sent by a sepcific user
//  *     responses:
//  *       200:
//  *         description: Success
//  *         content:
//  *           application/json:
//  *             schema:
//  *               allOf:
//  *                 - $ref: '#/components/schemas/Response'
//  *                 - type: object
//  *                   properties:
//  *                     requests:
//  *                       type: array
//  *                       items:
//  *                         $ref: '#/components/schemas/Request'
//  */
// router.post('/requests/:username', (req, res) => {
//   // TODO
// });

// // /**
// //  * @swagger
// //  * /medicines/{medicinename}:
// //  *   put:
// //  *     tags: [Medicines]
// //  *     summary: Modify quantity of selected medicine
// //  *     description: Update the medicine quantity
// //  *     parameters:
// //  *       - $ref: '#/parameters/medicinename'
// //  *     requestBody:
// //  *       required: true
// //  *       content:
// //  *         application/json:
// //  *           schema:
// //  *             type: object
// //  *             required:
// //  *               - quantity
// //  *             properties:
// //  *               quantity:
// //  *                 type: integer
// //  *                 description: The new quantity of the medicine
// //  *     responses:
// //  *       200:
// //  *         description: Success
// //  *         content:
// //  *           application/json:
// //  *             schema:
// //  *              allOf:
// //  *                - $ref: '#/components/schemas/Response'
// //  *                - type: object
// //  *                  properties:
// //  *                   updatedQuantity:
// //  *                     type: integer
// //  *                     example: 500
// //  *       400:
// //  *         description: Invalid request
// //  *         content:
// //  *           application/json:
// //  *             schema:
// //  *               $ref: '#/components/schemas/Response'
// //  *             example:
// //  *               message: Invalid request
// //  *       404:
// //  *         description: Fail to login
// //  *         content:
// //  *           application/json:
// //  *             schema:
// //  *               $ref: '#/components/schemas/Response'
// //  *             example:
// //  *               message: Incorrect username/password
// //  */
// // router.put('/:medicinename', (req, res) => {
// //   // TODO
// // });

// // /**
// //  * @swagger
// //  * /medicines/requests/reject/{requestId}:
// //  *   put:
// //  *     tags: [Medicines]
// //  *     summary: Reject a request
// //  *     description: Reject a request
// //  *     parameters:
// //  *       - in: path
// //  *         name: requestId
// //  *         required: true
// //  *         schema:
// //  *           type: string
// //  *         description: The ID of the request to approve
// //  *     responses:
// //  *       200:
// //  *         description: Request rejected
// //  *         content:
// //  *           application/json:
// //  *             schema:
// //  *               allOf:
// //  *                 - $ref: '#/components/schemas/Response'
// //  *                 - type: object
// //  *                   properties:
// //  *                     message:
// //  *                       type: string
// //  *                       example: Request approved successfully
// //  *       400:
// //  *         description: Invalid request or insufficient medicine stock
// //  *         content:
// //  *           application/json:
// //  *             schema:
// //  *               $ref: '#/components/schemas/Response'
// //  *             example:
// //  *               message: Invalid request or insufficient medicine stock
// //  *       404:
// //  *         description: Request not found
// //  *         content:
// //  *           application/json:
// //  *             schema:
// //  *               $ref: '#/components/schemas/Response'
// //  *             example:
// //  *               message: Request not found
// //  */
// // router.put('/requests/reject/:requestId', (req, res) => {
// //   requestController.rejectRequest(req, res);
// // });

// /**
//  * @swagger
//  * /market/requests/{requestId}:
//  *   put:
//  *     tags: [Requests]
//  *     summary: Update request status
//  *     description: Approves or rejects a request based on the provided status in the request body.
//  *     parameters:
//  *       - in: path
//  *         name: requestId
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: The ID of the request to be updated.
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - status
//  *             properties:
//  *               status:
//  *                 type: string
//  *                 description: The new status of the request (e.g., 'Approved', 'Rejected').
//  *     responses:
//  *       200:
//  *         description: Request status updated successfully.
//  *         content:
//  *           application/json:
//  *             schema:
//  *               allOf:
//  *                 - $ref: '#/components/schemas/Response'
//  *                 - type: object
//  *                   properties:
//  *                     message:
//  *                       type: string
//  *                       example: Request status updated successfully.
//  *       400:
//  *         description: Invalid request or other client error.
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/Response'
//  *             example:
//  *               message: Invalid request or other client error.
//  *       404:
//  *         description: Request not found.
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/Response'
//  *             example:
//  *               message: Request not found.
//  */

// router.put('/medicines/requests/:requestId', (req, res) => {
//   requestController.updateRequest(req, res);
// });

export default router;
