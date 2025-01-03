// EmailController.js
const nodemailer = require("nodemailer");
const ResponseHelper = require('./ResponseHelper');
const db = require("../config/db");
const EmailTemplate = require('./emailTemplate');
const logger = require('../utils/logger'); // Import logger

class EmailController {
    static async sendEmail(req, res) {
        const { CaseID } = req.body;

        if (!CaseID) {
            logger.error("CaseID is required");
            return ResponseHelper.error(res, "CaseID is required");
        }

        try {
            const query = "CALL sp_sendEmail(?)";
            db.query(query, [CaseID], async (err, results) => {
                if (err) {
                    logger.error(`Error executing stored procedure: ${err}`);
                    return res.status(500).json({
                        status: 1,
                        message: "Error retrieving data from the database",
                    });
                }

                const rows = results[0];
                const emailDetails = rows[0];

                if (!emailDetails) {
                    logger.warn(`No email details found for CaseID: ${CaseID}`);
                    return res.status(404).json({
                        status: 1,
                        message: "No email details found for the given CaseID.",
                    });
                }

                const { receiveEmail, ccEmail, psCaseNo, dated, hearingDate, ipcSection, crm, sp_id, ps_id, ppEmail, PPId } = emailDetails;

                const emailTemplate = new EmailTemplate({ crm, psCaseNo, dated, ipcSection, hearingDate });

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
                };

                try {
                    const info = await transporter.sendMail(mailOptions);

                    logger.info(`Email sent successfully for CaseID: ${CaseID} to ${receiveEmail}`);

                    const logQuery = "CALL sp_logEmailDetails(?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?)";
                    const logParams = [
                        info.messageId,
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
                        PPId
                    ];

                    db.query(logQuery, logParams, (logErr) => {
                        if (logErr) {
                            logger.error(`Error logging email details for CaseID: ${CaseID}: ${logErr}`);
                            return res.status(500).json({
                                status: 1,
                                message: "Email sent, but logging failed.",
                            });
                        }

                        logger.info(`Email details logged successfully for CaseID: ${CaseID}`);
                        return res.status(200).json({
                            status: 0,
                            message: "Email sent and logged successfully.",
                            data: {
                                messageId: info.messageId,
                                response: info.response,
                            },
                        });
                    });
                } catch (emailError) {
                    logger.error(`Error sending email for CaseID: ${CaseID}: ${emailError}`);
                    return res.status(500).json({
                        status: 1,
                        message: "Failed to send the email.",
                        error: emailError.message,
                    });
                }
            });
        } catch (error) {
            logger.error(`Unexpected error in sendEmail for CaseID: ${CaseID}: ${error.message}`);
            return res.status(500).json({
                status: 1,
                message: "An unexpected error occurred.",
                error: error.message,
            });
        }
    }

    static async sendEmailTO(req, res) {
        const { CaseID, PPuserID } = req.body;

        if (!CaseID || !PPuserID) {
            logger.error("CaseID and PPuserID are required");
            return res.status(400).json({
                status: 1,
                message: "Fields 'CaseID' and 'PPuserID' are required.",
            });
        }

        try {
            const query = "CALL sp_sendEmail_pp(?, ?)";
            db.query(query, [CaseID, PPuserID], async (err, results) => {
                if (err) {
                    logger.error(`Error executing stored procedure: ${err}`);
                    return res.status(500).json({
                        status: 1,
                        message: "Error retrieving data from the database",
                    });
                }

                const rows = results[0];
                const emailDetails = rows[0];

                if (!emailDetails) {
                    logger.warn(`No email details found for CaseID: ${CaseID}`);
                    return res.status(404).json({
                        status: 1,
                        message: "No email details found for the given CaseID.",
                    });
                }

                const { receiveEmail, ccEmail, psCaseNo, dated, hearingDate, ipcSection, crm, ppEmail, PPName, SPName, PSName, PPId, sp_id, ps_id } = emailDetails;

                const emailTemplate1 = new EmailTemplate({ crm, psCaseNo, dated, ipcSection, PPName, hearingDate });
                const emailTemplate2 = new EmailTemplate({ crm, psCaseNo, dated, ipcSection, SPName, PSName, hearingDate });

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

                const mailOptions1 = {
                    from: process.env.EMAIL_USER,
                    to: receiveEmail,
                    cc: ccEmail,
                    subject: `Case Update: ${psCaseNo}`,
                    html: `<pre>${emailContent1}</pre>`,
                };

                const mailOptions2 = {
                    from: process.env.EMAIL_USER,
                    to: ppEmail,
                    subject: `Case Update: ${psCaseNo}`,
                    html: `<pre>${emailContent2}</pre>`,
                };

                const info1 = await transporter.sendMail(mailOptions1);
                const info2 = await transporter.sendMail(mailOptions2);

                logger.info(`Emails sent successfully for CaseID: ${CaseID}`);

                const logQuery = "CALL sp_logEmailDetails(?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?)";
                const logParams1 = [
                    info1.messageId,
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
                    PPId
                ];

                db.query(logQuery, logParams1, (logErr1) => {
                    if (logErr1) {
                        logger.error(`Error logging email details for CaseID: ${CaseID}: ${logErr1}`);
                        return res.status(500).json({
                            status: 1,
                            message: "Emails sent, but logging failed.",
                        });
                    }

                    const logQuery2 = "CALL sp_logEmailDetails(?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?)";
                    const logParams2 = [
                        info2.messageId,
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
                        PPId
                    ];

                    db.query(logQuery2, logParams2, (logErr2) => {
                        if (logErr2) {
                            logger.error(`Error logging second email details for CaseID: ${CaseID}: ${logErr2}`);
                            return res.status(500).json({
                                status: 1,
                                message: "Emails sent, but logging failed.",
                            });
                        }

                        logger.info(`Email details logged successfully for CaseID: ${CaseID}`);
                        return res.status(200).json({
                            status: 0,
                            message: "Emails sent successfully.",
                            data: {
                                messageId1: info1.messageId,
                                response1: info1.response,
                                messageId2: info2.messageId,
                                response2: info2.response,
                            },
                        });
                    });
                });
            });
        } catch (error) {
            logger.error(`Error sending email for CaseID: ${CaseID}: ${error.message}`);
            return res.status(500).json({
                status: 1,
                message: "Failed to send the email.",
                error: error.message,
            });
        }
    }
}

module.exports = EmailController;
