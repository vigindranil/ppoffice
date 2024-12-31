const serverUrl = 'http://localhost:8000';

// 3. Add PP Head
export async function addPPHead(headData) {
  try {

    const token = localStorage.getItem('authToken');
    if (!token) {
      return { success: false, message: 'No authorization token found.' };
    }

    const response = await fetch(`${serverUrl}/api/addppHead`, {
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