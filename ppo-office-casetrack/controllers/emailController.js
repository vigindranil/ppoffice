const nodemailer = require("nodemailer");
const CryptoJS = require('crypto-js');
const ResponseHelper = require('./ResponseHelper');
const db = require("../config/db");
const EmailTemplate = require('./emailTemplate');
const { BASE_URL, AES_SECRET } = process.env;

const generateEncryptedToken = (data) => {
    const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), AES_SECRET).toString();
    return encodeURIComponent(ciphertext);
};

class EmailController {

    static async callStoredProcedure(spName, params) {
        return new Promise((resolve, reject) => {
            db.query(`CALL ${spName}(${params.map(() => '?').join(',')})`, params, (err, results) => {
                if (err) {
                    console.error(`❌ Error executing stored procedure ${spName}:`, err);
                    return reject(err);
                }
                resolve(results[0]);
            });
        });
    }

    static async sendEmail(req, res) {
        try {
            // console.log("🔥 Request Body for sendEmail:", req.body);

            const { CaseID, Departments } = req.body; // Payload: {CaseID: "58", Departments: [{DistrictID: 5, PSID: 70}, ...]}

            if (!CaseID || !Departments || !Array.isArray(Departments) || Departments.length === 0) {
                return res.status(400).json({
                    status: 1,
                    message: "Fields 'CaseID' and a non-empty array 'Departments' are required.",
                });
            }

            const recipientEmails = new Set(); // To collect unique To/BCC emails for departments
            const recipientDataForLogging = [];
            let commonCaseDetailsFromSP = null; // To store CaseNumber, IPCSection etc.

            // 1. Fetch email addresses for the specified departments (for TO/BCC list)
            for (const dept of Departments) {
                const { DistrictID, PSID } = dept;
                if (DistrictID === undefined || PSID === undefined) {
                    console.warn("Skipping department due to missing DistrictID or PSID:", dept);
                    continue;
                }
                try {
                    // sp_sendEmailv1 is called per department combination from the payload
                    const results = await EmailController.callStoredProcedure('sp_sendEmailv2', [CaseID, DistrictID, PSID]);
                    const emailDetails = results[0];

                    if (emailDetails) {
                        if (!commonCaseDetailsFromSP) {
                            commonCaseDetailsFromSP = emailDetails; // Capture common details once
                        }
                        // Collect all relevant emails from this department
                        if (emailDetails.DistrictEmail) recipientEmails.add(emailDetails.DistrictEmail.trim());
                        if (emailDetails.ROLegalEmail) recipientEmails.add(emailDetails.ROLegalEmail.trim());
                        if (emailDetails.PoliceEmail) recipientEmails.add(emailDetails.PoliceEmail.trim());

                        // For logging, we might need to log against the primary contact for this department pair
                        // This part of logging needs refinement based on how sp_logEmailDetails is structured for departments
                        // For now, just collect that an attempt will be made for these primary targets
                        if (emailDetails.DistrictEmail) recipientDataForLogging.push({ email: emailDetails.DistrictEmail, userTypeId: 30, DistrictID, PSID: 0, CaseID });
                        if (emailDetails.PoliceEmail) recipientDataForLogging.push({ email: emailDetails.PoliceEmail, userTypeId: 50, DistrictID: 0, PSID, CaseID });
                        if (emailDetails.ROLegalEmail) recipientDataForLogging.push({ email: emailDetails.ROLegalEmail, userTypeId: 70, DistrictID, PSID: 0, CaseID });

                    } else {
                        console.warn(`No email details from sp_sendEmailv1 for CaseID ${CaseID}, DistrictID ${DistrictID}, PSID ${PSID}`);
                    }
                } catch (error) {
                    console.error(`❌ Error processing department D:${DistrictID}/PS:${PSID} with sp_sendEmailv1:`, error.message);
                }
            }

            if (recipientEmails.size === 0 || !commonCaseDetailsFromSP) {
                return res.status(404).json({
                    status: 1,
                    message: "No valid department recipients found or case details missing.",
                });
            }

            // 2. Fetch all assigned advocates for the case to include in the email body
            let assignedAdvocatesListHTML = 'No advocates assigned or found.';
            try {
                const assignedAdvocates = await EmailController.callStoredProcedure('sp_getAssignedAdvocatelistByCaseId', [CaseID]);
                if (assignedAdvocates && assignedAdvocates.length > 0) {
                    assignedAdvocatesListHTML = assignedAdvocates
                        .map(adv => `${adv.advocateName}${adv.advocateContactNumber ? ` (${adv.advocateContactNumber})` : ''}`)
                        .join('<br>');
                }
            } catch (error) {
                console.error(`❌ Error fetching assigned advocates for CaseID ${CaseID} (sendEmail):`, error.message);
                assignedAdvocatesListHTML = "Could not retrieve advocate list.";
            }

            // 3. Fetch all assigned departments for the case to determine CC list (those NOT in the primary 'Departments' payload)
            const ccDepartmentEmails = new Set();
            const payloadDepartmentKeys = new Set(Departments.map(d => `${d.DistrictID}-${d.PSID}`)); // For easy lookup

            try {
                const allCaseDepartments = await EmailController.callStoredProcedure('sp_getAssignedDistrictAndPoliceByCaseId', [CaseID]);
                if (allCaseDepartments && allCaseDepartments.length > 0) {
                    allCaseDepartments.forEach(dept => {
                        const deptKey = `${dept.districtId}-${dept.policeStationId}`;
                        if (!payloadDepartmentKeys.has(deptKey)) { // If this department was not a primary target
                            if (dept.districtEmail) ccDepartmentEmails.add(dept.districtEmail.trim());
                            if (dept.rolegalEmail) ccDepartmentEmails.add(dept.rolegalEmail.trim());
                            if (dept.policeEmail) ccDepartmentEmails.add(dept.policeEmail.trim());
                        }
                    });
                }
            } catch (error) {
                console.error(`❌ Error fetching all assigned departments for CC list (sendEmail) for CaseID ${CaseID}:`, error.message);
            }

            // Destructure common details from the first successful sp_sendEmailv1 call
            const {
                CaseNumber, IPCSection, BNSSection, CaseDate, HearingDate, SPName, PSName
            } = commonCaseDetailsFromSP;

            const emailTemplate = new EmailTemplate({
                crm: BNSSection, // Or Refference if that's the field name
                psCaseNo: CaseNumber,
                dated: CaseDate,
                ipcSection: IPCSection,
                hearingDate: HearingDate,
                SPName: SPName || "N/A", // From sp_sendEmailv1 if available, else default
                PSName: PSName || "N/A",   // From sp_sendEmailv1 if available, else default
                assignedAdvocatesList: assignedAdvocatesListHTML // Pass the advocate list
            });

            const emailContent = emailTemplate.generateEmailContent(); // Using the main content template

            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST || "smtp.gmail.com",
                port: parseInt(process.env.SMTP_PORT) || 587,
                secure: (process.env.SMTP_SECURE === 'true'),
                auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
            });

