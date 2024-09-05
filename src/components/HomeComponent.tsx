import { useEffect, useState } from "react";
import CommonDropdown from "./Dropdown";
import styles from "./styles.module.css";
import GanttChart from "./GanttChart";
import { fetchSalesforceTaskData } from "../services/salesforceTaskApi";
import { formatTasksForGantt } from "../utils/formatTasks";
import { Task } from "gantt-task-react";

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
  const [selectedProjectLabel, setSelectedProjectLabel] =
    useState<string>("Select Project");

  // Corrected: Initialize tasks as an empty object of type Record<string, Task[]>
  const [tasks, setTasks] = useState<Record<string, Task[]>>({});

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTasks = async () => {
      if (!selectedProject) return;

      setLoading(true);
      try {
        console.log("Selected Project:", selectedProject);
        console.log("Access Token:", accessToken);

        const taskData = await fetchSalesforceTaskData(
          accessToken,
          selectedProject
        );

        console.log("Task Data:", taskData.records);
        if (taskData.records) {
          console.log("Undefined task data");
        }

        const formattedTasks = formatTasksForGantt(taskData.records);
        console.log("Formatted Tasks:", formattedTasks);

        setTasks(formattedTasks); // Correct: Set the formatted tasks directly
      } catch (err) {
        console.error("Failed to fetch tasks:", err);
        setError("Failed to fetch tasks");
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, [selectedProject, accessToken]);

  const handleProjectSelect = (key: string) => {
    setSelectedProject(key);
    const selectedItem = projects.find((item) => item.key === key);
    if (selectedItem) {
      setSelectedProjectLabel(selectedItem.label);
    }
  };

  return (
    <>
      <div>
        <p>Interactive Gantt Chart</p>
        <p className="font-bold">Select Project</p>
        <CommonDropdown
          label={selectedProjectLabel}
          items={projects}
          buttonClass={styles.dropdown}
          onClick={({ key }) => handleProjectSelect(key as string)}
          buttonStyle={{
            fontWeight: 400,
            fontSize: "14px",
            textAlign: "start",
            width: "100%", // Ensure dropdown button takes full width
          }}
        />
        {/* <div className="mt-3">
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p>{error}</p>
          ) : (
            // Corrected: Use the selected project to display the tasks
            <GanttChart initTasks={tasks[selectedProject] || []} />
          )}
        </div> */}
      </div>
    </>
  );
};
