/* eslint-disable max-len */
import express from 'express';
import AppointmentController from '../controllers/appointmentController.js';
import {
  appointmentModel,
  userModel,
} from '../models/models.js';

const router = express.Router();
const appointmentController = new AppointmentController(appointmentModel, userModel);

/**
 * @swagger
 * components:
 *   schemas:
 *     NewAppointment:
 *       type: object
 *       properties:
 *         date:
 *           type: string
 *           format: date
 *           description: Appointment date
 *           example: '2023-11-16'
 *         startTime:
 *           type: number
 *           description: Appointment start time
 *           example: 14
 *         doctorUsername:
 *           type: string
 *           description: Doctor's username
 *           example: 'doctorA'
 *         patientUsername:
 *           type: string
 *           description: Patient's username
 *           example: 'patientA'
 *     Appointment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the appointment
 *           example: '507f1f77bcf86cd799439011'
 *         date:
 *           type: string
 *           format: date
 *           description: Appointment date
 *           example: '2023-11-16'
 *         startTime:
 *           type: number
 *           description: Appointment start time
 *           example: 14
 *         doctorUsername:
 *           type: string
 *           description: Doctor's username
 *           example: 'doctorA'
 *         patientUsername:
 *           type: string
 *           description: Patient's username
 *           example: 'patientA'
 *     AvailableDoctors:
 *       type: object
 *       properties:
 *         doctorUsername:
 *           type: string
 *           description: Doctor's username
 *           example: 'doctorA'
 *         availableTimes:
 *           type: array
 *           items:
 *             type: number
 *           description: List of available times for the doctor
 *           example: [9,11,12,13,14,16,17]
 *     TimeSlot:
 *          type: object
 *          properties:
 *              startTime:
 *                  type: number
 *                  description: start time hasn't been selected to availble yet
 *     AppointmentList:
 *          type: array
 *          items:
 *              $ref: '#/components/schemas/Appointment'
 *     TimeSlotList:
 *          type: array
 *          items:
 *              $ref: '#/components/schemas/TimeSlot'
 *     AvailableDoctorsList:
 *          type: array
 *          items:
 *              $ref: '#/components/schemas/AvailableDoctors'
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Response:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Response message
 *           example: OK
 */

/**
 * @swagger
 * /appointments:
 *   get:
 *     tags: [Appointments]
 *     summary: Get all appointments
 *     description: Get a list of all appointments
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               - $ref: '#/components/schemas/Response'
 *               - type: object
 *                 properties:
 *                   appointments:
 *                     $ref: '#/components/schemas/AppointmentList'
 *                     description: List of all appointments
 *             example:
 *               message: OK
 *               appointments: [
 *                 {date: '2023-11-16', startTime: 8, doctorUsername: 'DoctorA', patientUsername: 'PatientA'},
 *                 {date: '2023-11-18', startTime: 10, doctorUsername: 'DoctorA', patientUsername: 'PatientC'},
 *                 {date: '2023-11-20', startTime: 16, doctorUsername: 'DoctorB', patientUsername: ''},
 *               ]
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *             example:
 *               message: Invalid request
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *             example:
 *               message: User not found
 *       401:
 *         description: User not logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *             example:
 *               message: User not logged in
 */
router.get('/', (req, res) => {
  if (req.query.istest === 'true') {
    //   const testAppointmentController = new appointmentController(testUserModel);
    //   testAppointmentController.getAllUsers(req, res);
  } else {
    appointmentController.getAllAppointments(req, res);
  }
});

/**
 * @swagger
 * /appointments/doctorappt:
 *   get:
 *     tags:
 *       - Appointments
 *     summary: Get all appointments for a doctor on a date
 *     description: Get a list of all appointments for a doctor regardless of it's booked or not for a specific date
 *     parameters:
 *       - in: query
 *         name: doctorUsername
 *         schema:
 *           type: string
 *         required: true
 *         example: 'doctorA'
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         example: '2023-11-16'
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
 *                     appointments:
 *                       $ref: '#/components/schemas/AppointmentList'
 *             example:
 *               application/json:
 *                 message: OK
 *                 appointments: [
 *                          {date: '2023-11-16', startTime: 8, doctorUsername: 'DoctorA', patientUsername: 'PatientA'},
 *                          {date: '2023-11-16', startTime: 10, doctorUsername: 'DoctorA', patientUsername: 'PatientB'},
 *                          {date: '2023-11-16', startTime: 15, doctorUsername: 'DoctorA', patientUsername: ''},
 *                          ]
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *             example:
 *               message: Invalid request
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *             example:
 *               message: User not found
 *       401:
 *         description: User not logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *             example:
 *               message: User not logged in
 */
