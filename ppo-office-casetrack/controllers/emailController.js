const nodemailer = require("nodemailer");

class EmailController {
    /**
     * Send an email.
     */
    static async sendEmail(req, res) {
        const { to, subject, message } = req.body;

        // Validate required fields
        if (!to || !subject || !message) {
            return res.status(400).json({
                status: 1,
                message: "Fields 'to', 'subject', and 'message' are required.",
            });
        }

        try {
            // Configure the transporter
            const transporter = nodemailer.createTransport({
                host: "smtp.gmail.com", // Replace with your email provider's SMTP server
                port: 587, // Use 465 for secure or 587 for TLS
                secure: false, // true for 465, false for 587
                auth: {
                    user: process.env.EMAIL_USER, // Your email address
                    pass: process.env.EMAIL_PASSWORD // Your email password or app password
                },
            });

            // Define email options
            const mailOptions = {
                from: process.env.EMAIL_USER, // Sender address
                to: to, // Recipient email address
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
