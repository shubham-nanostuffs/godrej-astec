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
import { TaskListTableDefault } from './utils/TaskListTable';
import { TaskListHeaderDefault } from './utils/TaskListHeader';
import "gantt-task-react/dist/index.css";

function App() {
  const [projectsOptions, setProjectsOptions] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [view, setView] = useState(ViewMode.Week);
  const [tasks, setTasks] = useState([]);
  const [tasksData, setTasksData] = useState([]); // Store tasksData in state

  // Fetch token, projects, and tasks data once
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

      // Fetch the stage gate tasks once and store in state
      const tasksData = await fetchAllStageGateTasks(access_token);
      console.log('Stage Gate Tasks Data:', tasksData);
      setTasksData(tasksData.records); // Store fetched tasksData in state
    } catch (error) {
      console.error('Failed to fetch token or tasks:', error);
    }
  };

  useEffect(() => {
    fetchTokenAndTasks(); // Fetch token, projects, and tasks data once
  }, []);

  // Handle project selection and fetch planned dates
  const handleProjectSelect = async (selectedOption) => {
    setSelectedProject(selectedOption); // Update selected project
    console.log('Selected Project:', selectedOption);
  
    try {
      // Fetch the Salesforce access token
      const token = localStorage.getItem('salesforce_access_token');
  
      // Fetch planned dates for the selected project
      const plannedDates = await getPlannedDates(token, selectedOption.value);
      console.log('Planned Dates:', plannedDates);
  
      // Pass the previously fetched tasksData and plannedDates to createGanttTasks
      const updatedTasks = createGanttTasks(tasksData, plannedDates); // Use stored tasksData
      setTasks(updatedTasks); // Update the state with Gantt tasks

      const actualTasks = await getActualTasks(token, selectedOption.value);
      console.log("Actual Tasks --> ", actualTasks);
    }
    
    catch (error) {
      console.error('Failed to fetch planned dates:', error);
    }
  };

  // Group tasks by stage
  const tasksByStage = tasks.reduce((acc, task) => {
    const customTask = task; // Cast task to CustomTask
    const stage = customTask.stage || "Unknown Stage";
    if (!acc[stage]) acc[stage] = [];
    acc[stage].push(customTask);
    return acc;
  }, {} );


  const handleExpanderClick = (task) => {
    setTasks(tasks.map((t) => (t.id === task.id ? task : t)));
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
    <div className="border-2 rounded-md ">
          {/* Render the stages with tasks */}
          {Object.keys(tasksByStage).map((stageId) => (
            <div key={stageId} className="mb-6">
              <Gantt
                 tasks={tasksByStage[stageId]}
                 viewMode={view}
                //  TooltipContent={CustomTooltip} // Use the custom tooltip component
                //  onDoubleClick={handleDblClick}
                 TaskListHeader={(props) => <TaskListHeaderDefault {...props} />}
                 TaskListTable={(props) => <TaskListTableDefault {...props} />}
                 onExpanderClick={handleExpanderClick}
                //  listCellWidth={isChecked ? "155px" : ""}
                //  columnWidth={columnWidth}
                 ganttHeight={500}
              />
            </div>
          ))}
        </div>
    </>
  );
}

export default App;
