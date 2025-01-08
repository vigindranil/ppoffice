import { BASE_URL } from '@/app/constants'; 

////////////////////////////////////////////

export async function addPPUser(data) {
  try {
    const token = sessionStorage.getItem('token');
    console.log(token);
    if (!token) {
      return { success: false, message: 'No authorization token found.' };
    }

    const response = await fetch(`${BASE_URL}addppUser`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return await response.json();
  } catch (error) {
    console.error('Error adding PP User:', error);
    throw error;
  }
}

export async function getPPUser(data) {
  try {
    const token = sessionStorage.getItem('token');
    if (!token) {
      return { success: false, message: 'No authorization token found.' };
    }

    const response = await fetch(`${BASE_URL}getppuser?EntryuserID=2`, {
      headers: {
        'Authorization': 'Bearer '+token
      },
    });
    return await response.json();
  } catch (error) {
    console.error('Error adding PP User:', error);
    throw error;
  }
}

export const fetchPPUsers = async (userID) => {
  return new Promise(async (resolve, reject) => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${BASE_URL}getppuser?EntryuserID=${userID}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (response.ok && result.status === 0) {
        resolve(result.data);
      } else {
        reject(result.message || 'An error occurred');
      }
    } catch (error) {
      reject(`Fetch error: ${error.message}`);
    }
  });
};

export const handleNotifyToPPUser = async (CaseID, PPuserID) => {
  return new Promise(async(resolve, reject) => {
    const token = sessionStorage.getItem('token')
    const response = await fetch(`${BASE_URL}send-email-pp`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({
        "CaseID": CaseID,
        "PPuserID": PPuserID
      }),

    })
    if (!response.ok) {
      reject('Failed to send email');
    }
    const result = await response.json()
    if (result.status === 0) {
      resolve(result.message);
      console.log('Sent email:', result.message);
    } else {
      reject(result.message);
    }
  })
}


export async function fetchCases(psId) {
  try {
    // Construct the URL with the provided psId
    const url = `http://localhost:8000/api/showallCasesBypsId?psId=${psId}`;
    const token = sessionStorage.getItem('token')
    // Perform the fetch operation
    const response = await fetch(url, {
      method: 'GET',
      headers: {
          'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Check if the response is successful
    if (!response.ok) {
      const errorDetail = await response.text();
      console.error('Error fetching cases:', errorDetail);
      throw new Error(`Failed to fetch cases: ${response.status} - ${errorDetail}`);
    }

    // Parse the JSON response
    const result = await response.json();

    // Check the status within the result
    if (result.status === 0) {
      return result.data || [];
    } else {
      throw new Error(result.message || 'Failed to fetch cases');
    }
  } catch (error) {
    console.error('Error fetching cases:', error);
    throw error;
  }
}

  //ps profile
  export async function fetchUserProfile(PSUserId) {
    try {
      const token = sessionStorage.getItem('token');
      console.log('Token:', token);

      const response = await fetch(`${BASE_URL}showpsUserById`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ PSUserId: PSUserId }),
      });

      if (!response.ok) {
        console.error('Response status:', response.status);
        const errorDetails = await response.text();
        console.error('Error details:', errorDetails);
        throw new Error('Failed to fetch user profile');
      }

      const result = await response.json();
      console.log('API Response:', result);

      if (result.status === 0 && result.message === "Data found") {
        return result.data[0];
      } else {
        throw new Error(result.message || 'No data found');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  export async function fetchEmailDetails(authorityTypeId, boundaryId) {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        throw new Error("Authorization token is missing");
      }

      const url = `${BASE_URL}/emailDetails`;
      console.log("Request URL:", url); // Log URL for debugging
      console.log("Request Body:", { authorityTypeId, boundaryId });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ authorityTypeId, boundaryId }),
      });

      if (!response.ok) {
        const errorMessage = `HTTP Error: ${response.status} ${response.statusText}`;
        console.error("API Response Error:", errorMessage);
        throw new Error(errorMessage);
      }

      const result = await response.json();
      if (result.status === 0 && result.message === "Data found") {
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to fetch email details');
      }
    } catch (error) {
      console.error("Error in fetchEmailDetails:", error.message);
      throw error;
    }
  }

  export async function markEmailAsRead(mailId, caseId, authorityTypeId, boundaryId) {
    try {
        const token = sessionStorage.getItem('token');
      const response = await fetch(`${BASE_URL}emailRead`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ mailId, caseId, authorityTypeId, boundaryId }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark email as read');
      }

      const result = await response.json();
      if (result.status === 0 && result.message === "Mail checked and updated successfully") {
        return result;
      } else {
        throw new Error(result.message || 'Failed to mark email as read');
      }
    } catch (error) {
      console.error('Error marking email as read:', error);
      throw error;
    }
  }

  export const fetchDashboardCount = async (userID) => {
    return new Promise(async (resolve, reject) => {
      try {
        const token = sessionStorage.getItem('token');
        const response = await fetch(`${BASE_URL}DashboardCount`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ "EntryuserID": userID }),
        });
  
        const result = await response.json();
  
        if (response.ok && result.status === 0) {
          console.log(result);
          
          resolve(result.data);
        } else {
          reject(result.message || 'An error occurred');
        }
      } catch (error) {
        reject(error.message);
      }
    });
  };
  
  
////////////////////////////////////////////////

