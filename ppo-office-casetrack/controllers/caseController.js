const db = require("../config/db"); // Import your database connection

class CaseController {
    /**
     * Get case assignment details by case number.
     */
    static async getCaseAssign(req, res) {
        const { CaseNumber } = req.query; // Get the CaseNumber from query parameters

        // Validate input
        if (!CaseNumber) {
            return res.status(400).json({
                status: 1,
                message: "CaseNumber is required.",
            });
        }

        try {
            // Call the stored procedure
            const query = "CALL sp_getCaseAssign(?)";
            const params = [CaseNumber];

            // Execute the query
            const results = await new Promise((resolve, reject) => {
                db.query(query, params, (err, results) => {
                    if (err) {
                        console.error("SQL Error executing stored procedure:", err);
                        return reject({ sqlError: true, error: err });
                    }
                    resolve(results[0]); // The first result set contains the data
                });
            });

            // Check if any record was found
            if (results.length === 0) {
                return res.status(404).json({
                    status: 1,
                    message: `No case assignment found for CaseNumber: ${CaseNumber}`,
                });
            }

            // Respond with the case assignment details
            return res.status(200).json({
                status: 0,
                message: "Case assignment details retrieved successfully.",
                data: results, // Send the fetched data
            });
        } catch (error) {
            if (error.sqlError) {
                // SQL-specific error handling
                return res.status(500).json({
                    status: 1,
                    message: "A database error occurred while processing your request.",
                    error: {
                        sqlState: error.error.sqlState || null,
                        code: error.error.code || null,
                        message: error.error.message || "Unknown SQL error",
                    },
                });
            } else {
                // General error handling
                console.error("Unexpected error:", error);
                return res.status(500).json({
                    status: 1,
                    message: "An unexpected error occurred while retrieving the case assignment.",
                });
            }
        }
    }
}

module.exports = CaseController;
