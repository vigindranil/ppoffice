const db = require('../config/db'); // Import the DB connection

class DistrictModel {
  // Method to call the stored procedure for districts
  static showDistrict(callback) {
    const query = 'CALL showDistrict()';
    db.query(query, callback); // Execute the query and pass the callback
  }

  // Method to call the stored procedure for all cases by district ID
  static showAllCasesByDistrict(districtId, callback) {
    const query = 'CALL sp_ShowallCaseBydistrictID(?)';
    db.query(query, [districtId], callback); // Pass districtId as parameter
  }

  // Method to call the stored procedure for case counts by police station
  static getCaseCountsByPoliceStation(districtId, callback) {
    const query = 'CALL sp_CountCasesByPoliceStation(?)';
    db.query(query, [districtId], callback); // Pass districtId as parameter
  }
}

module.exports = DistrictModel;