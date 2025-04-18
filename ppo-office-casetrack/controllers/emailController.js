const nodemailer = require("nodemailer");
const ResponseHelper = require('./ResponseHelper');
const db = require("../config/db"); // Import the DB connection
const EmailTemplate = require('./emailTemplate'); // Import the EmailTemplate class

class EmailController {

    // static async sendEmail(req, res) {
    //     try {
    //         console.log("🔥 Request Body:", req.body); // Debugging
    
    //         const { CaseID } = req.body;
    
    //         // ✅ Validate required fields
    //         if (!CaseID) {
    //             return ResponseHelper.error(res, "CaseID is required");
    //         }
    
    //         // ✅ Call stored procedure to get email details
    //         const query = "CALL sp_sendEmail(?)";
    //         db.query(query, [CaseID], async (err, results) => {
    //             if (err) {
    //                 console.error("❌ Error executing stored procedure:", err);
    //                 return res.status(500).json({
    //                     status: 1,
    //                     message: "Error retrieving data from the database",
    //                 });
    //             }
    
    //             const rows = results[0];
    //             const emailDetails = rows[0];
    
    //             if (!emailDetails) {
    //                 return res.status(404).json({
    //                     status: 1,
    //                     message: "No email details found for the given CaseID.",
    //                 });
    //             }
    
    //             // ✅ Extract required fields correctly
    //             const { districtEmail, psEmail, rolegalEmail, psCaseNo, dated, hearingDate, ipcSection, districtId, policestationId, PPId, PPUserName } = emailDetails;
    
    //             // ✅ Define recipients and their corresponding user types
    //             const recipients = [
    //                 { email: districtEmail, userTypeId: 30, districtId, policestationId: 0 },  // District Recipient
    //                 { email: psEmail, userTypeId: 50, districtId: 0, policestationId },        // Police Station Recipient
    //                 { email: rolegalEmail, userTypeId: 70, districtId, policestationId: 0 }    // RO Legal Recipient
    //             ];
    
    //             // ✅ Filter out null or empty emails
    //             const validRecipients = recipients.filter(r => r.email);
    
    //             if (validRecipients.length === 0) {
    //                 return res.status(400).json({
    //                     status: 1,
    //                     message: "No valid recipients found for email.",
    //                 });
    //             }
    
    //             // ✅ Generate email content
    //             const emailTemplate = new EmailTemplate({
    //                 psCaseNo,
    //                 dated,
    //                 ipcSection,
    //                 hearingDate,
    //             });
    
    //             const transporter = nodemailer.createTransport({
    //                 host: "smtp.gmail.com",
    //                 port: 587,
    //                 secure: false,
    //                 auth: {
    //                     user: process.env.EMAIL_USER,
    //                     pass: process.env.EMAIL_PASSWORD,
    //                 },
    //             });
    
    //             const emailContent = emailTemplate.generateEmailContent();
    //             let emailSendSuccess = false;
    
    //             // ✅ Send email to all valid recipients and log results
    //             for (const recipient of validRecipients) {
    //                 const mailOptions = {
    //                     from: process.env.EMAIL_USER,
    //                     to: recipient.email,
    //                     subject: `Case Update: ${psCaseNo}`,
    //                     html: `<pre>${emailContent}</pre>`,
    //                     dsn: {
    //                         id: `dsn-${CaseID}`,
    //                         return: 'headers',
    //                         notify: ['failure', 'delay'],
    //                         recipient: process.env.EMAIL_USER,
    //                     },
    //                 };
    
    //                 try {
    //                     const info = await transporter.sendMail(mailOptions);
    //                     console.log(`✅ Email sent to ${recipient.email}`);
    
    //                     emailSendSuccess = true; // ✅ At least one email was sent successfully
    
    //                     // ✅ Log successful email in `sp_logEmailDetails`
    //                     const logQuery = "CALL sp_logEmailDetails(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    //                     const logParams = [
    //                         info.messageId, // Message ID from nodemailer
    //                         CaseID,         // Case ID
    //                         psCaseNo,       // Case number
    //                         dated,          // Case Date
    //                         ipcSection,
    //                         hearingDate,    // Hearing Date
    //                         recipient.email, // ✅ Email recipient
    //                         recipient.districtId, // ✅ District ID or 0 for PS
    //                         recipient.policestationId, // ✅ PS ID or 0 for District
    //                         PPId,            // ✅ Corrected PP ID
    //                         recipient.userTypeId, // ✅ Ensured userTypeId is an integer
    //                         1                // ✅ Success (Delivery Status)
    //                     ];
    
