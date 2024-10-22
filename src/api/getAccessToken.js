import axios from 'axios';

export const getSalesforceToken = async () => {
  try {
    const response = await axios.post(
      `https://${import.meta.env.VITE_SALESFORCE_DOMAIN}/services/oauth2/token`,
      new URLSearchParams({
        grant_type: 'password',
        client_id: import.meta.env.VITE_SALESFORCE_CLIENT_ID,
        client_secret: import.meta.env.VITE_SALESFORCE_CLIENT_SECRET,
        username: import.meta.env.VITE_SALESFORCE_USERNAME,
        password: import.meta.env.VITE_SALESFORCE_PASSWORD,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        withCredentials: true,
      }
    );

    const { access_token } = response.data;
    localStorage.setItem('salesforce_access_token', access_token);
    // console.log('Access Token stored in localStorage:', access_token);
    return response.data;
  } catch (error) {
    console.error('Error fetching Salesforce token:', error);
    throw error;
  }
};

export default getSalesforceToken;
