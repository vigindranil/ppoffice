import { sendSMSInternally } from './thirdPartyAPI';

const jwt = require('jsonwebtoken');
const { db } = require('../config/db'); // Import your database connection
const ResponseHelper = require('./ResponseHelper'); // Import the helper

// Secret key for signing the JWT (store this securely, e.g., in an environment variable)
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

class AuthController {
    // Method for user authentication
    static async authenticateUser(req, res) {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return ResponseHelper.error(res, "Username and password are required");
        }

        try {
            // Query the database using a stored procedure
            const query = `CALL sp_getAuthorityLogin(?, ?)`;
            const params = [username, password];

            db.query(query, params, (err, results) => {
                if (err) {
                    // Handle database errors
                    console.error("Database error:", err);
                    return ResponseHelper.error(res, "An error occurred while validating the user.");
                }

                // Check if the stored procedure returned any results
                if (results[0] && results[0].length > 0) {
                    // Generate a JWT token
                    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });

                    // Respond with success
                    return ResponseHelper.success(res, "Data found", results[0], token);
                } else {
                    // Respond with invalid credentials
                    return ResponseHelper.success(res, "Invalid credentials provided");
                }
            });
        } catch (error) {
            // Catch and handle any unexpected errors
            
            return ResponseHelper.error(res, "An unexpected error occurred during authentication.");
        }
    }
}

module.exports = AuthController;

// const jwt = require('jsonwebtoken');
// // const { db } = require('../config/db'); // Import your database connection
// const { executeQuery, executeQueryNoResult, executeRawQuery } = require('../config/db');
// const ResponseHelper = require('./ResponseHelper'); // Import the helper

// // Secret key for signing the JWT (store this securely, e.g., in an environment variable)
// const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// class AuthController {
//     // Method for user authentication
//     static async authenticateUser(req, res) {
//         const { username, password } = req.body;

//         // Validate input
//         if (!username || !password) {
//             return ResponseHelper.error(res, "Username and password are required");
//         }

//         try {
//             const query = `CALL sp_getAuthorityLogin(?, ?)`;
//             const params = [username, password];
        
//             const results = await executeQuery(query, params);
        
//             if (results && results[0]?.length > 0) {
//                 const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
//                 return ResponseHelper.success(res, "Data found", results[0], token);
//             } else {
//                 return ResponseHelper.success(res, "Invalid credentials provided");
//             }
//         } catch (error) {
//             return ResponseHelper.error(res, "An unexpected error occurred during authentication.", error);
//         }
//     }
// }

// module.exports = AuthController;

export const sendOtpV1 = async (req, res) => {
  try {
    const { userId, userTypeId } = req.body;
 
    if (!userId || !userTypeId) {
      return res.status(400).json({
        status: 1,
        message: "Invalid User",
        data: null,
      });
    }
 
    const rows = await genearateOtp(userId, userTypeId);
 
    // console.log("genrate otp", rows);
 
    if (!rows || rows.length == 0) {
      return res.status(400).json({
        status: 1,
        message: "User does not have access!",
      });
    }
 
    if (rows[0][0].ErrorCode == 0) {
      logger.debug(
        JSON.stringify({
          API: "sendOtp",
          REQUEST: { username, password },
          RESPONSE: {
            status: 0,
            message: "OTP sent successfully",
            otp: rows[0][0]["OTP"],
          },
        })
      );
 
      const smstext = `OTP to login in Public Prosecutor Application is ${rows[0][0]["OTP"]} DITE GoWB`;
      const mobileNumber = rows[0][0]["ContactNumber"];
      // const mobileNumber = "6202734737";
      const smsCategory = "login message";
      const tpid = "1307172596406664446";
 
      const smsStatus = await sendSMSInternally(
        smstext,
        mobileNumber,
        smsCategory,
        tpid
      );
 
      res.status(200).json({
        status: 0,
        message: "OTP sent successfully",
      });
    } else {
      return res.status(404).json({
        status: 1,
        message: "Invalid user.",
        data: null,
      });
    }
  } catch (error) {
    logger.error(error.message);
 
    return res.status(500).json({
      status: 1,
      message: "An error occurred, Please try again",
      data: null,
    });
  }
};