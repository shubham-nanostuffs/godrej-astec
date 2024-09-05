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

export const HomeComponent: React.FC<HomeComponentProps> = ({
  projects,
  accessToken,
}) => {
  const [selectedProject, setSelectedProject] = useState<string>("1");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [view, _setView] = useState<ViewMode>(ViewMode.Day);
  const [isChecked, _setIsChecked] = useState(true);
  const [expandedStages, setExpandedStages] = useState<Record<string, boolean>>({});

  let columnWidth = 60;
  if (view === ViewMode.HalfDay) {
    columnWidth = 300;
  } else if (view === ViewMode.Week) {
    columnWidth = 250;
  }

  const loadTasks = async (projectId: string) => {
    if (!projectId) return;

    setLoading(true);
    setError(null);

    try {
      console.log(`Fetching tasks for project ${projectId}`);
      const taskData = await fetchSalesforceTaskData(accessToken, projectId);

      // Map Salesforce tasks to Gantt tasks
      const salesforceTasks = mapSalesforceTasksToGanttTasks(taskData.records);
      console.log("Formatted Tasks: ", salesforceTasks);

      setTasks(salesforceTasks);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
      setError("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks(selectedProject);
  }, [selectedProject, accessToken]);

  const handleProjectSelect = (key: string) => {
    setSelectedProject(key);
  };

  const handleTaskChange = (task: Task) => {
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
          width: "100%",
        }}
      />

      {error && <div className="text-red-500 mt-2">{error}</div>}

      {loading ? (
        <div>Loading tasks...</div>
      ) : (
        <div className="mt-3">
          {Object.keys(tasksByStage).map((stageId) => (
            <div key={stageId}>
              <h4 onClick={() => toggleStage(stageId)}>
                {`Stage ${stageId} - ${expandedStages[stageId] ? "Collapse" : "Expand"}`}
              </h4>

              {expandedStages[stageId] && (
                <Gantt
                  tasks={tasksByStage[stageId]}
                  viewMode={view}
                  onDateChange={handleTaskChange}
                  columnWidth={columnWidth}
                  listCellWidth={isChecked ? "155px" : ""}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
