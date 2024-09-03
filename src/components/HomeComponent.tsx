import { useState } from "react";
import CommonDropdown from "./Dropdown";
import styles from "./styles.module.css";
import GanttChart from "./GanttChart";
import { initTasks } from "./Tasks";
import { Task } from "gantt-task-react";

interface MenuItem {
  label: string;
  key: string;
}

export const HomeComponent = () => {
  const [selectedProject, setSelectedProject] = useState<string>("1");
  const [selectedProjectLabel, setSelectedProjectLabel] =
    useState<string>("Select Project");
  const [tasks, setTasks] = useState<Task[]>(initTasks[selectedProject]);

  const items: MenuItem[] = [
    { label: "Project 1", key: "1" },
    { label: "Project 2", key: "2" },
  ];

  const handleProjectSelect = (key: string) => {
    setSelectedProject(key);
    const selectedItem = items.find((item) => item.key === key);
    if (selectedItem) {
      setSelectedProjectLabel(selectedItem.label);
    }
    setTasks(initTasks[key]);
  };

  return (
    <>
      <div>
        <p>Interactive Gantt Chart</p>
        <p className="font-bold">Select Project</p>
        <CommonDropdown
          label={selectedProjectLabel}
          items={items}
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
