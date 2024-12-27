export const assignCase = async (staffId, caseNumber, caseDate, districtId, psId, caseTypeId) => {
  try {
    // Validation: Ensure all required fields are provided
    if (!staffId || !caseNumber || !caseDate) {
      return { success: false, message: 'All fields are required: PPstaffID, CaseNumber, and CaseDate.' };
    }

    // Get AuthorityUserID from sessionStorage
    const authorityUserId = sessionStorage.getItem('AuthorityUserID');
    console.log("AuthorityUserID from session:", authorityUserId); // Corrected console log
    
    if (!authorityUserId) {
      return { success: false, message: 'AuthorityUserID not found in session.' };
    }
    

    // Construct the payload for the API request
    const requestPayload = {
      PPstaffID: staffId,
      CaseNumber: caseNumber,
      CaseDate: caseDate,
      DistrictID: districtId,
      psID: psId,
      caseTypeID: caseTypeId,
      EntryUserID: authorityUserId, // Assuming userId is stored in localStorage
      // AuthorityUserID: authorityUserId,  // Send AuthorityUserID from session
    };

    // Get the authorization token from localStorage
    const token = localStorage.getItem('authToken');
    if (!token) {
      return { success: false, message: 'No authorization token found.' };
    }

    // Make the API call to assign the case
    const response = await fetch('http://localhost:8000/api/assigncase', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,  // Pass the token in the header
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload),
    });

    // Handle response from the API
    const result = await response.json();

    // Check for success or failure
    if (response.ok && result.status === 0) {
      return { success: true, message: 'Case allocated successfully!' };
    } else {
      // Handle API error responses
      return { success: false, message: result.message || 'Failed to allocate case.' };
    }
  } catch (error) {
    console.error('Error while allocating case:', error);
    return { success: false, message: 'An error occurred while allocating the case.' };
  }
};
