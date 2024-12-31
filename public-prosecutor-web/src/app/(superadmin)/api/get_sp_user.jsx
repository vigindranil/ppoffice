const serverUrl = 'http://localhost:8000';

// 6. Show SP User
export async function showSPUser(entryUserID, districtID) {
    try {

      const token = localStorage.getItem('authToken');
    if (!token) {
      return { success: false, message: 'No authorization token found.' };
    }

      const response = await fetch(`${serverUrl}/api/showspUser`, {
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