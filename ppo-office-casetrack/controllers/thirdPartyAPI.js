const dotenv = require("dotenv");
const axios = require("axios");
const https = require("https");
const crypto = require("crypto");

dotenv.config();


// const sendSMSInternally = async (
//   smstext,
//   mobileNumber,
//   smsCategory = "N/A",
//   tpid
// ) => {
//   const BartaBaseURL = "http://barta.wb.gov.in/send_sms_ites_webel.php?";
//   const extra = "";
//   const passkey = "sms_webel_ites_5252_@$#"; // You can move this to .env if needed

//   try {
//     const numbers = encodeURIComponent(mobileNumber);
//     const message = encodeURIComponent(smstext);
//     const passkeyNew = encodeURIComponent(passkey);

//     const url = `${BartaBaseURL}mobile=${numbers}&message=${message}&templateid=${tpid}&extra=${extra}&passkey=${passkeyNew}`;

//     const response = await axios.post(
//       url,
//       {},
//       {
//         headers: { "Content-Type": "application/x-www-form-urlencoded" },
//         httpsAgent: new https.Agent({
//           secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
//         }),
//       }
//     );

//     return response.status === 200;
//   } catch (error) {
//     console.error("SMS Send Error:", error.message);
//     return false;
//   }
// };



const sendSMSInternally = async (smsText, ContactNumber) => {
  const API_URL = "https://ecanteenapi.wb.gov.in/SMS/api/OTPVerification";
  const API_KEY = process.env.ECANTEEN_API_KEY;

  try {
    const response = await axios.post(
      API_URL,
      {
        mobile: ContactNumber,
        msg: smsText
      },
      {
        headers: {
          "x-api-key": API_KEY,
          "Content-Type": "application/json"
        },
        httpsAgent: new https.Agent({
          secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
        }),
      }
    );

    return response.status === 200;
  } catch (error) {
    console.error("SMS Send Error:", error.message);
    return false;
  }
};

module.exports = {
  sendSMSInternally,
};