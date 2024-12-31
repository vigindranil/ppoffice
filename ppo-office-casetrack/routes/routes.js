// routes/routes.js

const express = require('express');
const router = express.Router();


// custom middleware
const authMiddleware = require('../middlewares/authMiddleware');

// show all district
// const districtController = require('../controllers/districtController');
// router.get('/api/alldistrict', authMiddleware.verifyToken, districtController.show);
// router.get('/api/showallCasesBydistrictId',authMiddleware.verifyToken,districtController.showallcasesBydistrict);
const districtController = require('../controllers/districtController');


/**
 * @swagger
 * /api/alldistrict:
 *   get:
 *     summary: Get all districts
 *     description: Returns a list of all districts. Requires a valid token for authentication.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of districts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: "District A"
 *       401:
 *         description: Unauthorized access
 */
router.get('/api/alldistrict', authMiddleware.verifyToken, districtController.show);

/**
 * @swagger
 * /api/showallCasesBydistrictId:
 *   get:
 *     summary: Get all cases by district ID
 *     description: Returns a list of all cases associated with a specific district ID. Requires a valid token for authentication.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: districtId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the district
 *     responses:
 *       200:
 *         description: List of cases retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   caseId:
 *                     type: integer
 *                     example: 101
 *                   caseName:
 *                     type: string
 *                     example: "Case X"
 *       400:
 *         description: Invalid district ID
 *       401:
 *         description: Unauthorized access
 */
router.get('/api/showallCasesBydistrictId', authMiddleware.verifyToken, districtController.showallcasesBydistrict);



//user login
// const authController = require('../controllers/authController');
// router.post('/api/authenticate', authController.authenticateUser);



const authController = require('../controllers/authController');

/**
 * @swagger
 * /api/authenticate:
 *   post:
 *     summary: Authenticate user
 *     description: Authenticates a user and returns a JWT token upon successful login.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: The user's username
 *                 example: "user123"
 *               password:
 *                 type: string
 *                 description: The user's password
 *                 example: "mypassword"
 *     responses:
 *       200:
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: The JWT token
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid username or password"
 */
router.post('/api/authenticate', authController.authenticateUser);



// const ppuserController = require('../controllers/PPuserController');
// router.post('/api/addppUser', authMiddleware.verifyToken,ppuserController.createPPUser); //create ppstaff by ppadmin
// router.get('/api/getppuser', authMiddleware.verifyToken,ppuserController.showppuser); // show ppuser
// router.get('/api/caseDetailsByPPuserId', authMiddleware.verifyToken,ppuserController.caseDetailsByPPuserId); // show ppstaffdetails by Id
// router.post('/api/assigncase', authMiddleware.verifyToken,ppuserController.assignCasetoppuser); // show ppstaffdetails by Id
// router.get('/api/getppuserDetailsById', authMiddleware.verifyToken,ppuserController.getppuserDetailsById);


// const authMiddleware = require('../middlewares/authMiddleware');
const ppuserController = require('../controllers/PPuserController');

/**
 * @swagger
 * /api/addppUser:
 *   post:
 *     summary: Add PP User
 *     description: Creates a new PP staff by a PP admin. Requires authentication.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the PP user
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 description: Email of the PP user
 *                 example: "johndoe@example.com"
 *               role:
 *                 type: string
 *                 description: Role of the PP user
 *                 example: "PP Staff"
 *             required:
 *               - name
 *               - email
 *               - role
 *     responses:
 *       201:
 *         description: PP user created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "PP user created successfully."
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     email:
 *                       type: string
 *                       example: "johndoe@example.com"
 *                     role:
 *                       type: string
 *                       example: "PP Staff"
 *       400:
 *         description: Bad request due to missing or invalid data
 *       401:
 *         description: Unauthorized access, invalid or expired token
 *       500:
 *         description: Server error
 */
router.post('/api/addppUser', authMiddleware.verifyToken, ppuserController.createPPUser);

/**
 * @swagger
 * /api/getppuser:
 *   get:
 *     summary: Get all PP users
 *     description: Retrieves a list of all PP users. Requires authentication.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: A list of PP users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: "John Doe"
 *                   email:
 *                     type: string
 *                     example: "johndoe@example.com"
 *                   role:
 *                     type: string
 *                     example: "PP Staff"
 *       401:
 *         description: Unauthorized access, invalid or expired token
 *       500:
 *         description: Server error
 */
