import React from "react";
import styles from "./task-list-table.module.css";
import { EnhancedTask } from "./EnhancedTask";



export const TaskListTableDefault: React.FC<{
  rowHeight: number;
  rowWidth: string;
  fontFamily: string;
  fontSize: string;
  locale: string;
  tasks: EnhancedTask[];
  selectedTaskId: string;
  setSelectedTask: (taskId: string) => void;
  onExpanderClick: (task: EnhancedTask) => void;
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
      }}
    >
      {tasks.map((t) => {
        let expanderSymbol = "▶";

        if (t.project) {
          expanderSymbol = t.subTasksHidden ? "▶" : "";
        }

        const indentationDepth = t.depth * 10;
        const indentationStyle = {
          marginLeft: `${indentationDepth}px`,
        };

        return (
          <div
            className={styles.taskListTableRow}
            style={{ height: rowHeight }}
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
                <div>{t.name}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
