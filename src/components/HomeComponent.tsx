import { useEffect, useState } from "react";
import { fetchSalesforceTaskData } from "../services/salesforceTaskApi";
import { Gantt, Task, ViewMode } from "gantt-task-react";
import { mapSalesforceTasksToGanttTasks } from "../utils/mapSalesForceTasks";
import "gantt-task-react/dist/index.css";
import { TaskListHeaderDefault } from "./TaskListHeader";
import { TaskListTableDefault } from "./TaskListTable";
import CustomTooltip from "./CustomToolTip";
import CommonDropdown from "./Dropdown";
import { Task as GanttTask } from "gantt-task-react";

interface CustomTask extends GanttTask {
  stage?: string; // Add stage property to the task
}
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
  const [view, _setView] = useState<ViewMode>(ViewMode.HalfDay);
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
      // Fetch tasks for the selected project
      const taskData = await fetchSalesforceTaskData(accessToken, projectId);

      // Format the tasks for Gantt
      const salesforceTasks = mapSalesforceTasksToGanttTasks(taskData.records);

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
  };

  // Group tasks by stage
  const tasksByStage = tasks.reduce((acc, task) => {
    const stage = task.stage || "Unknown Stage";
    if (!acc[stage]) acc[stage] = [];
    acc[stage].push(task);
    return acc;
  }, {} as Record<string, CustomTask[]>);

  return (
    <div className="h-full">
      <div className="mb-4">
        <p className="text-xs font-bold m-2">Select Project</p>
        {/* Project selection dropdown */}
        <CommonDropdown
          label={
            projects.find((project) => project.key === selectedProject)
              ?.label || "Select Project"
          }
          items={projects}
          buttonClass="w-full border border-gray-300 rounded-md p-2 text-sm bg-white text-gray-700"
          onClick={({ key }) => handleProjectSelect(key as string)}
          buttonStyle={{
            fontWeight: 400,
            fontSize: "14px",
            textAlign: "start",
          }}
        />
      </div>

      {/* Display error message if any */}
      {error && <div className="text-red-500 mt-2">{error}</div>}

      {/* Show loading spinner when tasks are being fetched */}
      {loading ? (
        <div className="text-center">Loading tasks...</div>
      ) : (
        <div className="border-2 rounded-md ">
          {/* Render the stages with tasks */}
          {Object.keys(tasksByStage).map((stageId) => (
            <div key={stageId} className="mb-6">
              {/* <h2 className="text-xl font-semibold mb-2">{stageId}</h2> */}
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
                ganttHeight={500}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
