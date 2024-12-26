// import axios from 'axios';

// const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// export const fetchCasesByBoundaryId = async () => {
//   try {
//     // Retrieve BoundaryID from sessionStorage
//     const boundaryId = sessionStorage.getItem('BoundaryID');

//     if (!boundaryId) {
//       throw new Error('BoundaryID is not available in session storage');
//     }

//     const token = localStorage.getItem('authToken');

//     // Make the API request using the BoundaryID from sessionStorage
//     const response = await axios.get(`${BASE_URL}/api/showallCasesByBoundaryId?boundaryId=${boundaryId}`, {
//       headers: {
//         Authorization: `Bearer ${token}`
//       }
//     });

//     if (response.data.status === 0) {
//       return response.data.data; // Return the case data if the response is successful
//     } else {
//       throw new Error(response.data.message || 'Failed to fetch cases');
//     }
//   } catch (error) {
//     throw new Error(error.response?.data?.message || 'Error fetching case details');
//   }
// };


import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const fetchCasesByBoundaryId = async () => {
  try {
    // Retrieve BoundaryID from sessionStorage
    const boundaryId = sessionStorage.getItem('BoundaryID');
    if (!boundaryId) {
      throw new Error('BoundaryID is not available in session storage');
    }

    // Retrieve the auth token from localStorage
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication token is missing');
    }

    // Make the API request
    const response = await axios.get(`${BASE_URL}/api/showallCasesByBoundaryId`, {
      params: { boundaryId }, // Using `params` to handle query parameters
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Check if the API response is successful
    const { status, data, message } = response.data;
    if (status === 0) {
      return data; // Return case data on success
    } else {
      throw new Error(message || 'Failed to fetch cases');
    }
  } catch (error) {
    // Handle errors and provide meaningful feedback
    const errorMessage = error.response?.data?.message || error.message || 'Error fetching case details';
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};
