import CryptoJS from "crypto-js";

const SECRET_KEY = "$Vyoma@123";

export const encrypt = (data) => {
  return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
};

export const decrypt = (data) => {
  if(data){
    const bytes = CryptoJS.AES.decrypt(data, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  }else {
    return null
  }
};
