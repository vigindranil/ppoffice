const nodemailer = require("nodemailer");
const ResponseHelper = require('./ResponseHelper');
const db = require("../config/db"); // Import the DB connection
const EmailTemplate = require('./emailTemplate'); // Import the EmailTemplate class

class EmailController {
    static async sendEmail(req, res) {
        const { CaseID } = req.body;

        // Validate required fields
        if (!CaseID) {
            return ResponseHelper.error(res, "CaseID is required");
        }

        try {
            const query = "CALL sp_sendEmail(?)";

            db.query(query, [CaseID], async (err, results) => {
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

                const { receiveEmail, ccEmail, psCaseNo, dated, hearingDate, ipcSection, crm, sp_id, ps_id,ppEmail,PPId } = emailDetails;

                // Generate the email content
                const emailTemplate = new EmailTemplate({
                    crm,
                    psCaseNo,
                    dated,
                    ipcSection,
                    hearingDate,
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

                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: receiveEmail,
                    cc: ccEmail,
                    subject: `Case Update: ${psCaseNo}`,
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
                
                    // Log email details as success
                    const logQuery = "CALL sp_logEmailDetails(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)";
                    const logParams = [
                        info.messageId, // Message ID from nodemailer
                        CaseID,         // Case ID
                        psCaseNo,       // Case number
                        dated,          // Case Date
                        ipcSection,
                        hearingDate,    // Case Hearing Date
                        receiveEmail,
                        ccEmail,
                        sp_id,
                        ps_id,
                        ppEmail,
                        PPId,
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
                    const logQuery = "CALL sp_logEmailDetails(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)";
                    const logParams = [
                        null,           // No message ID since email failed
                        CaseID,         // Case ID
                        psCaseNo,       // Case number
                        dated,          // Case Date
                        ipcSection,
                        hearingDate,    // Case Hearing Date
                        receiveEmail,
                        ccEmail,
                        sp_id,
                        ps_id,
                        ppEmail,
                        PPId,
                        0
                    ];
                
                    db.query(logQuery, logParams, (logErr) => {
                        if (logErr) {
                            console.error("Error logging failed email details:", logErr);
                        }
                        // Respond with email failure
                        return res.status(500).json({
                            status: 1,
                            message: "Failed to send email.",
                            error: emailError.message,
                        });
                    });
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

    // static async sendEmailTO(req, res) {
    //     const { CaseID, PPuserID } = req.body;

    //     // Validate required fields
    //     if (!CaseID || !PPuserID) {
    //         return res.status(400).json({
    //             status: 1,
    //             message: "Fields 'CaseID' and 'PPuserID' are required.",
    //         });
    //     }

    //     try {
    //         const query = "CALL sp_sendEmail_pp(?, ?)";

    //         db.query(query, [CaseID, PPuserID], async (err, results) => {
    //             if (err) {
    //                 console.error("Error executing stored procedure:", err);
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

    //             const { receiveEmail, ccEmail, psCaseNo, dated, hearingDate, ipcSection, crm, ppEmail, PPName, SPName, PSName,PPId,sp_id,
    //                 ps_id } = emailDetails;

    //             // Create instances of EmailTemplate with the case details
    //             const emailTemplate1 = new EmailTemplate({
    //                 crm,
    //                 psCaseNo,
    //                 dated,
    //                 ipcSection,
    //                 PPName,
    //                 hearingDate,
    //             });

    //             const emailTemplate2 = new EmailTemplate({
    //                 crm,
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

    //             // Generate the email content
    //             const emailContent1 = emailTemplate1.generateEmailSample();
    //             const emailContent2 = emailTemplate2.generateEmailCopy();

    //             // Mail options for both emails
    //             const mailOptions1 = {
    //                 from: process.env.EMAIL_USER,
    //                 to: receiveEmail,
    //                 cc: ccEmail,
    //                 subject: `Case Update: ${psCaseNo}`,
    //                 html: `<pre>${emailContent1}</pre>`,
    //             };

    //             const mailOptions2 = {
    //                 from: process.env.EMAIL_USER,
    //                 to: ppEmail,
    //                 subject: `Case Update: ${psCaseNo}`,
    //                 html: `<pre>${emailContent2}</pre>`,
    //             };

    //             // Send both emails
    //             const info1 = await transporter.sendMail(mailOptions1);
    //             const info2 = await transporter.sendMail(mailOptions2);

    //             const logQuery = "CALL sp_logEmailDetails(?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?)";
    //             const logParams1 = [
    //                 info1.messageId, // Message ID from nodemailer
    //                 CaseID,         // Case ID
    //                 psCaseNo,       // Case number
    //                 dated,          // Case Date
    //                 ipcSection,
    //                 hearingDate,    // Case Hearing Date
    //                 receiveEmail,
    //                 ccEmail,
    //                 sp_id,
    //                 ps_id,          // PS ID (not available in this scenario)
    //                 ppEmail,
    //                 0,
    //                 1

    //             ];

    //             db.query(logQuery, logParams1, (logErr1) => {
    //                 if (logErr1) {
    //                     console.error("Error logging email details:", logErr1);
    //                     return res.status(500).json({
    //                         status: 1,
    //                         message: "Emails sent, but logging failed.",
    //                     });
    //                 }
    //                 const logQuery2 = "CALL sp_logEmailDetails(?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?)";
    //                 const logParams2 = [
    //                     info2.messageId, // Message ID from nodemailer
    //                     CaseID,         // Case ID
    //                     psCaseNo,       // Case number
    //                     dated,          // Case Date
    //                     ipcSection,
    //                     hearingDate,    // Case Hearing Date
    //                     receiveEmail,
    //                     ccEmail,
    //                     0,
    //                     0,          // PS ID (not available in this scenario)
    //                     ppEmail,
    //                     PPId,
    //                     1
    //                 ];

    //                 db.query(logQuery2, logParams2, (logErr2) => {
    //                     if (logErr2) {
    //                         console.error("Error logging email details:", logErr2);
    //                         return res.status(500).json({
    //                             status: 1,
    //                             message: "Emails sent, but logging failed.",
    //                         });
    //                     }

    //                     return res.status(200).json({
    //                         status: 0,
    //                         message: "Emails sent successfully.",
    //                         data: {
    //                             messageId1: info1.messageId,
    //                             response1: info1.response,
    //                             messageId2: info2.messageId,
    //                             response2: info2.response,
    //                             DistrictName :emailDetails.DistrictName,
    //                             PoliceStationName: emailDetails.PoliceStationName,
    //                             PPUserName:emailDetails.PPUserName

    //                         },
    //                     });
    //                 });
    //             });
    //         });
    //     } catch (error) {
    //         console.error("Error sending email:", error);
    //         return res.status(500).json({
    //             status: 1,
    //             message: "Failed to send the email.",
    //             error: error.message,
    //         });
    //     }
    // }

    static async sendEmailTO(req, res) {
        const { CaseID, PPuserID } = req.body;
    
        if (!CaseID || !PPuserID) {
            return res.status(400).json({
                status: 1,
                message: "Fields 'CaseID' and 'PPuserID' are required.",
            });
        }
    
        try {
            const query = "CALL sp_sendEmail_pp(?, ?)";
            db.query(query, [CaseID, PPuserID], async (err, results) => {
                if (err) {
                    console.error("Error executing stored procedure:", err);
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
    
                const {
                    receiveEmail,
                    ccEmail,
                    psCaseNo,
                    dated,
                    hearingDate,
                    ipcSection,
                    crm,
                    ppEmail,
                    PPName,
                    SPName,
                    PSName,
                    PPId,
                    sp_id,
                    ps_id,
                } = emailDetails;
    
                // send this mail to sp,ps
                const emailTemplate1 = new EmailTemplate({
                    crm,
                    psCaseNo,
                    dated,
                    ipcSection,
                    PPName,
                    hearingDate,
                });
              // send this mail to pp
                const emailTemplate2 = new EmailTemplate({
                    crm,
                    psCaseNo,
                    dated,
                    ipcSection,
                    SPName,
                    PSName,
                    hearingDate,
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
    
                const emailContent1 = emailTemplate1.generateEmailSample();
                const emailContent2 = emailTemplate2.generateEmailCopy();
    
                let deliveryStatus1 = 0;
                let deliveryStatus2 = 0;
                let messageId1 = null;
                let messageId2 = null;
    
                try {
                    const info1 = await transporter.sendMail({
                        from: process.env.EMAIL_USER,
                        to: receiveEmail,
                        cc: ccEmail,
                        subject: `Case Update: ${psCaseNo}`,
                        html: `<pre>${emailContent1}</pre>`,
                    });
                    deliveryStatus1 = 1;
                    messageId1 = info1.messageId;
                } catch (error) {
                    console.error("Failed to send email to district recipients:", error);
                }
    
                try {
                    const info2 = await transporter.sendMail({
                        from: process.env.EMAIL_USER,
                        to: ppEmail,
                        subject: `Case Update: ${psCaseNo}`,
                        html: `<pre>${emailContent2}</pre>`,
                    });
                    deliveryStatus2 = 1;
                    messageId2 = info2.messageId;
                } catch (error) {
                    console.error("Failed to send email to PP recipients:", error);
                }
    
                const logQuery = "CALL sp_logEmailDetails(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                const logParams1 = [
                    messageId1,
                    CaseID,
                    psCaseNo,
                    dated,
                    ipcSection,
                    hearingDate,
                    receiveEmail,
                    ccEmail,
                    sp_id,
                    ps_id,
                    ppEmail,
                    0,
                    deliveryStatus1,
                ];
    
                db.query(logQuery, logParams1, (logErr1) => {
                    if (logErr1) {
                        console.error("Error logging district email details:", logErr1);
                    }
    
                    const logParams2 = [
                        messageId2,
                        CaseID,
                        psCaseNo,
                        dated,
                        ipcSection,
                        hearingDate,
                        receiveEmail,
                        ccEmail,
                        0,
                        0,
                        ppEmail,
                        PPId,
                        deliveryStatus2,
                    ];
    
                    db.query(logQuery, logParams2, (logErr2) => {
                        if (logErr2) {
                            console.error("Error logging PP email details:", logErr2);
                        }
    
                        return res.status(200).json({
                            status: 0,
                            message: "Emails processed and logged.",
                            data: {
                                messageId1,
                                messageId2,
                                deliveryStatus1,
                                deliveryStatus2,
                                DistrictName: emailDetails.DistrictName,
                                PoliceStationName: emailDetails.PoliceStationName,
                                PPUserName: emailDetails.PPUserName,
                            },
                        });
                    });
                });
            });
        } catch (error) {
            console.error("Error sending email:", error);
            return res.status(500).json({
                status: 1,
                message: "Failed to process the request.",
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