            const mailOptions = {
                from: `"${process.env.EMAIL_FROM_NAME || 'Notifications'}" <${process.env.EMAIL_USER}>`,
                to: process.env.EMAIL_USER, // Placeholder
                bcc: Array.from(recipientEmails).join(', '),
                subject: `Case Information: ${CaseNumber}`,
                html: emailContent, // HTML from template
                dsn: {
                    id: `dsn-dept-${CaseID}-${Date.now()}`,
                    return: 'headers',
                    notify: ['failure', 'delay'],
                    recipient: process.env.EMAIL_USER,
                },
            };

            if (ccDepartmentEmails.size > 0) {
                mailOptions.cc = Array.from(ccDepartmentEmails).join(', ');
            }

            const uniqueRecipientDataForLogging = Array.from(
                new Map(recipientDataForLogging.map(item => [item.email, item])).values()
            );

            try {
                const info = await transporter.sendMail(mailOptions);
                console.log(`✅ Department batch email sent. Message ID: ${info.messageId}`);
                console.log(`✉️ BCC'd to: ${Array.from(recipientEmails).join(', ')}`);
                if (mailOptions.cc) console.log(`✉️ CC'd to: ${mailOptions.cc}`);

                // Granular logging for each department contact in the BCC list
                for (const recipient of uniqueRecipientDataForLogging) {
                    const logQuery = "CALL sp_logEmailDetails(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                    const logParams = [
                        info.messageId,
                        CaseID,
                        commonCaseDetailsFromSP.CaseNumber || null,
                        commonCaseDetailsFromSP.CaseDate || null,
                        commonCaseDetailsFromSP.IPCSection || null,
                        commonCaseDetailsFromSP.HearingDate || null,
                        recipient.email,
                        recipient.DistrictID || 0,
                        recipient.PSID || 0,
                        0,
                        recipient.userTypeId,
                        1
                    ];
                    // console.log("📋 Logging Success Params to sp_logEmailDetails (Department):", logParams);
                    db.query(logQuery, logParams, (logErr) => {
                        if (logErr) console.error(`❌ DB Log Error (Success) for department ${recipient.email}:`, logErr);
                    });
                }

