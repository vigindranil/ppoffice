import { useSelector } from 'react-redux';
import { decrypt } from '@/utils/crypto';
import { BASE_URL } from '@/app/constants';


// Helper function to get the token from Redux store
const useAuthToken = () => {
  return useSelector((state) => state.auth.token);
};

///////////////////////////////////////////////////////////////////////////////////////

// 4. Show PP Office Head User List
export const showPPOfficeHeadUserList = (encryptedUserData) => async (dispatch, getState) => {
  try {
    const token = getState().auth.token;
    console.log('Token in API call:', token);

    if (!token) {
      return { success: false, message: 'No authorization token found.' };
    }

    let decryptedUser;
    try {
      decryptedUser = JSON.parse(decrypt(encryptedUserData));
    } catch (error) {
      console.error('Error decrypting user data:', error);
      return { success: false, message: 'Error decrypting user data' };
    }

    const entryUserID = decryptedUser.AuthorityUserID;
    console.log('EntryUserID in API call:', entryUserID);

    if (!entryUserID) {
      return { success: false, message: 'User ID not found in decrypted data' };
    }

    const response = await fetch(`${BASE_URL}showppOfficeHeadUserList`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ EntryuserID: entryUserID }),
    });
    const data = await response.json();
    console.log('API Response:', data);
    return data;
  } catch (error) {
    console.error('Error fetching PP Office Head User List:', error);
    throw error;
  }
};

///////////////////////////////////////////////////////////////////////////////////////////

