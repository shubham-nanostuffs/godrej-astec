import { useEffect, useState } from "react";
import CommonDropdown from "./Dropdown";
import styles from "./styles.module.css";
import GanttChart from "./GanttChart";
import { initTasks } from "./Tasks";
import { Task } from "gantt-task-react";
import { fetchSalesforceTaskData } from "../services/salesforceTaskApi";
import { formatTasksForGantt } from "../utils/formatTasks";
import { EnhancedTask } from "./EnhancedTask";

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
  const [tasks, setTasks] = useState<Task[]>(initTasks[selectedProject]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const items: MenuItem[] = [
    { label: "Project 1", key: "1" },
    { label: "Project 2", key: "2" },
  ];

  useEffect(() => {
    const loadTasks = async () => {
      if (!selectedProject) return;

      setLoading(true);
      try {
        console.log(selectedProject);
        console.log("Access Token", accessToken);

        const taskData = await fetchSalesforceTaskData(
          accessToken,
          selectedProject
        );
        const formattedTasks = formatTasksForGantt(taskData.records);
        console.log("Formatted Task : ", projects);

        setTasks(formattedTasks as EnhancedTask[]); // Ensure correct type
      } catch (err) {
        console.error("Failed to fetch tasks:", err);
        setError("Failed to fetch tasks");
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, [selectedProject, accessToken]);

  // const handleProjectSelect = (key: string) => {
  //   setSelectedProject(key);
  //   const selectedItem = items.find((item) => item.key === key);
  //   if (selectedItem) {
  //     setSelectedProjectLabel(selectedItem.label);
  //   }
  //   setTasks(initTasks[key]);
  // };

  const handleProjectSelect = (key: string) => {
    setSelectedProject(key);
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
        <div className="mt-3">
          <GanttChart initTasks={tasks} />
        </div>
      </div>
    </>
  );
};
