const serverUrl = 'http://localhost:8000';

// 4. Show PP Office Head User List
export async function showPPOfficeHeadUserList(entryUserID) {
  try {

    const token = localStorage.getItem('authToken');
    if (!token) {
      return { success: false, message: 'No authorization token found.' };
    }

    const response = await fetch(`${serverUrl}/api/showppOfficeHeadUserList`, {
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