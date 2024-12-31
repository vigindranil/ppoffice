const serverUrl = 'http://localhost:8000';

// 1. Add PP Office Admin
export async function addPPOfficeAdmin(adminData) {
  try {

    const token = localStorage.getItem('authToken');
    if (!token) {
      return { success: false, message: 'No authorization token found.' };
    }

    const response = await fetch(`${serverUrl}/api/addppofficeAdmin`, {
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









