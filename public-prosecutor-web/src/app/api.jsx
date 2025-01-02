import {BASE_URL} from './constants';


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


// 4. Show PP Office Head User List
export async function showPPOfficeHeadUserList(entryUserID) {
  try {

    const token = localStorage.getItem('authToken');
    if (!token) {
      return { success: false, message: 'No authorization token found.' };
    }

    const response = await fetch(`${BASE_URL}showppOfficeHeadUserList`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ EntryuserID: entryUserID }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error fetching PP Office Head User List:', error);
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