router.get('/doctorappt', (req, res) => {
  if (req.query.istest === 'true') {
    //   const testAppointmentController = new appointmentController(testUserModel);
    //   testAppointmentController.getAllUsers(req, res);
  } else {
    appointmentController.getDoctorAppointments(req, res);
  }
});

/**
 * @swagger
 * /appointments/doctortimeslot:
 *   get:
 *     tags:
 *       - Appointments
 *     summary: Get all time slots that hasn't been selected by the doctor yet on a date
 *     description: Get a list of all time slots for the doctor on a specific date
 *     parameters:
 *       - in: query
 *         name: doctorUsername
 *         schema:
 *           type: string
 *         required: true
 *         example: 'doctorA'
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         example: '2023-11-16'
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
 *                     timeslots:
 *                       $ref: '#/components/schemas/TimeSlotList'
 *             example:
 *               application/json:
 *                 message: OK
 *                 timeslots: [9,11,12,13,14,16,17]
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *             example:
 *               message: Invalid request
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *             example:
 *               message: User not found
 *       401:
 *         description: User not logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *             example:
 *               message: User not logged in
 */
router.get('/doctortimeslot', (req, res) => {
  if (req.query.istest === 'true') {
    //   const testAppointmentController = new appointmentController(testUserModel);
    //   testAppointmentController.getAllUsers(req, res);
  } else {
    appointmentController.getDoctorTimeSlots(req, res);
  }
});

/**
 * @swagger
 * /appointments/newavailability:
 *   post:
 *     tags:
 *       - Appointments
 *     summary: Doctor add new availability for a date
 *     description: Doctor add new availability for a date
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - doctorUsername
 *               - date
 *               - startTime
 *             properties:
 *               doctorUsername:
 *                 type: string
 *                 example: 'doctorA'
 *               date:
 *                 type: string
 *                 format: date
 *                 example: '2023-11-16'
 *               startTime:
 *                 type: number
 *                 example: 11
 *     responses:
 *       201:
 *         description: Availability added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *       400:
 *         description: Invalid request
 */
router.post('/newavailability', (req, res) => {
  if (req.query.istest === 'true') {
    //   const testAppointmentController = new appointmentController(testUserModel);
    //   testAppointmentController.getAllUsers(req, res);
  } else {
    appointmentController.addNewAvailability(req, res);
  }
});

/**
 * @swagger
 * /appointments/patientappt:
 *   get:
 *     tags:
 *       - Appointments
 *     summary: Get all appointments for a patient on a date
 *     description: Get a list of all appointments for a patient for a specific date
 *     parameters:
 *       - in: query
 *         name: patientUsername
 *         schema:
 *           type: string
 *         required: true
 *         example: 'patientA'
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         example: '2023-11-16'
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
 *                     appointments:
 *                       $ref: '#/components/schemas/AppointmentList'
 *             example:
 *               application/json:
 *                 message: OK
 *                 appointments: [
 *                          {date: '2023-11-16', startTime: 8, doctorUsername: 'DoctorA', patientUsername: 'PatientA'},
 *                          {date: '2023-11-16', startTime: 10, doctorUsername: 'DoctorB', patientUsername: 'PatientA'},
 *                          ]
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *             example:
 *               message: Invalid request
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *             example:
 *               message: User not found
 *       401:
 *         description: User not logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *             example:
 *               message: User not logged in
 */
router.get('/patientappt', (req, res) => {
  if (req.query.istest === 'true') {
    //   const testAppointmentController = new appointmentController(testUserModel);
    //   testAppointmentController.getAllUsers(req, res);
  } else {
    appointmentController.getPatientAppointments(req, res);
  }
});

