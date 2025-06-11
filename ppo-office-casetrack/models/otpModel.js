// const { pool } = require('../config/db');

// const generateOtp = async (userId, userTypeId) => {
//   const connection = pool.getConnection();
//   try {
//     const [rows] = await connection.query(
//       `CALL sp_genearateotp(?, ?, @p_otp, @contactNumber, @ErrorCode); 
//        SELECT @p_otp AS OTP, @contactNumber AS ContactNumber, @ErrorCode AS ErrorCode;`,
//       [userId, userTypeId]
//     );
//     return rows[1]; // second result contains output variables
//   } catch (error) {
//     throw error;
//   } finally {
//     connection.release();
//   }
// };

// const verifyOtp = async (userId, otp) => {
//   const connection = pool.getConnection();
//   try {
//     const [rows] = await connection.query(
//       `CALL sp_checkOTP(?, ?, @ErrorCode); 
//        SELECT @ErrorCode AS ErrorCode;`,
//       [userId, otp]
//     );
//     return rows[1]; // output params come in the second result
//   } catch (error) {
//     throw error;
//   } finally {
//     connection.release();
//   }
// };

// module.exports = {
//   generateOtp,
//   verifyOtp,
// };

const { pool } = require('../config/db');

const generateOtp = async (userId, userTypeId) => {
  try {
    await pool.query(
      `CALL sp_genearateotp(?, ?, @p_otp, @contactNumber, @ErrorCode);`,
      [userId, userTypeId]
    );
    const [selectResult] = await pool.query(
      `SELECT @p_otp AS OTP, @contactNumber AS ContactNumber, @ErrorCode AS ErrorCode;`
    );
    console.log("Full selectResult (generateOtp):", JSON.stringify(selectResult, null, 2));
    // if (selectResult && selectResult[0]) {
    //   return selectResult[0]; //  <---  Return the object directly!
    if (selectResult) {
      return selectResult; //  <---  Return the object directly!
    } else {
      return null;
    }
  } catch (error) {
    throw error;
  }
};

const verifyOtp = async (userId, otp) => {
  try {
    await pool.query(
      `CALL sp_checkOTP(?, ?, @ErrorCode);`,
      [userId, otp]
    );
    const [selectResult] = await pool.query(
      `SELECT @ErrorCode AS ErrorCode;`
    );
    console.log("Full selectResult (verifyOtp):", JSON.stringify(selectResult, null, 2));
    if (selectResult) {
      return selectResult  //  <---  Return the object directly!
    } else {
      return null;
    }
  } catch (error) {
    throw error;
  }
};

module.exports = {
  generateOtp,
  verifyOtp,
};