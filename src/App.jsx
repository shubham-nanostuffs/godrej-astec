import { useEffect, useState } from 'react';
import './App.css';
import Select from 'react-select'; // Import react-select
import { getSalesforceToken } from './api/getAccessToken';
import fetchAllStageGateTasks from './api/fetchAllStageGateTasks';
import { fetchSalesforceProjectData } from './api/fetchSalesforceProjectData';
import { Gantt, ViewMode } from "gantt-task-react";
import { getPlannedDates } from './api/getPlannedDates';
import getActualTasks from './api/getActualTasks';
import { createGanttTasks } from './utils/createGanttTasks';

function App() {
  const [projectsOptions, setProjectsOptions] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [view, setView] = useState(ViewMode.Month);
  const [tasks, setTasks] = useState([]);

  const fetchTokenAndTasks = async () => {
    try {
      const tokenData = await getSalesforceToken();
      console.log('Salesforce Token Data:', tokenData);

      // Extract access token and call the Project Data and Stage Gate Tasks API
      const { access_token } = tokenData;
      
      const projectsData = await fetchSalesforceProjectData(access_token);
      console.log("Projects Data --> ", projectsData);
      
      // Map the projectsData to react-select options format
      const formattedProjectsOptions = projectsData.records.map(project => ({
        value: project.Id,
        label: project.Name,
      }));
      
      setProjectsOptions(formattedProjectsOptions); // Update state with project options

      const tasksData = await fetchAllStageGateTasks(access_token);
      console.log('Stage Gate Tasks Data:', tasksData);
      const tasks = createGanttTasks(tasksData.records);
      setTasks(...tasks)

      
    } catch (error) {
      console.error('Failed to fetch token or tasks:', error);
    }
  };

  useEffect(() => {
    fetchTokenAndTasks(); // Fetch token and projects/tasks data
  }, []);

  const handleProjectSelect = async (selectedOption) => {
    setSelectedProject(selectedOption); // Update selected project
    console.log('Selected Project:', selectedOption);

    try {
      // get planned dates
      const token = localStorage.getItem('salesforce_access_token');
      const plannedDates = await getPlannedDates(token, selectedOption.value);
      console.log('Planned Dates:', plannedDates);
      const actualTasks = await getActualTasks(token, selectedOption.value);
      console.log("Actual Tasks --> ", actualTasks);
    }
    catch(error) {
      console.error('Failed to fetch tasks for project ID:', error);
    }
  };

  return (
    <>
    <div className='selectProjectWrapper'>
      <h3>Select a Project...</h3>
      <Select
        options={projectsOptions}
        value={selectedProject}
        onChange={handleProjectSelect} 
        placeholder="Select a Project"
      />
      </div>
      <div className="ganttWrapper">
      <h3>Project Timeline - Gantt Chart</h3>
    </div>
    <Gantt tasks={tasks} />
    </>
  );
}

export default App;