router.get('/api/getppuser', authMiddleware.verifyToken, ppuserController.showppuser);

/**
 * @swagger
 * /api/caseDetailsByPPuserId:
 *   get:
 *     summary: Get case details by PP user ID
 *     description: Retrieves case details associated with a specific PP user ID. Requires authentication.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: query
 *         description: PP user ID
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Case details for the specified PP user ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: integer
 *                   example: 1
 *                 cases:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       caseId:
 *                         type: integer
 *                         example: 101
 *                       caseName:
 *                         type: string
 *                         example: "Case Name Example"
 *       400:
 *         description: Bad request if ID is not provided
 *       401:
 *         description: Unauthorized access, invalid or expired token
 *       500:
 *         description: Server error
 */
router.get('/api/caseDetailsByPPuserId', authMiddleware.verifyToken, ppuserController.caseDetailsByPPuserId);

/**
 * @swagger
 * /api/assigncase:
 *   post:
 *     summary: Assign case to PP user
 *     description: Assign a case to a PP user. Requires authentication.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ppUserId:
 *                 type: integer
 *                 description: PP user ID
 *                 example: 1
 *               caseId:
 *                 type: integer
 *                 description: Case ID to be assigned
 *                 example: 101
 *     responses:
 *       200:
 *         description: Case assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Case assigned to PP user successfully."
 *       400:
 *         description: Bad request due to missing or invalid data
 *       401:
 *         description: Unauthorized access, invalid or expired token
 *       500:
 *         description: Server error
 */
router.post('/api/assigncase', authMiddleware.verifyToken, ppuserController.assignCasetoppuser);

/**
 * @swagger
 * /api/getppuserDetailsById:
 *   get:
 *     summary: Get PP user details by ID
 *     description: Retrieves detailed information about a PP user based on their ID. Requires authentication.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: query
 *         description: PP user ID
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Detailed PP user information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: "John Doe"
 *                 email:
 *                   type: string
 *                   example: "johndoe@example.com"
 *                 role:
 *                   type: string
 *                   example: "PP Staff"
 *                 casesAssigned:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       caseId:
 *                         type: integer
 *                         example: 101
 *                       caseName:
 *                         type: string
 *                         example: "Case Name Example"
 *       400:
 *         description: Bad request if ID is not provided
 *       401:
 *         description: Unauthorized access, invalid or expired token
 *       500:
 *         description: Server error
 */
router.get('/api/getppuserDetailsById', authMiddleware.verifyToken, ppuserController.getppuserDetailsById);
// password reset
// const passwordfController = require('../controllers/resetpassword');
// router.post('/api/changepassword', authMiddleware.verifyToken,passwordfController.resetPassword);

const passwordfController = require('../controllers/resetpassword');

/**
 * @swagger
 * /api/changepassword:
 *   post:
 *     summary: Change Password
 *     description: Allows an authenticated user to change their password.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 description: The current password of the user.
 *                 example: "old_password123"
 *               newPassword:
 *                 type: string
 *                 description: The new password to set.
 *                 example: "new_password456"
 *     responses:
 *       200:
 *         description: Password changed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password changed successfully."
 *       400:
 *         description: Invalid request or incorrect old password.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid old password."
 *       401:
 *         description: Unauthorized access.
 */
router.post('/api/changepassword', authMiddleware.verifyToken, passwordfController.resetPassword);

// case assisgn
// const CaseController = require('../controllers/caseController');

// router.get('/api/getcasetype', authMiddleware.verifyToken,CaseController.getcasetype);
// router.get("/api/caseDetailsById",authMiddleware.verifyToken,CaseController.getCaseById);
// router.get("/api/showRefferenceDetails",authMiddleware.verifyToken,CaseController.showRefference);
// router.post("/api/addCase",authMiddleware.verifyToken,CaseController.createCase); // firsttime create case by ppOffice
// router.get("/api/showallCase",authMiddleware.verifyToken,CaseController.showallCase); // firsttime create case by ppOffice
// router.post("/api/showallCaseBetweenRange",authMiddleware.verifyToken,CaseController.showallCaseBetweenRange);