/**
 * @swagger
 * /appointments/getdoctorsavailability:
 *   get:
 *     tags:
 *       - Appointments
 *     summary: Get all doctors and their availabilities on a date for that day
 *     description: Get a list of all doctors and their availabilities on a specific date for that day
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         example: '2023-11-16'
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
 *                     doctors:
 *                       $ref: '#/components/schemas/AvailableDoctorsList'
 *             example:
 *               application/json:
 *                 message: OK
 *                 appointments: [
 *                          {doctorUsername: 'DoctorA', availableTimes: [9,11,12,13,14,16,17]},
 *                          {doctorUsername: 'DoctorB', availableTimes: [12,13,16]},
 *                          ]
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *             example:
 *               message: Invalid request
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *             example:
 *               message: User not found
 *       401:
 *         description: User not logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *             example:
 *               message: User not logged in
 */
router.get('/getdoctorsavailability', (req, res) => {
  if (req.query.istest === 'true') {
    //   const testAppointmentController = new appointmentController(testUserModel);
    //   testAppointmentController.getAllUsers(req, res);
  } else {
    appointmentController.getDoctorsAvailability(req, res);
  }
});

/**
 * @swagger
 * /appointments/newappointment:
 *   post:
 *     tags:
 *       - Appointments
 *     summary: Patient book a new appointment
 *     description: Patient book a new appointment
 *     requestBody:
 *      required: true
 *      content:
 *          application/json:
 *             schema:
 *                $ref: '#/components/schemas/NewAppointment'
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Response'
 *                 - type: object
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *             example:
 *               message: Invalid request
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *             example:
 *               message: User not found
 *       401:
 *         description: User not logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *             example:
 *               message: User not logged in
 */
router.post('/newappointment', (req, res) => {
  if (req.query.istest === 'true') {
    //   const testAppointmentController = new appointmentController(testUserModel);
    //   testAppointmentController.getAllUsers(req, res);
  } else {
    appointmentController.addNewAppointment(req, res);
  }
});

/**
 * @swagger
 * /appointments/deleteappointment:
 *   delete:
 *     tags:
 *       - Appointments
 *     summary: Patient delete an existing appointment
 *     description: Patient delete an existing appointment
 *     parameters:
 *       - in: query
 *         name: patientUsername
 *         schema:
 *           type: string
 *         required: true
 *         example: 'patientA'
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         example: '2023-11-16'
 *       - in: query
 *         name: startTime
 *         schema:
 *           type: number
 *         required: true
 *         example: 11
 *       - in: query
 *         name: doctorUsername
 *         schema:
 *           type: string
 *         required: true
 *         example: 'doctorA'
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Response'
 *                 - type: object
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *             example:
 *               message: Invalid request
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *             example:
 *               message: User not found
 *       401:
 *         description: User not logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *             example:
 *               message: User not logged in
 */
router.delete('/deleteappointment', (req, res) => {
  if (req.query.istest === 'true') {
    //   const testAppointmentController = new appointmentController(testUserModel);
    //   testAppointmentController.getAllUsers(req, res);
  } else {
    appointmentController.deleteAppointment(req, res);
  }
});

/**
 * @swagger
 * /appointments/updateappointment:
 *   put:
 *     tags:
 *       - Appointments
 *     summary: Patient update an existing appointment
 *     description: Patient update an existing appointment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patientUsername
 *               - dateOld
 *               - dateNew
 *               - startTimeOld
 *               - startTimeNew
 *               - doctorUsernameOld
 *               - doctorUsernameNew
 *             properties:
 *               patientUsername:
 *                 type: string
 *                 example: 'patientA'
 *               dateOld:
 *                 type: string
 *                 format: date
 *                 example: '2023-11-16'
 *               dateNew:
 *                 type: string
 *                 format: date
 *                 example: '2023-11-16'
 *               startTimeOld:
 *                 type: number
 *                 example: 11
 *               startTimeNew:
 *                 type: number
 *                 example: 15
 *               doctorUsernameOld:
 *                 type: string
 *                 example: 'doctorA'
 *               doctorUsernameNew:
 *                 type: string
 *                 example: 'doctorB'
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Response'
 *                 - type: object
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *             example:
 *               message: Invalid request
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *             example:
 *               message: User not found
 *       401:
 *         description: User not logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *             example:
 *               message: User not logged in
 */
router.put('/updateappointment', (req, res) => {
  if (req.query.istest === 'true') {
    //   const testAppointmentController = new appointmentController(testUserModel);
    //   testAppointmentController.getAllUsers(req, res);
  } else {
    appointmentController.updateAppointment(req, res);
  }
});

export default router;
