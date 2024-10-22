import axios from "axios";

export const fetchSalesforceProjectData = async (accessToken) => {
    const url = `https://${
      import.meta.env.VITE_SALESFORCE_DOMAIN
    }/services/data/v53.0/query/?q=select+id%2CName+from+New_Project_Process__c`;
  
    try {
      const response =
        await axios.get(url, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      return response.data;
    } catch (error) {
      console.error("Error fetching project data:", error);
      throw error;
    }
  }