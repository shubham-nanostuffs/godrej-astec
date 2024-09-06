import axios, { AxiosResponse } from "axios";

export interface SalesforceTaskDataResponse {
  records: Array<{
    Id: string;
    ActivityDate: Date | null; // Allow null
    Subject: string;
    Start_Date__c: Date | null; // Allow null
    Status: string;
    CompletedDateTime: Date | null;
    Owner: {
      Name: string;
    };
    Stage_Gates__r: {
      End_Date__c: Date;
      Name: string;
      Stage_Gate_Activities_Template__r: {
        Name: string;
      };
      Start_Date__c: Date | null;
    };
  }>;
}

export const fetchSalesforceTaskData = async (
  accessToken: string,
  projectId: string
): Promise<SalesforceTaskDataResponse> => {
  const url = `https://${
    import.meta.env.VITE_SALESFORCE_DOMAIN
  }/services/data/v53.0/query/?q=select+id%2CActivityDate%2C%20Comments__c%2C%20Prerequisite_Status__c%2C%20prerequisite__c%2C%20No_Go_Comments__c%2Csubject%2Cwhat.name%2CStage_Gates__r.name%2CStage_Gates__c%2C%20Start_Date__c%2C%20Owner.name%2CDays__c%2C%20Status%2C%20CompletedDateTime%2C%20CreatedDate%2C%20WhatId%2CStage_Gates__r.Start_Date__c%2CStage_Gates__r.CurrencyIsoCode%2CStage_Gates__r.CreatedDate%2CStage_Gates__r.Stage_Gate_Activities_Template__r.name+from%20task%20where+WhatId%20%3D%27${projectId}%27%20`;

  try {
    const response: AxiosResponse<SalesforceTaskDataResponse> = await axios.get(
      url,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    // Filter out records with null or undefined critical fields
    const filteredRecords = response.data.records.filter((record) => {
      return (
        record.Id && // Ensure ID exists
        record.Subject && // Ensure Subject is not null
        record.Status && // Ensure Subject is not null
        record.Start_Date__c && // Ensure Start_Date__c is not null
        record.ActivityDate && // Ensure ActivityDate is not null
        record.Owner?.Name && // Ensure Owner name exists
        record.Stage_Gates__r?.Name && // Ensure Stage_Gates__r name exists
        record.Stage_Gates__r?.Start_Date__c && // Ensure Stage_Gates__r name exists
        record.CompletedDateTime && // Ensure Stage_Gates__r name exists
        record.Stage_Gates__r.Stage_Gate_Activities_Template__r?.Name // Ensure Stage Gate Activities Template name exists
      );
    });

    console.log("Filtered tasks response", filteredRecords);

    return { ...response.data, records: filteredRecords };
  } catch (error) {
    console.error("Error fetching task data:", error);
    throw error;
  }
};
