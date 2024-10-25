import { useEffect, useState } from "react";
import Select from "react-select";
import { getSalesforceToken } from "./api/getAccessToken";
import fetchAllStageGateTasks from "./api/fetchAllStageGateTasks";
import { fetchSalesforceProjectData } from "./api/fetchSalesforceProjectData";
import { Gantt, ViewMode } from "gantt-task-react";
import { getPlannedDates } from "./api/getPlannedDates";
import getActualTasks from "./api/getActualTasks";
import getCommercialTimelines from "./api/getCommercialTimelines";
import { TaskListTableDefault } from "./utils/TaskListTable";
import { TaskListHeaderDefault } from "./utils/TaskListHeader";
import { createGanttTasks } from "./utils/createGanttTasks";
import { ViewSwitcher } from "./utils/ViewSwitcher";
import CustomTooltip from "./utils/CustomToolTip";
import "./App.css";
import "gantt-task-react/dist/index.css";

function App() {
  const [projectsOptions, setProjectsOptions] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [view, setView] = useState(ViewMode.Week);
  const [tasks, setTasks] = useState([]);
  const [tasksData, setTasksData] = useState([]);
  const [milestoneDate, setMilestoneDate] = useState(null); // Single milestone date

  const fetchTokenAndTasks = async () => {
    try {
      const tokenData = await getSalesforceToken();
      const { access_token } = tokenData;
      const projectsData = await fetchSalesforceProjectData(access_token);

      const formattedProjectsOptions = projectsData.records.map((project) => ({
        value: project.Id,
        label: project.Name,
      }));

      setProjectsOptions(formattedProjectsOptions);
      const tasksData = await fetchAllStageGateTasks(access_token);
      setTasksData(tasksData.records);
    } catch (error) {
      console.error("Failed to fetch token or tasks:", error);
    }
  };

  useEffect(() => {
    fetchTokenAndTasks();
  }, []);

  const handleProjectSelect = async (selectedOption) => {
    setSelectedProject(selectedOption);
    try {
      const token = localStorage.getItem("salesforce_access_token");
      const plannedDates = await getPlannedDates(token, selectedOption.value);
      const commercialTimelines = await getCommercialTimelines(
        token,
        selectedOption.value
      );
      const actualTasks = await getActualTasks(token, selectedOption.value);

      // Set the milestone date from the API (e.g., "A0_Indicative_Commercial_Timelines__c" date)
      if (
        commercialTimelines &&
        commercialTimelines.records[0]?.A0_Indicative_Commercial_Timelines__c
      ) {
        setMilestoneDate(
          commercialTimelines.records[0].A0_Indicative_Commercial_Timelines__c
        );
      }

      const updatedTasks = createGanttTasks(
        tasksData,
        plannedDates,
        actualTasks,
        commercialTimelines
      );
      setTasks(updatedTasks);
    } catch (error) {
      console.error("Failed to fetch planned dates:", error);
    }
  };

  const getXPositionFromDate = (dateString) => {
    const chartStartDate = new Date(tasks[0].start); // Starting date of the Gantt chart
    chartStartDate.setDate(chartStartDate.getDate() - 1); // Add 24 hours to the start date

    const date = new Date(dateString);
    const daysDifference = Math.floor(
      (date - chartStartDate) / (1000 * 60 * 60 * 24)
    );
    const xPosition = daysDifference * 60.3; // Assuming each day is 60 pixels wide
    return xPosition;
  };

  useEffect(() => {
    const todayElement = document.querySelector(
      "#root > div > div.border-2.rounded-md.w-full.mt-4 > div > div > div._3eULf > div._CZjuD > div > svg > g.grid > g"
    );

    if (todayElement && milestoneDate) {
      todayElement
        .querySelectorAll("rect.timeline-marker")
        .forEach((rect) => rect.remove());

      const xPosition = getXPositionFromDate(milestoneDate);
      const rect = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect"
      );
      rect.setAttribute("x", xPosition);
      rect.setAttribute("y", "0");
      rect.setAttribute("width", "10");
      rect.setAttribute("height", "4550");
      rect.setAttribute("fill", "blue");
      rect.classList.add("timeline-marker");

      todayElement.appendChild(rect);
    }
  }, [tasks, view, milestoneDate]);

  const tasksByStage = tasks.reduce((acc, task) => {
    const stage = task.stage || "Unknown Stage";
    if (!acc[stage]) acc[stage] = [];
    acc[stage].push(task);
    return acc;
  }, {});

  const handleExpanderClick = (task) => {
    setTasks(tasks.map((t) => (t.id === task.id ? task : t)));
  };
  return (
    <div className="[&]:p-0">
      <h3 className="font-bold text-[25px]">Project Timeline - Gantt Chart</h3>
      <div className="flex flex-row items-center gap-4 selectProjectWrapper mt-4">
        <h3 className="font-bold text-lg">Select a Project...</h3>
        <Select
          options={projectsOptions}
          value={selectedProject}
          onChange={handleProjectSelect}
          placeholder="Select a Project"
          className="w-60"
        />
      </div>

      <div className="mt-4 flex justify-between">
        <div className="flex gap-4">
          <div className="flex items-center gap-1">
            <p className="w-5 h-5 bg-gray-400"></p>
            <p className="font-bold">Planned</p>
          </div>
          <div className="flex items-center gap-1">
            <p className="w-5 h-5 bg-orange-500"></p>
            <p className="font-bold">In Progress</p>
          </div>{" "}
          <div className="flex items-center gap-1">
            <p className="w-5 h-5 bg-red-400"></p>
            <p className="font-bold">In Progress Overdue</p>
          </div>
          <div className="flex items-center gap-1">
            <p className="w-5 h-5 bg-green-800"></p>
            <p className="font-bold">Completed</p>
          </div>
          <div className="flex items-center gap-1">
            <p className="w-5 h-5 bg-red-600"></p>
            <p className="font-bold">Completed Overdue</p>
          </div>
        </div>
        <div className="">
          <ViewSwitcher onViewModeChange={(viewMode) => setView(viewMode)} />
        </div>
      </div>
      <div className="border-2 rounded-md w-full mt-4">
        {/* Render the stages with tasks */}
        {Object.keys(tasksByStage).map((stageId) => (
          <div key={stageId} className="mb-6">
            <Gantt
              tasks={tasksByStage[stageId]}
              viewMode={view}
              projectProgressColor="#bd8c06"
              projectBackgroundColor="#bd8c06"
              projectBackgroundSelectedColor="#bd8c06"
              projectProgressSelectedColor="#bd8c06"
              TooltipContent={CustomTooltip} // Use the custom tooltip component
              //  onDoubleClick={handleDblClick}
              TaskListHeader={(props) => <TaskListHeaderDefault {...props} />}
              TaskListTable={(props) => <TaskListTableDefault {...props} />}
              onExpanderClick={handleExpanderClick}
              //  listCellWidth={isChecked ? "155px" : ""}
              //  columnWidth={columnWidth}
              ganttHeight={400}
              timeStep={0}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;