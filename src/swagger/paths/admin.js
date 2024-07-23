/**
 * @swagger
 * tags:
 *   - name: Admin
 *     description: Admin related endpoints
 */

/**
 * @swagger
 * /admin/login:
 *   post:
 *     summary: Admin login
 *     description: API endpoint for admin login
 *     tags:
 *       - Admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "ttj@duck.com"
 *               password:
 *                 type: string
 *                 example: "12345"
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Bad request
 *       404:
 *         description: Admin not found
 *       401:
 *         description: Invalid password
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /admin:
 *   post:
 *     summary: Create new Admin
 *     description: API endpoint for creating a new admin
 *     tags:
 *       - Admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Admin Name"
 *               email:
 *                 type: string
 *                 example: "admin@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       201:
 *         description: New Admin created successfully
 *       400:
 *         description: Invalid input
 *       409:
 *         description: Admin with this email already exists
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /admin:
 *   get:
 *     summary: Get Admin details
 *     description: API endpoint for getting admin details
 *     tags:
 *       - Admin
 *     responses:
 *       200:
 *         description: Admin found
 *       400:
 *         description: Admin ID is required
 *       404:
 *         description: Admin not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /admin/admin/{id}:
 *   put:
 *     summary: Edit Admin details
 *     description: API endpoint for editing admin details
 *     tags:
 *       - Admin
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "New Admin Name"
 *               email:
 *                 type: string
 *                 example: "newadmin@example.com"
 *               password:
 *                 type: string
 *                 example: "newpassword123"
 *     responses:
 *       200:
 *         description: Admin updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Admin not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /admin/admin/{id}:
 *   delete:
 *     summary: Delete Admin
 *     description: API endpoint for deleting an admin
 *     tags:
 *       - Admin
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the admin
 *     responses:
 *       200:
 *         description: Admin deleted successfully
 *       400:
 *         description: Admin ID is required
 *       404:
 *         description: Admin not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /admin/counsellor:
 *   post:
 *     summary: Create new Counsellor
 *     description: API endpoint for creating a new Counsellor
 *     tags:
 *       - Admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Counsellor Name"
 *               email:
 *                 type: string
 *                 example: "counsellor@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *               experience:
 *                 type: number
 *                 example: 5
 *               mobile:
 *                 type: string
 *                 example: "9876543210"
 *               designation:
 *                 type: string
 *                 example: "Dermatologist"
 *               userType:
 *                 type: string
 *                 example: "counsellor"
 *               counsellorType:
 *                 type: string
 *                 example: "career, behavioral, special needs"
 *     responses:
 *       201:
 *         description: New Counsellor created successfully
 *       400:
 *         description: Invalid input
 *       409:
 *         description: Counsellor with this email already exists
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /admin/student:
 *   post:
 *     summary: Create new Student
 *     description: API endpoint for creating a new Student
 *     tags:
 *       - Admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Student Name"
 *               email:
 *                 type: string
 *                 example: "student@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *               mobile:
 *                 type: string
 *                 example: "9876543210"
 *               designation:
 *                 type: string
 *                 example: "BCA"
 *               userType:
 *                 type: string
 *                 example: "student"
 *               parentContact:
 *                 type: string
 *                 example: "8765432109"
 *     responses:
 *       201:
 *         description: New Student created successfully
 *       400:
 *         description: Invalid input
 *       409:
 *         description: Student with this email already exists
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /admin/student/{id}:
 *   delete:
 *     summary: Delete Student
 *     description: API endpoint for deleting an student
 *     tags:
 *       - Admin
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the student
 *     responses:
 *       200:
 *         description: Student deleted successfully
 *       400:
 *         description: Student ID is required
 *       404:
 *         description: Student not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /admin/student/{id}:
 *   put:
 *     summary: Edit Student details
 *     description: API endpoint for updating student details
 *     tags:
 *       - Admin
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the student
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "New Student Name"
 *               email:
 *                 type: string
 *                 example: "student@example.com"
 *               password:
 *                 type: string
 *                 example: "newpassword123"
 *               mobile:
 *                 type: string
 *                 example: "9876543210"
 *               designation:
 *                 type: string
 *                 example: "BCA"
 *               status:
 *                 type: boolean
 *                 example: true
 *               parentContact:
 *                 type: string
 *                 example: "8765432109"
 *     responses:
 *       200:
 *         description: Admin updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Admin not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /admin/counsellor/{id}:
 *   put:
 *     summary: Edit Counsellor details
 *     description: API endpoint for updating counsellor details
 *     tags:
 *       - Admin
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the counsellor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Counsellor Name"
 *               email:
 *                 type: string
 *                 example: "counsellor@example.com"
 *               status:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Counsellor updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Counsellor not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /admin/list:
 *   get:
 *     summary: List sessions or reports
 *     description: API endpoint for listing users or reports based on type
 *     tags:
 *       - List
 *     parameters:
 *       - name: type
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           enum: [students]
 *         description: Type of data to list (currently only supports "students")
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
 *     responses:
 *       200:
 *         description: Data found
 *       404:
 *         description: No Data found or invalid type
 *       500:
 *         description: Internal Server Error
 */