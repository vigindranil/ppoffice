import { BASE_URL } from '@/app/constants'; 

export const fetchPPUsers = async (userID) => {
  return new Promise(async (resolve, reject) => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${BASE_URL}getppuser?EntryuserID=${userID}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (response.ok && result.status === 0) {
        resolve(result.data);
      } else {
        reject(result.message || 'An error occurred');
      }
    } catch (error) {
      reject(`Fetch error: ${error.message}`);
    }
  });
};

export const handleNotifyToPPUser = async (CaseID, PPuserID) => {
  return new Promise(async(resolve, reject) => {
    const token = sessionStorage.getItem('token')
    const response = await fetch(`${BASE_URL}send-email-pp`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({
        "CaseID": CaseID,
        "PPuserID": PPuserID
      }),

    })
    if (!response.ok) {
      reject('Failed to send email');
    }
    const result = await response.json()
    if (result.status === 0) {
      resolve(result.message);
      console.log('Sent email:', result.message);
    } else {
      reject(result.message);
    }
  })
}

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


// 6. Show Head User
export const showPPOfficeHeadUserList = async (req_body) => {
  return new Promise(async (resolve, reject) => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${BASE_URL}showppOfficeHeadUserList`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req_body),
      });

      const result = await response.json();

      if (response.ok && result.status === 0) {
        console.log(result.data)
        resolve(result.data);
      } else {
        reject(result.message || 'An error occurred');
      }
    } catch (error) {
      reject(`Fetch error: ${error.message}`);
    }
  });
};