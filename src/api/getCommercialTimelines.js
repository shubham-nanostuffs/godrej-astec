import axios from 'axios';

const getCommercialTimelines = async (accessToken, projectId) => {
  try {
    const url = `https://${import.meta.env.VITE_SALESFORCE_DOMAIN
      }/services/data/v53.0/query/?q=Select+A0_Indicative_Commercial_Timelines__c%2C%20A1_Indicative_Commercial_Timelines__c%2C%20A2_Indicative_Commercial_Timelines__c%2C%20A3_Indicative_Commercial_Timelines__c%2C%20A4_Indicative_Commercial_Timelines__c%2C%20A5_Indicative_Commercial_Timelines__c%20from%20New_Project_Process__c+where+Id%3D%20%27${projectId}%27%20`;
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching Commercial Timelines :', error);
    throw error;
  }
};

export default getCommercialTimelines;
