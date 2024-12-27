const nodemailer = require("nodemailer");
const db = require("../config/db"); // Import the DB connection
//const generateEmailTemplate = require("./emailTemplate"); // Import the email template generator

const EmailTemplate = require('./emailTemplate'); // Import the EmailTemplate class

class EmailController {
    static async sendEmail(req, res) {
        const { CaseID } = req.body;

        // Validate required fields
        if (!CaseID) {
            return res.status(400).json({
                status: 1,
                message: "Fields 'CaseID' and 'hearingDate' are required.",
            });
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

                const { receiveEmail, ccEmail, psCaseNo, dated, hearingDate, ipcSection, crm } = emailDetails;

                // Generate the email content
                const emailTemplate = new EmailTemplate({
                    crm,
                    psCaseNo,
                    dated,
                    ipcSection,
                    hearingDate,
                    //additionalInstructions,
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
                    html: `<pre>${emailContent}</pre>`, // Use <pre> to retain formatting
                };

                const info = await transporter.sendMail(mailOptions);

                return res.status(200).json({
                    status: 0,
                    message: "Email sent successfully.",
                    data: {
                        messageId: info.messageId,
                        response: info.response,
                    },
                });
            });
        } catch (error) {
            console.error("Error sending email:", error);

            return res.status(500).json({
                status: 1,
                message: "Failed to send the email.",
                error: error.message,
            });
        }
    }

    static async sendEmailTO(req, res) {
        const { CaseID, PPuserID } = req.body;

        // Validate required fields
        if (!CaseID || !PPuserID) {
            return res.status(400).json({
                status: 1,
                message: "Fields 'CaseID' and 'PPuserID' are required.",
            });
        }

        try {
            const query = "CALL sp_sendEmailV1(?,?)";

            db.query(query, [CaseID, PPuserID], async (err, results) => {
                if (err) {
                    console.error("Error executing stored procedure:", err);
                    return res.status(500).json({
                        status: 1,
                        message: "Error retrieving data from the database",
                    });
                }

                const rows = results[0];
                const emailDetails = rows[0];

                console.log(emailDetails);

                if (!emailDetails) {
                    return res.status(404).json({
                        status: 1,
                        message: "No email details found for the given CaseID.",
                    });
                }

                const { receiveEmail, ccEmail, psCaseNo, dated, hearingDate, ipcSection, crm, ppEmail, PPName, SPName, PSName } = emailDetails;

                // Create instances of EmailTemplate with the case details
                const emailTemplate1 = new EmailTemplate({
                    crm,
                    psCaseNo,
                    dated,
                    ipcSection,
                    PPName,
                    hearingDate,
                });

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

                // Generate the email content
                const emailContent1 = emailTemplate1.generateEmailSample();
                const emailContent2 = emailTemplate2.generateEmailCopy();

                // Mail options for both emails
                const mailOptions1 = {
                    from: process.env.EMAIL_USER,
                    to: receiveEmail,
                    cc: ccEmail,
                    subject: `Case Update: ${psCaseNo}`,
                    html: `<pre>${emailContent1}</pre>`, // Use <pre> to retain formatting
                };

                const mailOptions2 = {
                    from: process.env.EMAIL_USER,
                    to: ppEmail,
                    subject: `Case Update: ${psCaseNo}`,
                    html: `<pre>${emailContent2}</pre>`, // Use <pre> to retain formatting
                };

                // Send both emails
                const info1 = await transporter.sendMail(mailOptions1);
                const info2 = await transporter.sendMail(mailOptions2);

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
        } catch (error) {
            console.error("Error sending email:", error);

            return res.status(500).json({
                status: 1,
                message: "Failed to send the email.",
                error: error.message,
            });
        }
    }
}

module.exports = EmailController;
