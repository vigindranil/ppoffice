import { useSelector } from 'react-redux';
import { decrypt } from '@/utils/crypto';
import { BASE_URL } from './constants';


// 1. Add PP Office Admin
export async function addPPOfficeAdmin(adminData) {
  try {

    const token = localStorage.getItem('authToken');
    if (!token) {
      return { success: false, message: 'No authorization token found.' };
    }

    const response = await fetch(`${BASE_URL}addppofficeAdmin`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(adminData),
    });
    return await response.json();
  } catch (error) {
    console.error('Error adding PP Office Admin:', error);
    throw error;
  }
}


// 2. Show PP Office Admin User List
export async function showPPOfficeAdminUserList(entryUserID) {
  try {

    const token = localStorage.getItem('authToken');
    if (!token) {
      return { success: false, message: 'No authorization token found.' };
    }

    const response = await fetch(`${BASE_URL}showppOfficeAdminUserList`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ EntryuserID: entryUserID }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error fetching PP Office Admin User List:', error);
    throw error;
  }
}


// 3. Add PP Head
export async function addPPHead(headData) {
  try {

    const token = localStorage.getItem('authToken');
    if (!token) {
      return { success: false, message: 'No authorization token found.' };
    }

    const response = await fetch(`${BASE_URL}addppHead`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(headData),
    });
    return await response.json();
  } catch (error) {
    console.error('Error adding PP Head:', error);
    throw error;
  }
}


// 5. Add SP
export async function addSP(spData) {
  try {

    const token = localStorage.getItem('authToken');
    if (!token) {
      return { success: false, message: 'No authorization token found.' };
    }

    const response = await fetch(`${BASE_URL}addSP`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(spData),
    });
    return await response.json();
  } catch (error) {
    console.error('Error adding SP:', error);
    throw error;
  }
}


// 6. Show SP User
export async function showSPUser(entryUserID, districtID) {
    try {

      const token = localStorage.getItem('authToken');
    if (!token) {
      return { success: false, message: 'No authorization token found.' };
    }

      const response = await fetch(`${BASE_URL}showspUser`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ EntryuserID: entryUserID, DistrictID: districtID }),
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching SP User:', error);
      throw error;
    }
  }




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

