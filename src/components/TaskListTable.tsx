import React from "react";
import styles from "./task-list-table.module.css";
import { Task } from "gantt-task-react";
import { EnhancedTask } from "./EnhancedTask";

export const TaskListTableDefault: React.FC<{
  rowHeight: number;
  rowWidth: string;
  fontFamily: string;
  fontSize: string;
  locale: string;
  tasks: Task[];
  selectedTaskId: string;
  setSelectedTask: (taskId: string) => void;
  onExpanderClick: (task: Task) => void;
}> = ({
  rowHeight,
  rowWidth,
  tasks,
  fontFamily,
  fontSize,
  onExpanderClick,
}) => {
  // Using the toLocaleDateString function to prevent unused variable error

  return (
    <div
      className={styles.taskListWrapper}
      style={{
        fontFamily: fontFamily,
        fontSize: fontSize,
        border: "2px",
        textWrap: "wrap",
      }}
    >
      {tasks.map((t) => {
        let expanderSymbol = "▶";

        if (t.project) {
          expanderSymbol = (t as EnhancedTask).subTasksHidden ? "▶" : "";
        }

        const indentationDepth = (t as EnhancedTask).depth
          ? (t as EnhancedTask).depth * 10
          : 0;
        const indentationStyle = {
          marginLeft: `${indentationDepth}px`,
        };

        return (
          <div
            className={styles.taskListTableRow}
            style={{ height: rowHeight, textWrap: "wrap" }}
            key={`${t.id}row`}
          >
            <div
              className={styles.taskListCell}
              style={{
                minWidth: 300,
                maxWidth: rowWidth,
                fontSize: "13px",
              }}
              title={t.name}
            >
              <div
                className={styles.taskListNameWrapper}
                style={indentationStyle}
              >
                <div
                  className={
                    expanderSymbol
                      ? styles.taskListExpander
                      : styles.taskListEmptyExpander
                  }
                  onClick={() => onExpanderClick(t)}
                >
                  {expanderSymbol}
                </div>
                <div className="text-wrap">{t.name}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
