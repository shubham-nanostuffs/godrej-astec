import { MenuProps } from "antd";
import CommonDropdown from "./Dropdown";
import styles from "./styles.module.css";
import GanttChart from "./GanttChart";
import { initTasks } from "./Tasks";

const items: MenuProps["items"] = [
  {
    label: "Project 1",
    key: "1",
  },
  {
    label: "Project 2",
    key: "2",
  },
  {
    label: "Project 3",
    key: "3",
  },
];

export const HomeComponent = () => {
  return (
    <>
      <div>
        <p>Interactive Gantt Chart</p>
        <p className="font-bold">Select Project</p>
        <CommonDropdown
          label="Project"
          items={items}
          buttonClass={styles.dropdown}
          onClick={() => {}}
          buttonStyle={{
            fontWeight: 400,
            fontSize: "14px",
            textAlign: "start",
            width: "100%", // Ensure dropdown button takes full width
          }}
        />
        <GanttChart initTasks={initTasks} />
      </div>
    </>
  );
};
