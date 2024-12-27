const serverUrl = 'http://localhost:8000';

// 2. Show PP Office Admin User List
export async function showPPOfficeAdminUserList(entryUserID) {
  try {

    const token = localStorage.getItem('authToken');
    if (!token) {
      return { success: false, message: 'No authorization token found.' };
    }

    const response = await fetch(`${serverUrl}/api/showppOfficeAdminUserList`, {
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