const CaseController = require('../controllers/caseController');

/**
 * @swagger
 * /api/getcasetype:
 *   get:
 *     summary: Get Case Types
 *     description: Retrieve a list of all case types.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of case types retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: "Criminal Case"
 */
router.get('/api/getcasetype', authMiddleware.verifyToken, CaseController.getcasetype);

/**
 * @swagger
 * /api/caseDetailsById:
 *   get:
 *     summary: Get Case Details by ID
 *     description: Retrieve case details using a specific case ID.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: caseId
 *         in: query
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the case to retrieve.
 *     responses:
 *       200:
 *         description: Case details retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 caseType:
 *                   type: string
 *                   example: "Criminal Case"
 */
router.get("/api/caseDetailsById", authMiddleware.verifyToken, CaseController.getCaseById);

/**
 * @swagger
 * /api/showRefferenceDetails:
 *   get:
 *     summary: Get Reference Details
 *     description: Retrieve reference details associated with a case.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Reference details retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   referenceName:
 *                     type: string
 *                     example: "John Doe"
 */
router.get("/api/showRefferenceDetails", authMiddleware.verifyToken, CaseController.showRefference);

/**
 * @swagger
 * /api/addCase:
 *   post:
 *     summary: Add a New Case
 *     description: Create a new case for the first time from the PP Office.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               caseType:
 *                 type: string
 *                 description: The type of case.
 *                 example: "Criminal"
 *               caseDetails:
 *                 type: string
 *                 description: The detailed description of the case.
 *                 example: "Details about the criminal case."
 *     responses:
 *       201:
 *         description: Case created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Case created successfully."
 */
router.post("/api/addCase", authMiddleware.verifyToken, CaseController.createCase);

/**
 * @swagger
 * /api/showallCase:
 *   get:
 *     summary: Show All Cases
 *     description: Retrieve all cases for the first time from the PP Office.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: All cases retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   caseType:
 *                     type: string
 *                     example: "Criminal"
 */
router.get("/api/showallCase", authMiddleware.verifyToken, CaseController.showallCase);

/**
 * @swagger
 * /api/showallCaseBetweenRange:
 *   post:
 *     summary: Show All Cases Between Date Range
 *     description: Retrieve all cases that fall within a specified date range.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: The start date of the range.
 *                 example: "2024-01-01"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: The end date of the range.
 *                 example: "2024-01-31"
 *     responses:
 *       200:
 *         description: Cases retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   caseType:
 *                     type: string
 *                     example: "Criminal"
 */
router.post("/api/showallCaseBetweenRange", authMiddleware.verifyToken, CaseController.showallCaseBetweenRange);


// send email
// const EmailController = require("../controllers/emailController");
// router.post("/api/send-email", authMiddleware.verifyToken,EmailController.sendEmail);
// router.post("/api/send-email-pp", authMiddleware.verifyToken,EmailController.sendEmailTO);

const EmailController = require("../controllers/emailController");

/**
 * @swagger
 * /api/send-email:
 *   post:
 *     summary: Send Email
 *     description: Sends an email to a specified recipient.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               to:
 *                 type: string
 *                 format: email
 *                 description: The recipient's email address.
 *                 example: "recipient@example.com"
 *               subject:
 *                 type: string
 *                 description: The subject of the email.
 *                 example: "Case Update"
 *               message:
 *                 type: string
 *                 description: The body of the email.
 *                 example: "This is an update regarding your case."
 *     responses:
 *       200:
 *         description: Email sent successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Email sent successfully."
 */
router.post("/api/send-email", authMiddleware.verifyToken, EmailController.sendEmail);

/**
 * @swagger
 * /api/send-email-pp:
 *   post:
 *     summary: Send Email to PP
 *     description: Sends an email to a Public Prosecutor (PP).
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               to:
 *                 type: string
 *                 format: email
 *                 description: The Public Prosecutor's email address.
 *                 example: "pp@example.com"
 *               subject:
 *                 type: string
 *                 description: The subject of the email.
 *                 example: "Case Assignment"
 *               message:
 *                 type: string
 *                 description: The body of the email.
 *                 example: "You have been assigned a new case."
 *     responses:
 *       200:
 *         description: Email sent successfully to the Public Prosecutor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Email sent successfully to the Public Prosecutor."
 */
