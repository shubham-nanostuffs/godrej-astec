import axios from "axios";

export const getStagePlannedDates = async (
  accessToken,
  projectId
) => {
  const url = `https://${import.meta.env.VITE_SALESFORCE_DOMAIN}/services/apexrest/ProjectTimeline/${projectId}`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching task data:", error);
    throw error;
  }
}
