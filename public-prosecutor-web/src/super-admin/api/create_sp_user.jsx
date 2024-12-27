const serverUrl = 'http://localhost:8000';

// 5. Add SP
export async function addSP(spData) {
  try {

    const token = localStorage.getItem('authToken');
    if (!token) {
      return { success: false, message: 'No authorization token found.' };
    }

    const response = await fetch(`${serverUrl}/api/addSP`, {
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