router.post("/api/send-email-pp", authMiddleware.verifyToken, EmailController.sendEmailTO);


// psStaff
// const PsController = require("../controllers/psController");
// router.post("/api/addpsStaff",authMiddleware.verifyToken,PsController.createPsStaff);
// router.get("/api/getpsStaff",authMiddleware.verifyToken,PsController.showpsstaff);
// router.get("/api/showallCasesBypsId",authMiddleware.verifyToken,PsController.showallcasesBypoliceID);
// router.post("/api/showpsUserById",authMiddleware.verifyToken,PsController.showpsuserById);
// router.get('/api/showpoliceBydistrict', authMiddleware.verifyToken,PsController.showallpsBydistrict);

const PsController = require("../controllers/psController");

/**
 * @swagger
 * /api/addpsStaff:
 *   post:
 *     summary: Add Police Staff
 *     description: Add a new police staff member to the system.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the police staff.
 *                 example: "John Doe"
 *               designation:
 *                 type: string
 *                 description: The designation of the police staff.
 *                 example: "Inspector"
 *               contact:
 *                 type: string
 *                 description: The contact number of the police staff.
 *                 example: "9876543210"
 *               districtId:
 *                 type: integer
 *                 description: The ID of the district the police staff belongs to.
 *                 example: 5
 *     responses:
 *       200:
 *         description: Police staff added successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Police staff added successfully."
 */
router.post("/api/addpsStaff", authMiddleware.verifyToken, PsController.createPsStaff);

/**
 * @swagger
 * /api/getpsStaff:
 *   get:
 *     summary: Get Police Staff
 *     description: Retrieve all police staff details.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of police staff.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: "John Doe"
 *                   designation:
 *                     type: string
 *                     example: "Inspector"
 *                   contact:
 *                     type: string
 *                     example: "9876543210"
 */
router.get("/api/getpsStaff", authMiddleware.verifyToken, PsController.showpsstaff);

/**
 * @swagger
 * /api/showallCasesBypsId:
 *   get:
 *     summary: Show All Cases by Police ID
 *     description: Retrieve all cases assigned to a specific police staff by their ID.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: psId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The police staff ID.
 *         example: 3
 *     responses:
 *       200:
 *         description: List of cases.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   caseId:
 *                     type: integer
 *                     example: 101
 *                   caseName:
 *                     type: string
 *                     example: "Robbery Case"
 */
router.get("/api/showallCasesBypsId", authMiddleware.verifyToken, PsController.showallcasesBypoliceID);

/**
 * @swagger
 * /api/showpsUserById:
 *   post:
 *     summary: Show Police Staff by ID
 *     description: Retrieve details of a specific police staff by their ID.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               psId:
 *                 type: integer
 *                 description: The ID of the police staff.
 *                 example: 3
 *     responses:
 *       200:
 *         description: Details of the police staff.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 3
 *                 name:
 *                   type: string
 *                   example: "John Doe"
 *                 designation:
 *                   type: string
 *                   example: "Inspector"
 */
router.post("/api/showpsUserById", authMiddleware.verifyToken, PsController.showpsuserById);

/**
 * @swagger
 * /api/showpoliceBydistrict:
 *   get:
 *     summary: Show Police Stations by District
 *     description: Retrieve all police stations within a specific district.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: districtId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the district.
 *         example: 5
 *     responses:
 *       200:
 *         description: List of police stations.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: "Downtown Police Station"
 */
router.get('/api/showpoliceBydistrict', authMiddleware.verifyToken, PsController.showallpsBydistrict);

// const superAdmin = require("../controllers/SuperAdminController");
// router.post("/api/addppofficeAdmin",authMiddleware.verifyToken,superAdmin.createPPOfficeAdminUser);
// router.post("/api/addppHead",authMiddleware.verifyToken,superAdmin.createPPHeadUser);
// router.post("/api/showppOfficeAdminUserList",authMiddleware.verifyToken,superAdmin.showppofficeAdminUser);
// router.post("/api/showppOfficeHeadUserList",authMiddleware.verifyToken,superAdmin.showppofficeHeadnUser);
// router.post("/api/addSP",authMiddleware.verifyToken,superAdmin.createSPUser);
// router.post("/api/showspUser",authMiddleware.verifyToken,superAdmin.showspUser);

