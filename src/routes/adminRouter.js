/**
 * @swagger
 * components:
 *   schemas:
 *     Report:
 *       type: object
 *       description: speed test report
 *       properties:
 *         function:
 *           type: string
 *           description: API name
 *           example: /messages/private
 *         type:
 *           type: string
 *           description: API type
 *           example: post
 *         executionTime:
 *           type: int
 *           description: execution time (ms)
 *           example: 200

 */
import express from 'express';

const router = express.Router();

/**
 * @swagger
 * /admin/speedtest:
 *   get:
 *     tags: [Admin]
 *     summary: conduct speed test
 *     description: get the speed test report of each functions
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
 *                      report:
 *                          type: array
 *                          items:
 *                            $ref: '#/components/schemas/Report'
 *
 *
 */
router.get('/speedtest', (req, res) => {
  res.status(501).json({ message: 'Not implemented.' });
});
