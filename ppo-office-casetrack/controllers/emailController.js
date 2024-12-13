const nodemailer = require("nodemailer");
const db = require("../config/db"); // Import the DB connection
const generateEmailTemplate = require("./emailTemplate"); // Import the email template generator

class EmailController {
    static async sendEmail(req, res) {
        const { CaseID } = req.body;

        // Validate required fields
        if (!CaseID ) {
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
                const emailContent = generateEmailTemplate({
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
}

module.exports = EmailController;