const superAdmin = require("../controllers/SuperAdminController");

/**
 * @swagger
 * /api/addppofficeAdmin:
 *   post:
 *     summary: Add PP Office Admin
 *     description: Add a new PP Office Admin user.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the PP Office Admin.
 *                 example: "Jane Doe"
 *               email:
 *                 type: string
 *                 description: Email address of the admin.
 *                 example: "jane.doe@example.com"
 *               password:
 *                 type: string
 *                 description: Password for the admin account.
 *                 example: "securepassword"
 *     responses:
 *       200:
 *         description: PP Office Admin user added successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "PP Office Admin user added successfully."
 */
router.post("/api/addppofficeAdmin", authMiddleware.verifyToken, superAdmin.createPPOfficeAdminUser);

/**
 * @swagger
 * /api/addppHead:
 *   post:
 *     summary: Add PP Head
 *     description: Add a new PP Head user.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the PP Head.
 *                 example: "John Smith"
 *               email:
 *                 type: string
 *                 description: Email address of the PP Head.
 *                 example: "john.smith@example.com"
 *               password:
 *                 type: string
 *                 description: Password for the PP Head account.
 *                 example: "strongpassword"
 *     responses:
 *       200:
 *         description: PP Head user added successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "PP Head user added successfully."
 */
router.post("/api/addppHead", authMiddleware.verifyToken, superAdmin.createPPHeadUser);

/**
 * @swagger
 * /api/showppOfficeAdminUserList:
 *   post:
 *     summary: Show PP Office Admin User List
 *     description: Retrieve a list of all PP Office Admin users.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of PP Office Admin users.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: "Jane Doe"
 *                   email:
 *                     type: string
 *                     example: "jane.doe@example.com"
 */
router.post("/api/showppOfficeAdminUserList", authMiddleware.verifyToken, superAdmin.showppofficeAdminUser);

/**
 * @swagger
 * /api/showppOfficeHeadUserList:
 *   post:
 *     summary: Show PP Office Head User List
 *     description: Retrieve a list of all PP Office Head users.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of PP Office Head users.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: "John Smith"
 *                   email:
 *                     type: string
 *                     example: "john.smith@example.com"
 */
router.post("/api/showppOfficeHeadUserList", authMiddleware.verifyToken, superAdmin.showppofficeHeadnUser);

/**
 * @swagger
 * /api/addSP:
 *   post:
 *     summary: Add SP
 *     description: Add a new SP (Superintendent of Police) user.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the SP.
 *                 example: "SP James"
 *               email:
 *                 type: string
 *                 description: Email address of the SP.
 *                 example: "sp.james@example.com"
 *               password:
 *                 type: string
 *                 description: Password for the SP account.
 *                 example: "adminpassword"
 *     responses:
 *       200:
 *         description: SP user added successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "SP user added successfully."
 */
router.post("/api/addSP", authMiddleware.verifyToken, superAdmin.createSPUser);

/**
 * @swagger
 * /api/showspUser:
 *   post:
 *     summary: Show SP User List
 *     description: Retrieve a list of all SP users.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of SP users.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: "SP James"
 *                   email:
 *                     type: string
 *                     example: "sp.james@example.com"
 */
router.post("/api/showspUser", authMiddleware.verifyToken, superAdmin.showspUser);

/**
 * @swagger
 * /:
 *   get:
 *     summary: Returns the homepage
 *     description: This is the main endpoint for your API.
 *     responses:
 *       200:
 *         description: Welcome to the homepage
 */

/**
 * @swagger
 * /:
 *   get:
 *     summary: Welcome message
 *     description: A simple welcome message to indicate the API is working
 *     responses:
 *       200:
 *         description: Welcome message
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Welcome to the API"
 */
router.get('/', (req, res) => {
    res.send('Welcome to the API');
  });



module.exports = router;
