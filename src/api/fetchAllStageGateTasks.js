import axios from 'axios';

// Function to call the Salesforce API for Stage Gate Tasks
const fetchAllStageGateTasks = async (accessToken) => {
  try {
    const response = await axios.get(
      `https://${import.meta.env.VITE_SALESFORCE_DOMAIN}/services/data/v53.0/query/?q=SELECT%20Id%2CisRequired__c%2CAssigned_To__c%2CDays_To_Complete__c%2CisCDMO__c%2CisEnterprise__c%2CName%2CPrerequisites__c%2CPriority__c%2CStage_Gate_Activities_Template__c%2CSUBJECT__c%2C%20%20%20%20Stage_Gate_Activities_Template__r.Name%20FROM%20Stage_Gate_Activities_Task__c`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    console.log('Stage Gate Tasks Data:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching Stage Gate Tasks:', error);
    throw error;
  }
};

export default fetchAllStageGateTasks;
