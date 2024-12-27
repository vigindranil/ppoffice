async function saveCase(caseData) {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }
  
      const response = await fetch('http://localhost:8000/api/addCase', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(caseData)
      });
  
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized: Please log in again');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const result = await response.json();
      if (result.status === 0) {
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to save case');
      }
    } catch (error) {
      console.error('Error saving case:', error);
      throw error;
    }
  }
  
  export { saveCase };
  