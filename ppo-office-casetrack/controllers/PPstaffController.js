const db = require('../config/db'); // Import the database connection

class UserController {
  static createUser(req, res) {
    const { Username, UserPassword, FullName, ContactNo, Email, LicenseNumber } = req.body;

    // Validate required fields
    if (!Username || !UserPassword || !FullName || !ContactNo || !Email || !LicenseNumber) {
      return res.status(400).json({
        status: 1,
        message: "All fields (Username, UserPassword, FullName, ContactNo, Email, LicenseNumber) are required.",
      });
    }

    // Define the query and parameters
    const query = `CALL sp_saveCreatePPstaff(?, ?, ?, ?, ?, ?, @ppstaff_id)`;
    const params = [Username, UserPassword, FullName, ContactNo, Email, LicenseNumber];

    // Call the stored procedure
    db.query(query, params, (err) => {
      if (err) {
        console.error("Error executing stored procedure:", err);
        return res.status(500).json({
          status: 1,
          message: "An error occurred while creating the user.",
        });
      }

      // Retrieve the OUT parameter (ppstaff_id)
      db.query(`SELECT @ppstaff_id AS id`, (err, results) => {
        if (err) {
          console.error("Error retrieving user ID:", err);
          return res.status(500).json({
            status: 1,
            message: "An error occurred while fetching the created user ID.",
          });
        }

        const insertedId = results[0]?.id;

        if (insertedId) {
          return res.status(201).json({
            status: 0,
            message: "User detail registered successfully",
            data: { id: insertedId },
          });
        } else {
          return res.status(500).json({
            status: 1,
            message: "User creation failed.",
            data: {},
          });
        }
      });
    });
  }
}

module.exports = UserController;