                return res.status(200).json({
                    status: 0,
                    message: `Batch email sent to ${recipientEmails.size} department contacts and CC'd to ${ccDepartmentEmails.size} other department contacts.`,
                    messageId: info.messageId,
                });

            } catch (emailError) {
                console.error(`❌ Failed to send department batch email:`, emailError);

                // Granular logging for failure for each intended department contact
                for (const recipient of uniqueRecipientDataForLogging) {
                    const logQuery = "CALL sp_logEmailDetails(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                    const logParams = [
                        null, // No messageId on failure
                        CaseID,
                        commonCaseDetailsFromSP.CaseNumber || null,
                        commonCaseDetailsFromSP.CaseDate || null,
                        commonCaseDetailsFromSP.IPCSection || null,
                        commonCaseDetailsFromSP.HearingDate || null,
                        recipient.email,
                        recipient.DistrictID || 0,
                        recipient.PSID || 0,
                        0,
                        recipient.userTypeId,
                        0 // Failure
                    ];
                    // console.log("📋 Logging Failure Params to sp_logEmailDetails (Department):", logParams);
                    db.query(logQuery, logParams, (logErr) => {
                        if (logErr) console.error(`❌ DB Log Error (Failure) for department ${recipient.email}:`, logErr);
                    });
                }

                return res.status(500).json({
                    status: 1,
                    message: "Failed to send batch email to departments.",
                    error: emailError.message,
                });
            }

        } catch (error) {
            console.error("❌ Unexpected error in sendEmail (department version):", error);
            return res.status(500).json({
                status: 1,
                message: "An unexpected server error occurred in sendEmail.",
                error: error.message,
            });
        }
    }

    static async sendEmailTO(req, res) {
        try {
            // console.log("🔥 Request Body:", req.body);

            const { CaseID, PPuserID_array, ccEmail: initialCcEmail } = req.body; // Renamed to initialCcEmail

            if (!CaseID || !PPuserID_array || !Array.isArray(PPuserID_array) || PPuserID_array.length === 0) {
                return res.status(400).json({
                    status: 1,
                    message: "Fields 'CaseID' and a non-empty array 'PPuserID_array' are required.",
                });
            }

            const BASE_URL = process.env.BASE_URL;
            if (!BASE_URL) {
                console.warn("⚠️ BASE_URL is not configured. Email links might be affected.");
            }

            let encryptedCaseID = null;
            if (CaseID) {
                try {
                    encryptedCaseID = generateEncryptedToken({ CaseID }); // Use your actual function
                } catch (e) {
                    console.error("Error encrypting CaseID", e);
                }
            }

            let commonEmailDetails = null;
            const recipientEmailsForBCC = []; // For the main PPs in PPuserID_array
            const recipientDataForLogging = [];
            const ccEmailsList = new Set(); // Use a Set to avoid duplicate CCs

            if (initialCcEmail && typeof initialCcEmail === 'string' && initialCcEmail.trim() !== '') {
                initialCcEmail.split(',').forEach(email => ccEmailsList.add(email.trim()));
            }

            // 1. Fetch details for PPs in PPuserID_array (for BCC)
            for (const PPuserID of PPuserID_array) {
                try {
                    const results = await EmailController.callStoredProcedure('sp_sendEmail_ppv2', [CaseID, PPuserID]);
                    const emailDetailsFromDB = results[0];

                    if (emailDetailsFromDB && emailDetailsFromDB.PPEmail) {
                        if (!commonEmailDetails) {
                            commonEmailDetails = emailDetailsFromDB;
                        }
                        recipientEmailsForBCC.push(emailDetailsFromDB.PPEmail);
                        recipientDataForLogging.push({
                            PPuserID: PPuserID, // Or emailDetailsFromDB.PPId
                            PPEmail: emailDetailsFromDB.PPEmail,
                            userTypeId: 60
                        });
                    } else {
                        console.warn(`No email details or PPEmail found for CaseID ${CaseID} and PPuserID ${PPuserID} via sp_sendEmail_ppv2.`);
                    }
                } catch (error) {
                    console.error(`❌ Error processing PPuserID ${PPuserID} with sp_sendEmail_ppv2:`, error.message);
                }
            }

            if (recipientEmailsForBCC.length === 0 || !commonEmailDetails) {
                return res.status(404).json({
                    status: 1,
                    message: "No valid primary recipients (PPs) found or case details missing.",
                });
            }

            // 2. Fetch all assigned advocates for the case to determine additional CCs
            try {
                const assignedAdvocates = await EmailController.callStoredProcedure('sp_getAssignedAdvocatelistByCaseId', [CaseID]);
                if (assignedAdvocates && assignedAdvocates.length > 0) {
                    const ppUserIDsSet = new Set(PPuserID_array.map(id => parseInt(id, 10))); // Ensure IDs are numbers for comparison
                    assignedAdvocates.forEach(advocate => {
                        // If advocateId is not in the primary PPuserID_array and has an email, add to CC
                        if (advocate.advocateEmail && !ppUserIDsSet.has(advocate.advocateId)) {
                            ccEmailsList.add(advocate.advocateEmail.trim());
                        }
                    });
                }
            } catch (error) {
                console.error(`❌ Error fetching assigned advocates list for CaseID ${CaseID}:`, error.message);
                // Continue, but CC list might be incomplete
            }

            // 3. Fetch assigned departments (police stations) for the email body
            let assignedDepartmentsListHTML = '';
            try {
                const assignedDepts = await EmailController.callStoredProcedure('sp_getAssignedDistrictAndPoliceByCaseId', [CaseID]);
                if (assignedDepts && assignedDepts.length > 0) {
                    const deptNames = assignedDepts.map(dept => dept.policeStationName).filter(name => name);
                    if (deptNames.length > 0) {
                        assignedDepartmentsListHTML = deptNames.join('<br>');
                    } else {
                        assignedDepartmentsListHTML = "No specific departments listed.";
                    }
                } else {
                    assignedDepartmentsListHTML = "No departments assigned or found.";
                }
            } catch (error) {
                console.error(`❌ Error fetching assigned departments for CaseID ${CaseID}:`, error.message);
                assignedDepartmentsListHTML = "Could not retrieve department list.";
            }


            const {
                psCaseNo, Refference, dated, hearingDate,
                PSName, SPName, ipcSection
            } = commonEmailDetails;

            const emailTemplatePP = new EmailTemplate({
                crm: Refference,
                psCaseNo: psCaseNo,
                dated: dated,
                ipcSection: ipcSection,
                hearingDate: hearingDate,
                SPName: SPName,
                PSName: PSName,
                PPName: "You", // For the primary recipients
                encryptedCaseID: encryptedCaseID,
                baseURL: BASE_URL,
                assignedDepartmentsList: assignedDepartmentsListHTML // Pass the list to the template
            });

            const emailContentPP = emailTemplatePP.generateEmailAdvocateAssignToA(); // This template now uses the departments list

            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST || "smtp.gmail.com",
                port: parseInt(process.env.SMTP_PORT) || 587,
                secure: (process.env.SMTP_SECURE === 'true'),
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD,
                },
            });

            const mailOptions = {
                from: `"${process.env.EMAIL_FROM_NAME || 'Notifications'}" <${process.env.EMAIL_USER}>`,
                to: process.env.EMAIL_USER, // Placeholder 'to' as primary recipients are in BCC
                bcc: recipientEmailsForBCC.join(', '),
                subject: `Case Assignment Update: ${psCaseNo}`,
                html: emailContentPP, // HTML content from template
                dsn: {
                    id: `dsn-batch-pp-${CaseID}-${Date.now()}`,
                    return: 'headers',
                    notify: ['failure', 'delay'],
                    recipient: process.env.EMAIL_USER,
                },
            };

            if (ccEmailsList.size > 0) {
                mailOptions.cc = Array.from(ccEmailsList).join(', ');
            }

            try {
                const info = await transporter.sendMail(mailOptions);
                console.log(`✅ Batch PP email sent. Message ID: ${info.messageId}`);
                console.log(`✉️ BCC'd to: ${recipientEmailsForBCC.join(', ')}`);
                if (mailOptions.cc) console.log(`✉️ CC'd to: ${mailOptions.cc}`);

                for (const recipient of recipientDataForLogging) {
                    const logQuery = "CALL sp_logEmailDetails(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                    const logParams = [
                        info.messageId, CaseID, psCaseNo, dated, ipcSection, hearingDate,
                        recipient.PPEmail, 0, 0,
                        recipient.PPuserID,
                        recipient.userTypeId, 1 // Success
                    ];
                    // console.log("📋 Logging Success Params adv to sp_logEmailDetails:", logParams);
                    // Fire-and-forget logging for now
                    db.query(logQuery, logParams, (logErr) => {
                        if (logErr) console.error(`❌ DB Log Error (Success) for ${recipient.PPEmail}:`, logErr);
                    });
                }

                return res.status(200).json({
                    status: 0,
                    message: `Batch email sent to ${recipientEmailsForBCC.length} PPs and CC'd to ${ccEmailsList.size} other advocates.`,
                    messageId: info.messageId,
                });

            } catch (emailError) {
                console.error(`❌ Failed to send batch PP email:`, emailError);
                for (const recipient of recipientDataForLogging) {
                    const logQuery = "CALL sp_logEmailDetails(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                    const logParams = [
                        null, CaseID, psCaseNo, dated, ipcSection, hearingDate,
                        recipient.PPEmail, 0, 0,
                        recipient.PPuserID, recipient.userTypeId, 0 // Failure
                    ];
                    // console.log("📋 Logging Failure Params adv to sp_logEmailDetails:", logParams);
                    db.query(logQuery, logParams, (logErr) => {
                        if (logErr) console.error(`❌ DB Log Error (Failure) for ${recipient.PPEmail}:`, logErr);
                    });
                }
                return res.status(500).json({
                    status: 1,
                    message: "Failed to send batch email to PPs.",
                    error: emailError.message,
                });
            }
        } catch (error) {
            console.error("❌ Unexpected error in sendEmailTO:", error);
            return res.status(500).json({
                status: 1,
                message: "An unexpected error occurred in sendEmailTO.",
                error: error.message,
            });
        }
    }

    static async sendCaseUpdatedEmail(req, res) {
        const { CaseSummaryId } = req.body;

        // Validate required fields
        if (!CaseSummaryId) {
            return ResponseHelper.error(res, "CaseSummaryId is required");
        }


        try {
            const query = "CALL sp_sendEmail_futureDetail(?)";

            db.query(query, [CaseSummaryId], async (err, results) => {
                if (err) {
                    console.error("Error executing stored procedure:", err);
                    return res.status(500).json({
                        status: 1,
                        message: "Error retrieving data from the database",
                    });
                }

                const rows = results[0];
                const emailDetails = rows[0];
                if (!emailDetails) {
                    return res.status(404).json({
                        status: 1,
                        message: "No email details found for the given CaseID.",
                    });
                }

                const { receiveEmail, ccEmail, psCaseNo, dated, CaseId, NexthearingDate, CaseDescription, CaseAdditionalRemarks, sp_id, ps_id, CaseRequiredDocument } = emailDetails;

                // Generate the email content
                const emailTemplate = new EmailTemplate({
                    psCaseNo,
                    dated,
                    NexthearingDate,
                    CaseDescription,
                    CaseAdditionalRemarks,
                    CaseRequiredDocument
                });

                const transporter = nodemailer.createTransport({
                    host: "smtp.gmail.com",
                    port: 587,
                    secure: false,
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASSWORD,
                    },
                });

                const emailContent = emailTemplate.generateEmailContentForFutureCaseDetails();

                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: receiveEmail,
                    cc: ccEmail,
                    subject: `Case Update: ${psCaseNo}`,
                    html: `<pre>${emailContent}</pre>`,
                };

                try {
                    const info = await transporter.sendMail(mailOptions);

                    // Email sent successfully, now log the details
                    const logQuery = "CALL sp_logFutureEmailDetails(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)";
                    const logParams = [
                        info.messageId, // Message ID from nodemailer
                        CaseId,
                        CaseSummaryId,         // Case ID
                        psCaseNo,       // Case number
                        dated,          // Case Date
                        CaseDescription,
                        receiveEmail,    // Case Hearing Date
                        ccEmail,
                        sp_id,
                        ps_id,
                        NexthearingDate,
                        CaseAdditionalRemarks,
                        CaseRequiredDocument,
                        1
                    ];

                    db.query(logQuery, logParams, (logErr) => {
                        if (logErr) {
                            console.error("Error logging email details:", logErr);
                            return res.status(500).json({
                                status: 1,
                                message: "Email sent, but logging failed.",
                            });
                        }

                        // Respond with success
                        return res.status(200).json({
                            status: 0,
                            message: "Email sent and logged successfully.",
                            data: {
                                messageId: info.messageId,
                                DistrictName: emailDetails.DistrictName,
                                PoliceStationName: emailDetails.PoliceStationName,
                                response: info.response,
                            },
                        });
                    });
                } catch (emailError) {
                    console.error("Error sending email:", emailError);

                    // Log email details as failure
                    const logQuery = "CALL sp_logFutureEmailDetails(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                    const logParams = [
                        null, // Message ID from nodemailer
                        CaseId,
                        CaseSummaryId,         // Case ID
                        psCaseNo,       // Case number
                        dated,          // Case Date
                        CaseDescription,
                        receiveEmail,    // Case Hearing Date
                        ccEmail,
                        sp_id,
                        ps_id,
                        NexthearingDate,
                        CaseAdditionalRemarks,
                        CaseRequiredDocument,
                        0
                    ];
                }
            });
        } catch (error) {
            console.error("Error in sendEmail:", error);
            return res.status(500).json({
                status: 1,
                message: "An unexpected error occurred.",
                error: error.message,
            });
        }
    }
}

module.exports = EmailController;