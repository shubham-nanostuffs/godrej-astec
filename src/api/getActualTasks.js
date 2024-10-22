import axios from 'axios';

const getActualTasks = async (accessToken, projectId) => {
  try {
    const url = `https://${
        import.meta.env.VITE_SALESFORCE_DOMAIN
      }/services/data/v53.0/query/?q=select+id%2CActivityDate%2C%20Comments__c%2C%20Prerequisite_Status__c%2C%20prerequisite__c%2C%20No_Go_Comments__c%2Csubject%2Cwhat.name%2CStage_Gates__r.name%2CStage_Gates__c%2C%20Start_Date__c%2C%20Owner.name%2CDays__c%2C%20Status%2C%20CompletedDateTime%2C%20CreatedDate%2C%20WhatId%2CStage_Gates__r.Start_Date__c%2CStage_Gates__r.CurrencyIsoCode%2CStage_Gates__r.CreatedDate%2CStage_Gates__r.Stage_Gate_Activities_Template__r.name+from%20task%20where+WhatId%20%3D%27${projectId}%27%20`;
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data; 
  } catch (error) {
    console.error('Error fetching actual tasks:', error);
    throw error;
  }
};

export default getActualTasks;
