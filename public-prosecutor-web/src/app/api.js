import { serverUrl } from '@/app/constants'; 

export async function addPPUser(data) {
  try {
    const token = sessionStorage.getItem('token');
    console.log(token);
    if (!token) {
      return { success: false, message: 'No authorization token found.' };
    }

    const response = await fetch(`${serverUrl}/api/addppUser`, {
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

    const response = await fetch(`${serverUrl}/api/getppuser?EntryuserID=2`, {
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
