/**
 * @swagger
 * tags:
 *   - name: Counsellor
 *     description: Counsellor related endpoints
 */

/**
 * @swagger
 * /counsellor/login:
 *   post:
 *     summary: Counsellor login
 *     description: API endpoint for counsellor login
 *     tags:
 *       - Counsellor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "counsellor@example.com"
 *               password:
 *                 type: string
 *                 example: "12345"
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Bad request
 *       404:
 *         description: Counsellor not found
 *       401:
 *         description: Invalid password
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /counsellor:
 *   get:
 *     summary: Get Counsellor details
 *     description: API endpoint for getting counsellor details
 *     tags:
 *       - Counsellor
 *     responses:
 *       200:
 *         description: Counsellor found
 *       400:
 *         description: Counsellor ID is required
 *       404:
 *         description: Counsellor not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /counsellor/times:
 *   post:
 *     summary: Add new times
 *     description: API endpoint for adding new times
 *     tags:
 *       - Counsellor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               day:
 *                 type: string
 *                 example: "Monday"
 *               times:
 *                 type: array
 *                 items:
 *                   type: string
 *                   example: "10:00"
 *     responses:
 *       201:
 *         description: Time created successfully
 *       400:
 *         description: Invalid input or Time creation failed
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /counsellor/times:
 *   get:
 *     summary: Get times
 *     description: API endpoint for retrieving times
 *     tags:
 *       - Counsellor
 *     responses:
 *       200:
 *         description: Times found
 *       404:
 *         description: No times found
 *       500:
 *         description: Internal Server Error
 */
