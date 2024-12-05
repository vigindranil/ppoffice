const jwt = require('jsonwebtoken');
const db = require('../config/db'); // Import your database connection

// Secret key for signing the JWT (store this securely, e.g., in an environment variable)
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// Controller function for authentication
exports.authenticateUser = (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
    }

    
    const query = `CALL sp_getAuthorityLogin(?, ?)`;  // Call the stored procedure to validate the user
    const params = [username, password];     // Pass username and password as parameters
    
    db.query(query, params, (err, results) => {
        if (err) {
            console.error('Error executing stored procedure:', err);
            return res.status(500).json({ error: "An error occurred while validating the user." });
        }
        
        // Assuming the stored procedure returns a result indicating success/failure
        if (results[0] && results[0].length > 0) { 
            // Generate a JWT token
            const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });

            const response = {
                status: 0,
                message: 'data found',
                acess_token : token,
                data: results[0] // The data returned from the stored procedure
              };
        
              // Send the formatted JSON response
              res.json(response);

            

        } else {
            const response = {
                status: 1,
                message: 'Invalid Credential given',
                data: null // The data returned from the stored procedure
              };
              res.json(response);  
        }
    });
};
