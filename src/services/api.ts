import axios, { AxiosResponse } from "axios";

export interface AuthTokenResponse {
  access_token: string;
  instance_url: string;
  id: string;
  token_type: string;
  issued_at: string;
  signature: string;
}

export const fetchAuthToken = async (): Promise<AuthTokenResponse> => {
  const url = `https://${
    import.meta.env.VITE_SALESFORCE_DOMAIN
  }/services/oauth2/token`;

  const params = new URLSearchParams();
  params.append("grant_type", "password");
  params.append(
    "client_id",
    import.meta.env.VITE_SALESFORCE_CLIENT_ID as string
  );
  params.append(
    "client_secret",
    import.meta.env.VITE_SALESFORCE_CLIENT_SECRET as string
  );
  params.append("username", import.meta.env.VITE_SALESFORCE_USERNAME as string);
  params.append("password", import.meta.env.VITE_SALESFORCE_PASSWORD as string);

  try {
    const response: AxiosResponse<AuthTokenResponse> = await axios.post(
      url,
      params
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching the auth token:", error);
    throw error;
  }
};