    //                     db.query(logQuery, logParams, (logErr) => {
    //                         if (logErr) {
    //                             console.error(`❌ Error logging email details for ${recipient.email}:`, logErr);
    //                         }
    //                     });
    
    //                 } catch (emailError) {
    //                     console.error(`❌ Failed to send email to ${recipient.email}:`, emailError);
    
    //                     // ✅ Log failed email attempt in `sp_logEmailDetails`
    //                     const logQuery = "CALL sp_logEmailDetails(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    //                     const logParams = [
    //                         null,         // No message ID since email failed
    //                         CaseID,
    //                         psCaseNo,
    //                         dated,
    //                         ipcSection,
    //                         hearingDate,
    //                         recipient.email,
    //                         recipient.districtId, // ✅ District ID or 0 for PS
    //                         recipient.policestationId, // ✅ PS ID or 0 for District
    //                         PPId,            // ✅ Corrected PP ID
    //                         recipient.userTypeId,
    //                         0             // ✅ Failure (Delivery Status)
    //                     ];
    
    //                     db.query(logQuery, logParams, (logErr) => {
    //                         if (logErr) {
    //                             console.error(`❌ Error logging failed email details for ${recipient.email}:`, logErr);
    //                         }
    //                     });
    //                 }
    //             }
    
    //             // ✅ Respond based on email sending status
    //             if (emailSendSuccess) {
    //                 return res.status(200).json({
    //                     status: 0,
    //                     message: "Email(s) sent and logged successfully.",
    //                 });
    //             } else {
    //                 return res.status(500).json({
    //                     status: 1,
    //                     message: "Failed to send all emails.",
    //                 });
    //             }
    
    //         });
    
    //     } catch (error) {
    //         console.error("❌ Unexpected error:", error);
    //         return res.status(500).json({
    //             status: 1,
    //             message: "An unexpected error occurred.",
    //             error: error.message,
    //         });
    //     }
    // }


