const db = require('../config/db');
const ResponseHelper = require('./ResponseHelper');

class ipcBnsMasterController {

  static async showBnsSection(req, res) {
    try {
      const [results] = await db.promise().query('CALL showBnsSection()'); 

      if (!results || results.length === 0) { 
        return ResponseHelper.success_reponse(res,"No Data found",[]);
      }

      return ResponseHelper.success_reponse(res, "Data found", results[0]);
    } catch (error) {
      console.error('Error in showBnsSection:', error); 
      return ResponseHelper.error(res, "An error occurred while fetching data");
    }
  }

  static async showIpcByBns(req, res) {
    try {
      const {bnsId} = req.body; 

      // console.log(req.body);
      if (!bnsId) {
        return ResponseHelper.error(res, "bnsId is required in the request body"); 
      }

      const [results] = await db.promise().query('CALL showIpsSectionByBnsSection(?)', [bnsId]); 

      if (!results || results.length === 0) {
        return ResponseHelper.success_reponse(res,"No Data found",[]);
      }

      return ResponseHelper.success_reponse(res, "Data found", results[0]);
    } catch (error) {
      console.error('Error in showIpcByBns:', error);
      return ResponseHelper.error(res, "An error occurred while fetching data");
    }
  }


}

module.exports = ipcBnsMasterController;

// -mr