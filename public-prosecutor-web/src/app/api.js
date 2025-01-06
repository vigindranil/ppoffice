import { BASE_URL } from '@/app/constants'; 

export async function addPPUser(data) {
  try {
    const token = sessionStorage.getItem('token');
    console.log(token);
    if (!token) {
      return { success: false, message: 'No authorization token found.' };
    }

    const response = await fetch(`${BASE_URL}addppUser`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return await response.json();
  } catch (error) {
    console.error('Error adding PP User:', error);
    throw error;
  }
}

export async function getPPUser(data) {
  try {
    const token = sessionStorage.getItem('token');
    if (!token) {
      return { success: false, message: 'No authorization token found.' };
    }

    const response = await fetch(`${BASE_URL}getppuser?EntryuserID=2`, {
      headers: {
        'Authorization': 'Bearer '+token
      },
    });
    return await response.json();
  } catch (error) {
    console.error('Error adding PP User:', error);
    throw error;
  }
}

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