    static async sendEmail(req, res) {
        try {
            console.log("🔥 Request Body:", req.body); // Debugging
    
            const { CaseID, DistrictID, PSID } = req.body;
    
            // ✅ Validate required fields
            if (!CaseID || !DistrictID || !PSID) {
                return res.status(400).json({
                    status: 1,
                    message: "Fields 'CaseID', 'DistrictID', and 'PSID' are required.",
                });
            }
    
            // ✅ Call the updated stored procedure
            const query = "CALL sp_sendEmailv1(?, ?, ?)";
            db.query(query, [CaseID, DistrictID, PSID], async (err, results) => {
                if (err) {
                    console.error("❌ Error executing stored procedure:", err);
                    return res.status(500).json({
                        status: 1,
                        message: "Error retrieving data from the database.",
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
    
                // ✅ Extract required fields correctly
                const { 
                    AssignedPPs, 
                    DistrictEmail, 
                    ROLegalEmail, 
                    PoliceEmail, 
                    CaseNumber, 
                    IPCSection, 
                    BNSSection, 
                    CaseDate, 
                    HearingDate 
                } = emailDetails;
    
                // ✅ Define recipients and their corresponding user types
                const recipients = [
                    { email: DistrictEmail, userTypeId: 30, districtId: DistrictID, policestationId: 0 },  // District Recipient
                    { email: PoliceEmail, userTypeId: 50, districtId: 0, policestationId: PSID },          // Police Station Recipient
                    { email: ROLegalEmail, userTypeId: 70, districtId: DistrictID, policestationId: 0 }    // RO Legal Recipient
                ];
    
                // ✅ Filter out null or empty emails
                const validRecipients = recipients.filter(r => r.email);
    
                if (validRecipients.length === 0) {
                    return res.status(400).json({
                        status: 1,
                        message: "No valid recipients found for email.",
                    });
                }
    
                // ✅ Generate email content
                // const emailTemplate = new EmailTemplate({
                //     CaseNumber,
                //     CaseDate,
                //     IPCSection,
                //     BNSSection,
                //     HearingDate,
                //     AssignedPPs
                // });

                // console.log("📧 Template input:", {
                //     crm: BNSSection,
                //     psCaseNo: CaseNumber,
                //     dated: CaseDate,
                //     ipcSection: IPCSection,
                //     hearingDate: HearingDate,
                //     PPName: AssignedPPs
                //   });

                console.log({
                    crm: BNSSection, 
                    psCaseNo: CaseNumber,
                    dated: CaseDate,
                    ipcSection: IPCSection,
                    hearingDate: HearingDate,
                    PPName: AssignedPPs,       
                    SPName: emailDetails.SPName || "Unknown", 
                    PSName: emailDetails.PSName || "Unknown",  
                });

                const emailTemplate = new EmailTemplate({
                    crm: BNSSection, 
                    psCaseNo: CaseNumber,
                    dated: CaseDate,
                    ipcSection: IPCSection,
                    hearingDate: HearingDate,
                    PPName: AssignedPPs,       
                    SPName: emailDetails.SPName || "Unknown", 
                    PSName: emailDetails.PSName || "Unknown",  
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
    
                const emailContent = emailTemplate.generateEmailContent();
                let emailSendSuccess = false;
    
                // ✅ Send email to all valid recipients and log results
                for (const recipient of validRecipients) {
                    const mailOptions = {
                        from: process.env.EMAIL_USER,
                        to: recipient.email,
                        subject: `Case Update: ${CaseNumber}`,
                        html: `<pre>${emailContent}</pre>`,
                        dsn: {
                            id: `dsn-${CaseID}`,
                            return: 'headers',
                            notify: ['failure', 'delay'],
                            recipient: process.env.EMAIL_USER,
                        },
                    };
    
                    try {
                        const info = await transporter.sendMail(mailOptions);
                        console.log(`✅ Email sent to ${recipient.email}`);
    
                        emailSendSuccess = true; // ✅ At least one email was sent successfully
    
                        // ✅ Log successful email in `sp_logEmailDetails`
                        const logQuery = "CALL sp_logEmailDetails(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                        const logParams = [
                            info.messageId, // Message ID from nodemailer
                            CaseID,         // Case ID
                            CaseNumber,     // Case number
                            CaseDate,       // Case Date
                            IPCSection,
                            HearingDate,    // Hearing Date
                            recipient.email, // ✅ Email recipient
                            recipient.districtId, // ✅ District ID or 0 for PS
                            recipient.policestationId, // ✅ PS ID or 0 for District
                            0,               // PPId (not applicable here)
                            recipient.userTypeId, // ✅ Ensured userTypeId is correct
                            1                // ✅ Success (Delivery Status)
                        ];
    
                        db.query(logQuery, logParams, (logErr) => {
                            if (logErr) {
                                console.error(`❌ Error logging email details for ${recipient.email}:`, logErr);
                            }
                        });
    
                    } catch (emailError) {
                        console.error(`❌ Failed to send email to ${recipient.email}:`, emailError);
    
                        // ✅ Log failed email attempt in `sp_logEmailDetails`
                        const logQuery = "CALL sp_logEmailDetails(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                        const logParams = [
                            null,         // No message ID since email failed
                            CaseID,
                            CaseNumber,
                            CaseDate,
                            IPCSection,
                            HearingDate,
                            recipient.email,
                            recipient.districtId, // ✅ District ID or 0 for PS
                            recipient.policestationId, // ✅ PS ID or 0 for District
                            0,               // PPId (not applicable here)
                            recipient.userTypeId,
                            0             // ✅ Failure (Delivery Status)
                        ];
    
                        db.query(logQuery, logParams, (logErr) => {
                            if (logErr) {
                                console.error(`❌ Error logging failed email details for ${recipient.email}:`, logErr);
                            }
                        });
                    }
                }
    
                // ✅ Respond based on email sending status
                if (emailSendSuccess) {
                    return res.status(200).json({
                        status: 0,
                        message: "Email(s) sent and logged successfully.",
                    });
                } else {
                    return res.status(500).json({
                        status: 1,
                        message: "Failed to send all emails.",
                    });
                }
    
            });
    
        } catch (error) {
            console.error("❌ Unexpected error:", error);
            return res.status(500).json({
                status: 1,
                message: "An unexpected error occurred.",
                error: error.message,
            });
        }
    }    
    

    // static async sendEmailTO(req, res) {
    //     try {
    //         console.log("🔥 Request Body:", req.body); // Debugging
    
    //         const { CaseID, PPuserID } = req.body;
    
    //         // ✅ Validate required fields
    //         if (!CaseID || !PPuserID) {
    //             return res.status(400).json({
    //                 status: 1,
    //                 message: "Fields 'CaseID' and 'PPuserID' are required.",
    //             });
    //         }
    
    //         // ✅ Call stored procedure to get email details
    //         const query = "CALL sp_sendEmail_pp(?, ?)";
    //         db.query(query, [CaseID, PPuserID], async (err, results) => {
    //             if (err) {
    //                 console.error("❌ Error executing stored procedure:", err);
    //                 return res.status(500).json({
    //                     status: 1,
    //                     message: "Error retrieving data from the database.",
    //                 });
    //             }
    
    //             const rows = results[0];
    //             const emailDetails = rows[0];
    
    //             if (!emailDetails) {
    //                 return res.status(404).json({
    //                     status: 1,
    //                     message: "No email details found for the given CaseID.",
    //                 });
    //             }
    
    //             // ✅ Extract required fields correctly
    //             const { ppEmail, psCaseNo, dated, hearingDate, ipcSection, PPName, SPName, PSName, PPId, PPUserName } = emailDetails;
    
    //             // ✅ Define recipients
    //             const recipients = [
    //                 { email: ppEmail, userTypeId: 60 }, // Public Prosecutor (PP)
    //             ];
    
    //             // ✅ Filter out null or empty emails
    //             const validRecipients = recipients.filter(r => r.email);
    
    //             if (validRecipients.length === 0) {
    //                 return res.status(400).json({
    //                     status: 1,
    //                     message: "No valid recipients found for email.",
    //                 });
    //             }
    
    //             // ✅ Generate email content for PP
    //             const emailTemplatePP = new EmailTemplate({
    //                 psCaseNo,
    //                 dated,
    //                 ipcSection,
    //                 SPName,
    //                 PSName,
    //                 hearingDate,
    //             });
    
    //             const transporter = nodemailer.createTransport({
    //                 host: "smtp.gmail.com",
    //                 port: 587,
    //                 secure: false,
    //                 auth: {
    //                     user: process.env.EMAIL_USER,
    //                     pass: process.env.EMAIL_PASSWORD,
    //                 },
    //             });
    
    //             const emailContentPP = emailTemplatePP.generateEmailCopy();
    //             let emailSendSuccess = false;
    
    //             // ✅ Send email to all valid recipients and log results
    //             for (const recipient of validRecipients) {
    //                 const mailOptions = {
    //                     from: process.env.EMAIL_USER,
    //                     to: recipient.email,
    //                     subject: `Case Update: ${psCaseNo}`,
    //                     html: `<pre>${emailContentPP}</pre>`,
    //                     dsn: {
    //                         id: `dsn-${CaseID}`,
    //                         return: 'headers',
    //                         notify: ['failure', 'delay'],
    //                         recipient: process.env.EMAIL_USER,
    //                     },
    //                 };
    
    //                 try {
    //                     const info = await transporter.sendMail(mailOptions);
    //                     console.log(`✅ Email sent to ${recipient.email}`);
    
    //                     emailSendSuccess = true; // ✅ At least one email was sent successfully
    
    //                     // ✅ Log successful email in `sp_logEmailDetails`
    //                     const logQuery = "CALL sp_logEmailDetails(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    //                     const logParams = [
    //                         info.messageId, // Message ID from nodemailer
    //                         CaseID,         // Case ID
    //                         psCaseNo,       // Case number
    //                         dated,          // Case Date
    //                         ipcSection,
    //                         hearingDate,    // Hearing Date
    //                         recipient.email, // ✅ Email recipient
    //                         0,           // District ID (Not available)
    //                         0,           // Police Station ID (Not available)
    //                         PPId,           // ✅ Corrected PP ID
    //                         recipient.userTypeId, // ✅ Ensured userTypeId is correct (60 for PP)
    //                         1                // ✅ Success (Delivery Status)
    //                     ];
    
    //                     db.query(logQuery, logParams, (logErr) => {
    //                         if (logErr) {
    //                             console.error(`❌ Error logging email details for ${recipient.email}:`, logErr);
    //                         }
    //                     });
    
    //                 } catch (emailError) {
    //                     console.error(`❌ Failed to send email to ${recipient.email}:`, emailError);
    
    //                     // ✅ Log failed email attempt in `sp_logEmailDetails`
    //                     const logQuery = "CALL sp_logEmailDetails(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    //                     const logParams = [
    //                         null,         // No message ID since email failed
    //                         CaseID,
    //                         psCaseNo,
    //                         dated,
    //                         ipcSection,
    //                         hearingDate,
    //                         recipient.email,
    //                         0,           // District ID (Not available)
    //                         0,           // Police Station ID (Not available)
    //                         PPId,           // ✅ Corrected PP ID
    //                         recipient.userTypeId,
    //                         0             // ✅ Failure (Delivery Status)
    //                     ];
    
    //                     db.query(logQuery, logParams, (logErr) => {
    //                         if (logErr) {
    //                             console.error(`❌ Error logging failed email details for ${recipient.email}:`, logErr);
    //                         }
    //                     });
    //                 }
    //             }
    
    //             // ✅ Respond based on email sending status
    //             if (emailSendSuccess) {
    //                 return res.status(200).json({
    //                     status: 0,
    //                     message: "Email(s) sent and logged successfully.",
    //                 });
    //             } else {
    //                 return res.status(500).json({
    //                     status: 1,
    //                     message: "Failed to send all emails.",
    //                 });
    //             }
    
    //         });
    
    //     } catch (error) {
    //         console.error("❌ Unexpected error:", error);
    //         return res.status(500).json({
    //             status: 1,
    //             message: "An unexpected error occurred.",
    //             error: error.message,
    //         });
    //     }
    // }    
    

    static async sendEmailTO(req, res) {
        try {
            console.log("🔥 Request Body:", req.body); // Debugging
    
            const { CaseID, PPuserID } = req.body;
    
            // ✅ Validate required fields
            if (!CaseID || !PPuserID) {
                return res.status(400).json({
                    status: 1,
                    message: "Fields 'CaseID' and 'PPuserID' are required.",
                });
            }
    
            // ✅ Call the updated stored procedure
            const query = "CALL sp_sendEmail_ppv1(?, ?)";
            db.query(query, [CaseID, PPuserID], async (err, results) => {
                if (err) {
                    console.error("❌ Error executing stored procedure:", err);
                    return res.status(500).json({
                        status: 1,
                        message: "Error retrieving data from the database.",
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
    
                // ✅ Extract required fields correctly
                const { 
                    PPEmail, 
                    CaseNumber, 
                    IPCSection, 
                    BNSSection, 
                    CaseDate, 
                    HearingDate, 
                    Districts, 
                    casePoliceStationName,
                    PoliceStations 
                } = emailDetails;
    
                // ✅ Define recipient
                const recipient = { email: PPEmail, userTypeId: 60 }; // Public Prosecutor (PP)
    
                // ✅ Validate email before proceeding
                if (!recipient.email) {
                    return res.status(400).json({
                        status: 1,
                        message: "No valid recipients found for email.",
                    });
                }
    
                // ✅ Generate email content for PP
                // const emailTemplatePP = new EmailTemplate({
                //     CaseNumber,
                //     CaseDate,
                //     IPCSection,
                //     BNSSection,
                //     HearingDate,
                //     Districts,
                //     casePoliceStationName,
                //     PoliceStations
                // });

                // const emailTemplatePP = new EmailTemplate({
                //     crm: BNSSection,
                //     psCaseNo: CaseNumber,
                //     dated: CaseDate,
                //     ipcSection: IPCSection,
                //     hearingDate: HearingDate,
                //     SPName: Districts,      
                //     PSName: casePoliceStationName || PoliceStations,  
                //     PPName: "You", 
                //   });

                console.log(emailDetails); // debug

                console.log("debugging...", {
                    crm: emailDetails.BNSSection,
                    psCaseNo: emailDetails.psCaseNo,
                    dated: emailDetails.dated,
                    ipcSection: emailDetails.IPCSection,
                    hearingDate: emailDetails.hearingDate,
                    SPName: emailDetails.SPName,
                    PSName: emailDetails.PSName,
                    PPName: "You"
                    });
                
                const emailTemplatePP = new EmailTemplate({
                crm: emailDetails.BNSSection,
                psCaseNo: emailDetails.psCaseNo,
                dated: emailDetails.dated,
                ipcSection: emailDetails.IPCSection,
                hearingDate: emailDetails.hearingDate,
                SPName: emailDetails.SPName,
                PSName: emailDetails.PSName,
                PPName: "You"
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
    
                const emailContentPP = emailTemplatePP.generateEmailCopy();
                let emailSendSuccess = false;
    
                // ✅ Send email
                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: recipient.email,
                    subject: `Case Update: ${emailDetails.psCaseNo}`,
                    html: `<pre>${emailContentPP}</pre>`,
                    dsn: {
                        id: `dsn-${CaseID}`,
                        return: 'headers',
                        notify: ['failure', 'delay'],
                        recipient: process.env.EMAIL_USER,
                    },
                };
    
                try {
                    const info = await transporter.sendMail(mailOptions);
                    console.log(`✅ Email sent to ${recipient.email}`);
    
                    emailSendSuccess = true; // ✅ Email was sent successfully
    
                    // ✅ Log successful email in `sp_logEmailDetails`
                    const logQuery = "CALL sp_logEmailDetails(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                    const logParams = [
                        info.messageId, // Message ID from nodemailer
                        CaseID,         // Case ID
                        CaseNumber,     // Case number
                        CaseDate,       // Case Date
                        IPCSection,
                        HearingDate,    // Hearing Date
                        recipient.email, // ✅ Email recipient
                        0,              // District ID (Not applicable here)
                        0,              // Police Station ID (Not applicable here)
                        PPuserID,       // ✅ Corrected PP ID
                        recipient.userTypeId, // ✅ Ensured userTypeId is correct (60 for PP)
                        1                // ✅ Success (Delivery Status)
                    ];
    
                    db.query(logQuery, logParams, (logErr) => {
                        if (logErr) {
                            console.error(`❌ Error logging email details for ${recipient.email}:`, logErr);
                        }
                    });
    
                } catch (emailError) {
                    console.error(`❌ Failed to send email to ${recipient.email}:`, emailError);
    
                    // ✅ Log failed email attempt in `sp_logEmailDetails`
                    const logQuery = "CALL sp_logEmailDetails(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                    const logParams = [
                        null,         // No message ID since email failed
                        CaseID,
                        CaseNumber,
                        CaseDate,
                        IPCSection,
                        HearingDate,
                        recipient.email,
                        0,              // District ID (Not applicable here)
                        0,              // Police Station ID (Not applicable here)
                        PPuserID,       // ✅ Corrected PP ID
                        recipient.userTypeId,
                        0             // ✅ Failure (Delivery Status)
                    ];
    
                    db.query(logQuery, logParams, (logErr) => {
                        if (logErr) {
                            console.error(`❌ Error logging failed email details for ${recipient.email}:`, logErr);
                        }
                    });
                }
    
                // ✅ Respond based on email sending status
                if (emailSendSuccess) {
                    return res.status(200).json({
                        status: 0,
                        message: "Email sent and logged successfully.",
                    });
                } else {
                    return res.status(500).json({
                        status: 1,
                        message: "Failed to send the email.",
                    });
                }
            });
    
        } catch (error) {
            console.error("❌ Unexpected error:", error);
            return res.status(500).json({
                status: 1,
                message: "An unexpected error occurred.",
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

                const { receiveEmail, ccEmail, psCaseNo, dated, CaseId, NexthearingDate, CaseDescription,CaseAdditionalRemarks,sp_id,ps_id,CaseRequiredDocument  } = emailDetails;

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
                                DistrictName :emailDetails.DistrictName,
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