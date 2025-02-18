import { BASE_URL } from '@/app/constants';
import axios from 'axios';
import { el } from 'date-fns/locale';



export async function fetchBnsSections(token) {
  try {
    const response = await axios.post(`${BASE_URL}showBnsSection`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data.status === 0 && response.data.data) {
      console.log("Full response data:", response.data.data);
      return response.data.data; 
    } else {
      throw new Error('Failed to fetch BNS sections');
    }
  } catch (error) {
    console.error('Error fetching BNS sections:', error);
    throw error;
  }
}



export async function fetchIpcSections(token) {
  try {
    const response = await axios.post(`${BASE_URL}showIpcSection`, {}, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (response.data.status === 0 && response.data.data) {
      return response.data.data; // [{ bnsId, ipcSection }, ...]
    } else {
      throw new Error("Failed to fetch IPC sections");
    }
  } catch (error) {
    console.error("Error fetching IPC sections:", error);
    throw error;
  }
}




// export async function fetchBnsSectionDetails(bnsId, token) {
//     try {
//      return null
//     } catch (error) {
//       console.error('Error fetching BNS section details:', error);
//       throw error;
//     }
//   }

export async function fetchBnsIdFromBnsSection(selectedBnsSection, token) {
  try {
    const response = await axios.post(`${BASE_URL}showBnsSection`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.status === 0 && response.data.data) {
      const sections = response.data.data;
      const matched = sections.find(item => item.bnsSection === selectedBnsSection);
      if (matched) {
        console.log("Fetched BNS ID:", matched.bnsId);
        return matched.bnsId;
      } else {
        throw new Error('BNS section not found');
      }
    } else {
      throw new Error('Failed to fetch BNS sections');
    }
  } catch (error) {
    console.error('Error fetching BNS ID:', error);
    throw error;
  }
}


export async function fetchBnsIdFromIpcSection(ipcSection, token) {
  try {
    const response = await axios.post(`${BASE_URL}showIpcSection`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.status === 0 && response.data.data) {
      const sections = response.data.data;
      const matched = sections.find(item => item.ipcSection === ipcSection);
      if (matched) {
        console.log("Fetched BNS ID:", matched.bnsId);
        return matched.bnsId;
      } else {
        throw new Error('BNS section not found');
      }
    } else {
      throw new Error('Failed to fetch BNS sections');
    }
  } catch (error) {
    console.error('Error fetching BNS ID:', error);
    throw error;
  }
}



export async function fetchIbsByBnsId(bnsId, token) {
  try {
    const response = await axios.post(
      `${BASE_URL}showIbsByBnsId`,
      { bnsId },
      {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      }
    );
    if (response.data.status === 0 && response.data.data) {
      // Return the first element of the data array
      return response.data.data[0];
    } else {
      throw new Error("Failed to fetch IBS data");
    }
  } catch (error) {
    console.error("Error fetching IBS data:", error);
    throw error;
  }
}