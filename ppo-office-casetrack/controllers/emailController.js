const nodemailer = require("nodemailer");
const db = require('../config/db'); // Import the DB connection

class EmailController {
    /**
     * Send an email.
     */
    static async sendEmail(req, res) {
        const { CaseID, subject, message } = req.body;

        // Validate required fields
        if (!CaseID || !subject || !message) {
            return res.status(400).json({
                status: 1,
                message: "Fields 'CaseID', 'subject', and 'message' are required.",
            });
        }

        try {
            const query = 'CALL sp_sendEmail(?)'; // Using the parameterized query

            // Pass the CaseID as an argument to the stored procedure
            db.query(query, [CaseID], async (err, results) => {
                if (err) {
                    console.error('Error executing stored procedure:', err);
                    return res.status(500).json({
                        status: 1,
                        message: 'Error retrieving data from the database',
                        data: []
                    });
                }

                // Assuming your stored procedure returns data in results[0]
                const rows = results[0]; // Extract the array of rows
                const emailDetails = rows[0];

                if (!emailDetails) {
                    return res.status(404).json({
                        status: 1,
                        message: "No email details found for the given CaseID.",
                    });
                }

                const { receiveEmail, ccEmail } = emailDetails;
               

                // Configure the transporter
                const transporter = nodemailer.createTransport({
                    host: "smtp.gmail.com", // Replace with your email provider's SMTP server
                    port: 587, // Use 465 for secure or 587 for TLS
                    secure: false, // true for 465, false for 587
                    auth: {
                        user: process.env.EMAIL_USER, 
                        pass: process.env.EMAIL_PASSWORD 
                    },
                });

                // Define email options
                const mailOptions = {
                    from: process.env.EMAIL_USER, // Sender address
                    to: receiveEmail, // Recipient email address
                    cc: ccEmail, // CC email address
                    subject: subject, // Subject of the email
                    html: message, // HTML body content
                };

                // Send email
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

            // Return error response
            return res.status(500).json({
                status: 1,
                message: "Failed to send the email.",
                error: error.message,
            });
        }
    }
}

module.exports = EmailController;
