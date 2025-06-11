// controllers/otpController.js

const { generateOtp, verifyOtp } = require("../models/otpModel");
const { sendSMSInternally } = require("../controllers/thirdPartyAPI");
const logger = require("../utils/logger");

const sendOtpV1 = async (req, res) => {
  try {
    const { userId, userTypeId } = req.body;

    if (!userId || !userTypeId) {
      return res.status(400).json({
        status: 1,
        message: "Invalid user credentials",
      });
    }

    const [result] = await generateOtp(userId, userTypeId);

    if (!result || result.ErrorCode != 0) {
      return res.status(404).json({
        status: 1,
        message: "User does not have access!",
      });
    }

    const { OTP, ContactNumber } = result;
    const smsText = `OTP to login in Public Prosecutor Application is ${OTP} DITE GoWB`;
    const smsCategory = "login message";
    const tpid = "1307172596406664446";

    const sent = await sendSMSInternally(smsText, ContactNumber, smsCategory, tpid);

    if (sent) {
      return res.status(200).json({
        status: 0,
        message: "OTP sent successfully",
        otp: OTP,
      });
    } else {
      return res.status(500).json({
        status: 1,
        message: "Failed to send OTP",
      });
    }
  } catch (error) {
    logger.error(error.message);
    return res.status(500).json({
      status: 1,
      message: "An error occurred, please try again.",
    });
  }
};

const verifyOtpV1 = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({
        status: 1,
        message: "Missing parameters.",
      });
    }

    const [result] = await verifyOtp(userId, otp);
    const { ErrorCode } = result;

    if (ErrorCode === 0) {
      return res.status(200).json({
        status: 0,
        message: "OTP verified successfully",
      });
    } else if (ErrorCode === 4) {
      return res.status(401).json({
        status: 1,
        message: "Invalid OTP. Please try again.",
      });
    } else if (ErrorCode === 6) {
      return res.status(403).json({
        status: 1,
        message: "Maximum OTP attempts exceeded.",
      });
    } else if (ErrorCode === 7) {
      return res.status(403).json({
        status: 1,
        message: "User account is inactive.",
      });
    }

    return res.status(400).json({
      status: 1,
      message: "OTP verification failed.",
    });
  } catch (error) {
    console.error("verifyOtpV1 error:", error.message);
    return res.status(500).json({
      status: 1,
      message: "Server error during OTP verification.",
    });
  }
};

module.exports = {
  sendOtpV1,
  verifyOtpV1,
};