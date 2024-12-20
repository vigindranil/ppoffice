async function fetchReferenceDetails() {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const response = await fetch('http://localhost:8000/api/showRefferenceDetails', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized: Please log in again');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data.status === 0 && data.data) {
      return data.data;
    } else {
      throw new Error(data.message || 'Failed to fetch reference details');
    }
  } catch (error) {
    console.error('Error fetching reference details:', error);
    throw error; // Re-throw the error so it can be handled by the component
  }
}

export { fetchReferenceDetails };

