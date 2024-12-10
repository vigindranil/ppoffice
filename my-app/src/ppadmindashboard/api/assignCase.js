// api.js

const API_BASE_URL = 'http://localhost:8000/api';

export const assignCase = async (PPstaffID, CaseNumber, CaseDate) => {
  try {
    const token = localStorage.getItem('authToken'); // Assuming you store the auth token in localStorage
    const response = await fetch(`${API_BASE_URL}/assigncase`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        PPstaffID,
        CaseNumber,
        CaseDate,
        EntryUserID: localStorage.getItem('userId'), // Assuming you store the user ID in localStorage
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, message: data.message, data: data.data };
    } else {
      return { success: false, message: data.message || 'Failed to assign case' };
    }
  } catch (error) {
    console.error('Error assigning case:', error);
    return { success: false, message: 'An error occurred while assigning the case' };
  }
};