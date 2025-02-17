const db = require('../config/db');
const ResponseHelper = require('./ResponseHelper');

class ipcBnsMasterController {

  static async showBnsSection(req, res) {
    try {
      const [results] = await db.promise().query('CALL sp_showBnsSection()'); 

      if (!results || results.length === 0) { 
        return ResponseHelper.success_reponse(res,"No Data found",[]);
      }

      return ResponseHelper.success_reponse(res, "Data found", results[0]);
    } catch (error) {
      console.error('Error in showBnsSection:', error); 
      return ResponseHelper.error(res, "An error occurred while fetching data");
    }
  }

  static async showIbsByBnsId(req, res) {
    try {
      const {bnsId} = req.body; 

      // console.log(req.body);
      if (!bnsId) {
        return ResponseHelper.error(res, "bnsId is required in the request body"); 
      }

      const [results] = await db.promise().query('CALL sp_ShowIbsByBnsId(?)', [bnsId]); 

      if (!results || results.length === 0) {
        return ResponseHelper.success_reponse(res,"No Data found",[]);
      }

      return ResponseHelper.success_reponse(res, "Data found", results[0]);
    } catch (error) {
      console.error('Error in showIpcByBns:', error);
      return ResponseHelper.error(res, "An error occurred while fetching data");
    }
  }

  static async search(req, res) {
    const { type, searchTerm } = req.body; 
    try {

      console.log(req.body);

        let query = '';
        switch (type) {
            case 'bnsSection':
                query = `CALL sp_BnsSearch(?)`;
                break;
            case 'ipcSection':
                query = `CALL showIpcSection(?)`; 
                break;
            case 'subject':
                query = `CALL sp_IbsSubjectSearch(?)`;
                break;
            case 'summary':
                query = `CALL showIbsSummary(?)`; 
                break;
            default:
                return ResponseHelper.error(res, "Invalid search type", 400);
        }

        const [results] = await db.promise().query(query, [searchTerm]);
        return ResponseHelper.success_reponse(res, "Data found", results[0]);

    } catch (error) {
        console.error("Search API error:", error);
        return ResponseHelper.error(res, "An error occurred during search", 500);
    }
  }

}

module.exports = ipcBnsMasterController;

// -mr