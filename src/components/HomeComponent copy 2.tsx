import { useEffect, useState } from "react";
import CommonDropdown from "./Dropdown";
import styles from "./styles.module.css";
import { fetchSalesforceTaskData } from "../services/salesforceTaskApi";
import { Gantt, Task, ViewMode } from "gantt-task-react";
import { mapSalesforceTasksToGanttTasks } from "../utils/mapSalesForceTasks";
import { getStartEndDateForProject } from "./helpers";
import "gantt-task-react/dist/index.css";
interface MenuItem {
  label: string;
  key: string;
}

interface HomeComponentProps {
  projects: MenuItem[];
  accessToken: string;
}

const stageMapping: Record<string, string> = {
  "A0-G1": "1",
  "A1-G2": "2",
  "A2-G3": "3",
  "A3-G4": "4",
  "A4-G5": "5",
  "A5-A6": "6",
};

export const HomeComponent: React.FC<HomeComponentProps> = ({
  projects,
  accessToken,
}) => {
  const [selectedProject, setSelectedProject] = useState<string>("1");
  const [tasks, setTasks] = useState<Task[]>([]); // Initially empty array for tasks
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [view, _setView] = useState<ViewMode>(ViewMode.Day);
  const [isChecked, _setIsChecked] = useState(true);
  const [expandedStages, setExpandedStages] = useState<Record<string, boolean>>(
    {}
  );

  let columnWidth = 60;
  if (view === ViewMode.HalfDay) {
    columnWidth = 300;
  } else if (view === ViewMode.Week) {
    columnWidth = 250;
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
    console.log("Here is data changes", selectedProject);

    loadTasks(selectedProject);
  }, [selectedProject, accessToken]);

  // Handle project selection from the dropdown
  const handleProjectSelect = (key: string) => {
    setSelectedProject(key);
  };

  const handleTaskChange = (task: Task) => {
    console.log("On date change Id:" + task.id);
    let newTasks = tasks.map((t) => (t.id === task.id ? task : t));
    if (task.project) {
      const [start, end] = getStartEndDateForProject(newTasks, task.project);
      const project =
        newTasks[newTasks.findIndex((t) => t.id === task.project)];
      if (
        project.start.getTime() !== start.getTime() ||
        project.end.getTime() !== end.getTime()
      ) {
        const changedProject = { ...project, start, end };
        newTasks = newTasks.map((t) =>
          t.id === task.project ? changedProject : t
        );
      }
    }
    setTasks(newTasks);
  };

  const handleTaskDelete = (task: Task) => {
    const conf = window.confirm("Are you sure about " + task.name + " ?");
    if (conf) {
      setTasks(tasks.filter((t) => t.id !== task.id));
    }
    return conf;
  };

  const handleProgressChange = (task: Task) => {
    setTasks(tasks.map((t) => (t.id === task.id ? task : t)));
    console.log("On progress change Id:" + task.id);
  };

  const handleDblClick = (task: Task) => {
    alert("On Double Click event Id:" + task.id);
  };

  const handleSelect = (task: Task, isSelected: boolean) => {
    console.log(task.name + " has " + (isSelected ? "selected" : "unselected"));
  };

  const handleExpanderClick = (task: Task) => {
    setTasks(tasks.map((t) => (t.id === task.id ? task : t)));
    console.log("On expander click Id:" + task.id);
  };

  // Toggle the visibility of tasks within a stage
  const toggleStage = (stageId: string) => {
    setExpandedStages((prev) => ({ ...prev, [stageId]: !prev[stageId] }));
  };

  // Group tasks by stage
  const tasksByStage = tasks.reduce((acc, task) => {
    if (!acc[task.stage]) acc[task.stage] = [];
    acc[task.stage].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  return (
    <div>
      <p>Interactive Gantt Chart</p>
      <p className="font-bold">Select Project</p>

      {/* Project selection dropdown */}
      <CommonDropdown
        label={
          projects.find((project) => project.key === selectedProject)?.label ||
          "Select Project"
        }
        items={projects}
        buttonClass={styles.dropdown}
        onClick={({ key }) =>
          handleProjectSelect(key as string) || toggleStage()
        }
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
        <div className="mt-3">
          {/* Render the stages with expand/collapse functionality */}
          {Object.keys(tasksByStage).map((stageId) => (
            <div key={stageId}>
              {/* Stage Header for Expand/Collapse */}
              <h4 onClick={() => toggleStage(stageId)}>
                {`Stage ${stageId} - ${
                  expandedStages[stageId] ? "Collapse" : "Expand"
                }`}
              </h4>

              {/* Conditionally render the Gantt chart for tasks under the stage */}
              {expandedStages[stageId] && (
                <Gantt
                  tasks={tasksByStage[stageId]}
                  viewMode={view}
                  onDateChange={handleTaskChange}
                  onDelete={handleTaskDelete}
                  onProgressChange={handleProgressChange}
                  onDoubleClick={handleDblClick}
                  onSelect={handleSelect}
                  onExpanderClick={handleExpanderClick}
                  listCellWidth={isChecked ? "155px" : ""}
                  columnWidth={columnWidth}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
