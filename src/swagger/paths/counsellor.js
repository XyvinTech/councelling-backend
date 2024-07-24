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

/**
 * @swagger
 * /counsellor/list:
 *   get:
 *     summary: List sessions or reports
 *     description: API endpoint for listing sessions or reports based on type
 *     tags:
 *       - List
 *     parameters:
 *       - name: type
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           enum: [sessions, cases]
 *         description: Type of data to list (currently only supports "sessions", "cases")
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - name: searchQuery
 *         in: query
 *         schema:
 *           type: string
 *         description: Optional search query to filter results
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *         description: Optional status query to filter results
 *     responses:
 *       200:
 *         description: Sessions found
 *       404:
 *         description: No sessions found or invalid type
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /counsellor/accept-session/{id}:
 *   put:
 *     summary: Accept a session
 *     description: API endpoint to accept a session and update its status
 *     tags:
 *       - Session
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the session to accept
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               platform:
 *                 type: string
 *                 example: "Zoom"
 *               link:
 *                 type: string
 *                 example: "https://zoom.us/j/123456789"
 *     responses:
 *       200:
 *         description: Session accepted successfully
 *       400:
 *         description: Session acceptance failed
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /counsellor/counsellors:
 *   get:
 *     summary: Get all counsellors
 *     description: API endpoint to retrieve all counsellors, optionally filtered by type
 *     tags:
 *       - Counsellor
 *     parameters:
 *       - name: counsellorType
 *         in: query
 *         schema:
 *           type: string
 *         description: Filter counsellors by type
 *     responses:
 *       200:
 *         description: Counsellors found
 *       404:
 *         description: No counsellors found
 *       500:
 *         description: Internal Server Error
 */