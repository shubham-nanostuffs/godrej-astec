// src/services/salesforceProjectApi.ts
import axios, { AxiosResponse } from 'axios';

export interface SalesforceTaskDataResponse {
  records: Array<{
    Id: string;
    ActivityDate: string;
    Subject: string;
    Start_Date__c: string;
    Status: string;
    Owner: {
      Name: string;
    };
    Stage_Gates__r: {
      Name: string;
      Stage_Gate_Activities_Template__r: {
        Name: string;
      };
    };
  }>;
};


export const fetchSalesforceTaskData = async (accessToken: string, projectId: string): Promise<SalesforceTaskDataResponse> => {
  projectId = "a0TIl000000Hz5AMAS";
  const url = `https://velocity-innovation-7343--developer.sandbox.my.salesforce.com/services/data/v53.0/query/?q=select+id%2CActivityDate%2C%20Comments__c%2C%20Prerequisite_Status__c%2C%20prerequisite__c%2C%20No_Go_Comments__c%2Csubject%2Cwhat.name%2CStage_Gates__r.name%2CStage_Gates__c%2C%20Start_Date__c%2C%20Owner.name%2CDays__c%2C%20Status%2C%20CompletedDateTime%2C%20CreatedDate%2C%20WhatId%2CStage_Gates__r.Start_Date__c%2CStage_Gates__r.CurrencyIsoCode%2CStage_Gates__r.CreatedDate%2CStage_Gates__r.Stage_Gate_Activities_Template__r.name+from%20task%20where+WhatId%20%3D%27${projectId}%27%20`;

  try {
    const response: AxiosResponse<SalesforceTaskDataResponse> = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log("HEre is tasks response", response);
    
    return response.data;
  } catch (error) {
    console.error('Error fetching task data:', error);
    throw error;
  }
};
