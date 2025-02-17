import { BASE_URL } from '@/app/constants';
import axios from 'axios';



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




export async function fetchBnsSectionDetails(bnsId, token) {
    try {
      const response = await axios.post(
        `${BASE_URL}showIpcByBns`,
        { bnsId: bnsId },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      if (response.data.status === 0 && response.data.data) {
        console.log("Fetched BNS detail:", response.data.data);
        return response.data;
      } else {
        throw new Error('Failed to fetch BNS section details');
      }
    } catch (error) {
      console.error('Error fetching BNS section details:', error);
      throw error;
    }
  }