// [SuperAdmin] Add PP Office Admin
export async function addPPOfficeAdmin(adminData) {
  try {

    const token = localStorage.getItem('authToken');
    if (!token) {
      return { success: false, message: 'No authorization token found.' };
    }

    const response = await fetch(`${BASE_URL}addppofficeAdmin`, {
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


// [SuperAdmin] Show PP Office Admin User List
export const showPPOfficeAdminUserList = async (req_body) => {
  return new Promise(async (resolve, reject) => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${BASE_URL}showppOfficeAdminUserList`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req_body),
      });

      const result = await response.json();

      if (response.ok && result.status === 0) {
        console.log(result.data)
        resolve(result.data);
      } else {
        reject(result.message || 'An error occurred');
      }
    } catch (error) {
      reject(`Fetch error: ${error.message}`);
    }
  });
};


// [SuperAdmin] Add PP Head
export async function addPPHead(headData) {
  try {

    const token = localStorage.getItem('authToken');
    if (!token) {
      return { success: false, message: 'No authorization token found.' };
    }

    const response = await fetch(`${BASE_URL}addppHead`, {
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


// [SuperAdmin] Show Head User
export const showPPOfficeHeadUserList = async (req_body) => {
  return new Promise(async (resolve, reject) => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${BASE_URL}showppOfficeHeadUserList`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req_body),
      });

      const result = await response.json();

      if (response.ok && result.status === 0) {
        console.log(result.data)
        resolve(result.data);
      } else {
        reject(result.message || 'An error occurred');
      }
    } catch (error) {
      reject(`Fetch error: ${error.message}`);
    }
  });
};


// [SuperAdmin] Add SP
export async function addSP(spData) {
  try {

    const token = localStorage.getItem('authToken');
    if (!token) {
      return { success: false, message: 'No authorization token found.' };
    }

    const response = await fetch(`${BASE_URL}addSP`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(spData),
    });
    return await response.json();
  } catch (error) {
    console.error('Error adding SP:', error);
    throw error;
  }
}


// [SuperAdmin] Show SP User
export const showSPUser = async (req_body) => {
  return new Promise(async (resolve, reject) => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${BASE_URL}showspUser`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req_body),
      });

      const result = await response.json();

      if (response.ok && result.status === 0) {
        console.log(result.data)
        resolve(result.data);
      } else {
        reject(result.message || 'An error occurred');
      }
    } catch (error) {
      reject(`Fetch error: ${error.message}`);
    }
  });
};


// [Office Admin] show all cases for office admin
export const showallCase = async (typeID) => {
  return new Promise(async (resolve, reject) => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${BASE_URL}showallCase?is_Assigned=${typeID}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      const result = await response.json();

      if (response.ok && result.status === 0) {
        console.log(result.data)
        resolve(result.data);
      } else {
        reject(result.message || 'An error occurred');
      }
    } catch (error) {
      reject(`Fetch error: ${error.message}`);
    }
  });
};


// [Office Admin] Add Case
export const createCaseOfficeAdmin = async (req_body) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log("Request body 123:", req_body); 
      
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${BASE_URL}cases/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req_body),
      });

      const result = await response.json();

      if (response.ok && result.status === 0) {
        resolve(result);
      } else {
        console.log("hi",result)
        reject(result.message || 'An error occurred 123');
      }
    } catch (error) {
      reject(`Fetch error: ${error.message}`);
    }
  });
};


// Case Type Dropdown
export const getcasetype = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${BASE_URL}getcasetype`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      const result = await response.json();

      if (response.ok && result.status === 0) {
        console.log(result.data)
        resolve(result.data);
      } else {
        reject(result.message || 'An error occurred');
      }
    } catch (error) {
      reject(`Fetch error: ${error.message}`);
    }
  });
};


// Case Reference Dropdown
export const showRefferenceDetails = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${BASE_URL}showRefferenceDetails`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      const result = await response.json();

      if (response.ok && result.status === 0) {
        console.log(result.data)
        resolve(result.data);
      } else {
        reject(result.message || 'An error occurred');
      }
    } catch (error) {
      reject(`Fetch error: ${error.message}`);
    }
  });
};



// District Dropdown
export const alldistrict = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${BASE_URL}alldistrict`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      const result = await response.json();

      if (response.ok && result.status === 0) {
        console.log(result.data)
        resolve(result.data);
      } else {
        reject(result.message || 'An error occurred');
      }
    } catch (error) {
      reject(`Fetch error: ${error.message}`);
    }
  });
};


// Police Station Dropdown dependent on District
export const showpoliceBydistrict = async (districtId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${BASE_URL}showpoliceBydistrict?districtId=${districtId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      const result = await response.json();

      if (response.ok && result.status === 0) {
        console.log(result.data)
        resolve(result.data);
      } else {
        reject(result.message || 'An error occurred');
      }
    } catch (error) {
      reject(`Fetch error: ${error.message}`);
    }
  });
};


// Send email-notification
export const handleNotifyFromPPOfficeAdmin = async (CaseID) => {
  return new Promise(async(resolve, reject) => {
    const token = sessionStorage.getItem('token')
    const response = await fetch(`${BASE_URL}send-email`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({
        "CaseID": CaseID
      }),

    })
    if (!response.ok) {
      reject('Failed to send email');
    }
    const result = await response.json()
    if (result.status === 0) {
      resolve(result.message);
      console.log('Sent email:', result.message);
    } else {
      reject(result.message);
    }
  })
}
