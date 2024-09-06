import { useEffect, useState } from "react";
import styles from "./styles.module.css";
import { fetchSalesforceTaskData } from "../services/salesforceTaskApi";
import { Gantt, Task, ViewMode } from "gantt-task-react";
import { mapSalesforceTasksToGanttTasks } from "../utils/mapSalesForceTasks";
import "gantt-task-react/dist/index.css";
import { TaskListHeaderDefault } from "./TaskListHeader";
import { TaskListTableDefault } from "./TaskListTable";
import CustomTooltip from "./CustomToolTip";
import CommonDropdown from "./Dropdown";

interface MenuItem {
  label: string;
  key: string;
}

interface HomeComponentProps {
  projects: MenuItem[];
  accessToken: string;
}

export const HomeComponent: React.FC<HomeComponentProps> = ({
  projects,
  accessToken,
}) => {
  const [selectedProject, setSelectedProject] = useState<string>("1");
  const [tasks, setTasks] = useState<Task[]>([]); // Initially empty array for tasks
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>(ViewMode.HalfDay);
  const [isChecked, _setIsChecked] = useState(true);

  let columnWidth = 70;
  if (view === ViewMode.HalfDay) {
    columnWidth = 60;
  } else if (view === ViewMode.Week) {
    columnWidth = 100;
  }

  // Function to load tasks for the selected project
  const loadTasks = async (projectId: string) => {
    if (!projectId) return;

    setLoading(true); // Start loading
    setError(null); // Reset any previous errors

    try {
      console.log(`Fetching tasks for project ${projectId}`);
      console.log("Access Token", accessToken);

      // Fetch tasks for the selected project
      const taskData = await fetchSalesforceTaskData(accessToken, projectId);

      // Format the tasks for Gantt
      const salesforceTasks = mapSalesforceTasksToGanttTasks(taskData.records);
      console.log("Formatted Tasks: ", salesforceTasks);

      // Set the formatted tasks to the state
      setTasks(salesforceTasks);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
      setError("Failed to fetch tasks");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  // Effect to load tasks when the selected project changes
  useEffect(() => {
    loadTasks(selectedProject);
  }, [selectedProject, accessToken]);

  // Handle project selection from the dropdown
  const handleProjectSelect = (key: string) => {
    setSelectedProject(key);
  };

  const handleDblClick = (task: Task) => {
    alert("On Double Click event Id:" + task.id);
  };

  const handleExpanderClick = (task: Task) => {
    setTasks(tasks.map((t) => (t.id === task.id ? task : t)));
    console.log("On expander click Id:" + task.id);
  };

  // Group tasks by stage
  const tasksByStage = tasks.reduce((acc, task) => {
    if (!acc[task.stage]) acc[task.stage] = [];
    acc[task.stage].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  return (
    <div className="h-full overflow-hidden">
      <p className="font-bold">Select Project</p>
      {/* Project selection dropdown */}
      <CommonDropdown
        label={
          projects.find((project) => project.key === selectedProject)?.label ||
          "Select Project"
        }
        items={projects}
        buttonClass={styles.dropdown}
        onClick={({ key }) => handleProjectSelect(key as string)}
        buttonStyle={{
          fontWeight: 400,
          fontSize: "14px",
          textAlign: "start",
          width: "100%", // Full-width dropdown
        }}
      />

      {/* Display error message if any */}
      {error && <div className="text-red-500 mt-2">{error}</div>}

      {/* Show loading spinner when tasks are being fetched */}
      {loading ? (
        <div>Loading tasks...</div>
      ) : (
        <div className="mt-3 border-2">
          {/* Render the stages with tasks */}
          {Object.keys(tasksByStage).map((stageId) => (
            <div key={stageId} className="w-full overflow-hidden ">
              {/* Render the Gantt chart for tasks under the stage */}
              <Gantt
                tasks={tasksByStage[stageId]}
                viewMode={view}
                TooltipContent={CustomTooltip} // Use the custom tooltip component
                onDoubleClick={handleDblClick}
                TaskListHeader={(props) => <TaskListHeaderDefault {...props} />}
                TaskListTable={(props) => <TaskListTableDefault {...props} />}
                onExpanderClick={handleExpanderClick}
                listCellWidth={isChecked ? "155px" : ""}
                columnWidth={columnWidth}
                ganttHeight={540}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
