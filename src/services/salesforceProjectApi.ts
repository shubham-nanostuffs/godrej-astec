import axios, { AxiosResponse } from "axios";

export interface SalesforceProjectDataResponse {
  records: Array<{
    Id: string;
    Name: string;
  }>;
}

export const fetchSalesforceProjectData = async (
  accessToken: string
): Promise<SalesforceProjectDataResponse> => {
  const url = `https://${
    import.meta.env.VITE_SALESFORCE_DOMAIN
  }/services/data/v53.0/query/?q=select+id%2CName+from+New_Project_Process__c`;

  try {
    const response: AxiosResponse<SalesforceProjectDataResponse> =
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
};
