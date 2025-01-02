import CryptoJS from "crypto-js";

const SECRET_KEY = "$Vyoma@123";

export const encrypt = (data) => {
  if (typeof data !== 'string') {
    data = JSON.stringify(data);
  }
  return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
};

export const decrypt = (encryptedData) => {
  if (!encryptedData) return null;
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    try {
      // Attempt to parse as JSON
      return JSON.parse(decryptedString);
    } catch {
      // If it's not JSON, return the string
      return decryptedString;
    }
  } catch (error) {
    console.error("Decryption error:", error);
    return null;
  }
};

