// controllers/showController.js
const db = require('../config/db'); // Import the DB connection
const ResponseHelper = require('./ResponseHelper'); // Import the helper

class DistrictController {
  // Handle the GET request for /show (Call stored procedure)
  static show(req, res) {
    const query = 'CALL showDistrict()';

    db.query(query, (err, results) => {
      if (err) {
        console.error('Error executing stored procedure:', err);
        return ResponseHelper.error(res, "An error occurred while executing the procedure");
      }


      // Assuming your stored procedure returns data in results[0]
      return ResponseHelper.success_reponse(res, "Data found", results[0]);
    });
  }

  // show all casesByDistrictId
  static async showallcasesBydistrict(req, res) {
    try {
      // Retrieve the district_id from the query parameters or request body
      const districtId = req.query.districtId;


      if (!districtId) {
        return ResponseHelper.error(res, "districtId is required");
      }

      // SQL query to call the stored procedure with the district_id parameter
      const query = 'CALL sp_ShowallCaseBydistrictID(?)';
      // Pass the districtId as an argument to the stored procedure
      db.query(query, [districtId], (err, results) => {
        if (err) {

          return ResponseHelper.error(res, "An error occurred while fetching data");
        }

        // Assuming your stored procedure returns data in results[0]
        return ResponseHelper.success_reponse(res, "Data found", results[0]);
      });
    } catch (error) {

      return ResponseHelper.error(res, "An unexpected error occurred");
    }
  }

  static async getCaseCountsByPoliceStation(req, res) {
    try {
      // Get the districtId from the request body
      const districtId = req.query.districtId;

      // Validate the input
      if (!districtId) {
        return res.status(400).json({ error: 'District ID is required.' });
      }

      // Call the stored procedure
      const query = "CALL sp_CountCasesByPoliceStation(?)";
      const params = [districtId]; // Ensure districtId is an integer

      db.query(query, [districtId], (err, results) => {
        if (err) {

          return ResponseHelper.error(res, "An error occurred while fetching data");
        }

        // Assuming your stored procedure returns data in results[0]
        return ResponseHelper.success_reponse(res, "Data found", results[0]);
      });
    } catch (error) {

      return ResponseHelper.error(res, "An unexpected error occurred");
    }
  }

  static async getCaseCountByDistrict(req, res) {
    try {
      const [results] = await db.promise().query('CALL sp_CountCasesByDistrict()'); 

      if (!results || results.length === 0) { 
        return ResponseHelper.success_reponse(res,"No Data found",[]);
      }

      return ResponseHelper.success_reponse(res, "Data found", results[0]);
    } catch (error) {
      console.error('Error in getCaseCountByDistrict:', error); 
      return ResponseHelper.error(res, "An error occurred while fetching data");
    }
  }

  static async getAssignedDistrictAndPoliceByCaseId(req, res) {
    try {
        console.log("🔥 Request Params:", req.body); // Debugging

        const { caseId } = req.body;

        // ✅ Validate required input fields
        if (!caseId) {
            return res.status(400).json({
                status: 1,
                message: "caseId is required.",
            });
        }

        // ✅ Call stored procedure
        const query = "CALL sp_getAssignedDistrictAndPoliceByCaseId(?)";
        db.query(query, [caseId], (err, results) => {
            if (err) {
                console.error("❌ Error executing stored procedure:", err);
                return res.status(500).json({
                    status: 1,
                    message: "Error retrieving assigned districts and police stations.",
                });
            }

            // ✅ Extract result set
            const assignedDistrictsAndPolice = results[0]; 

            if (!assignedDistrictsAndPolice || assignedDistrictsAndPolice.length === 0) {
                return res.status(404).json({
                    status: 1,
                    message: "No assigned districts or police stations found for the given caseId.",
                });
            }

            // ✅ Respond with success
            return res.status(200).json({
                status: 0,
                message: "Assigned districts and police stations retrieved successfully.",
                data: assignedDistrictsAndPolice,
            });
        });

      } catch (error) {
          console.error("❌ Unexpected error:", error);
          return res.status(500).json({
              status: 1,
              message: "An unexpected error occurred.",
              error: error.message,
          });
      }
  }

  static async getUnassignedDistrictByCaseId(req, res) {
    try {
        console.log("🔥 Request Params:", req.body); // Debugging

        const { caseId } = req.body;

        // ✅ Validate required input fields
        if (!caseId) {
            return res.status(400).json({
                status: 1,
                message: "caseId is required.",
            });
        }

        // ✅ Call stored procedure
        const query = "CALL sp_getUnassignedDistrictByCaseId(?)";
        db.query(query, [caseId], (err, results) => {
            if (err) {
                console.error("❌ Error executing stored procedure:", err);
                return res.status(500).json({
                    status: 1,
                    message: "Error retrieving unassigned districts.",
                });
            }

            // ✅ Extract result set
            const unassignedDistricts = results[0];

            if (!unassignedDistricts || unassignedDistricts.length === 0) {
                return res.status(404).json({
                    status: 1,
                    message: "No unassigned districts found for the given caseId.",
                });
            }

            // ✅ Respond with success
            return res.status(200).json({
                status: 0,
                message: "Unassigned districts retrieved successfully.",
                data: unassignedDistricts,
            });
        });

    } catch (error) {
        console.error("❌ Unexpected error:", error);
        return res.status(500).json({
            status: 1,
            message: "An unexpected error occurred.",
            error: error.message,
        });
    }
  }

  static async getUnassignedPoliceStationsByCaseAndDistrict(req, res) {
    try {
        console.log("🔥 Request Params:", req.body); // Debugging

        const { caseId, districtId } = req.body;

        // ✅ Validate required input fields
        if (!caseId || !districtId) {
            return res.status(400).json({
                status: 1,
                message: "Both caseId and districtId are required.",
            });
        }

        // ✅ Call stored procedure
        const query = "CALL sp_getUnassignedPoliceStationsByCaseAndDistrict(?, ?)";
        db.query(query, [caseId, districtId], (err, results) => {
            if (err) {
                console.error("❌ Error executing stored procedure:", err);
                return res.status(500).json({
                    status: 1,
                    message: "Error retrieving unassigned police stations.",
                });
            }

            // ✅ Extract result set
            const unassignedPoliceStations = results[0];

            if (!unassignedPoliceStations || unassignedPoliceStations.length === 0) {
                return res.status(404).json({
                    status: 1,
                    message: "No unassigned police stations found for the given caseId and districtId.",
                });
            }

            // ✅ Respond with success
            return res.status(200).json({
                status: 0,
                message: "Unassigned police stations retrieved successfully.",
                data: unassignedPoliceStations,
            });
        });

    } catch (error) {
        console.error("❌ Unexpected error:", error);
        return res.status(500).json({
            status: 1,
            message: "An unexpected error occurred.",
            error: error.message,
        });
    }
  }


}

module.exports = DistrictController;
