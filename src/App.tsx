// src/App.tsx
import React, { useEffect, useState } from "react";
import { fetchAuthToken } from "./services/api";
import { HomeComponent } from "./components/HomeComponent";
import { fetchSalesforceProjectData } from "./services/salesforceProjectApi";
interface MenuItem {
  label: string;
  key: string;
}

const App: React.FC = () => {
  const [projects, setProjects] = useState<MenuItem[]>([]);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getTokenAndData = async () => {
      try {
        // Fetch the access token
        const tokenResponse = await fetchAuthToken();
        const token = tokenResponse.access_token;
        setAccessToken(token);

        // Fetch the Salesforce project data
        if (token) {
          const fetchedData = await fetchSalesforceProjectData(token);
          const formattedProjects = fetchedData.records.map((record: any) => ({
            label: record.Name,
            key: record.Id,
          }));
          setProjects(formattedProjects);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    getTokenAndData();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="App w-full px-2">
      {projects.length > 0 && accessToken ? (
        <HomeComponent projects={projects} accessToken={accessToken} />
      ) : (
        <p>No data available...</p>
      )}
    </div>
  );
};

export default App;
