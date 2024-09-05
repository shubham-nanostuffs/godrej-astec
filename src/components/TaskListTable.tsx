// src/components/TaskListTable.tsx
import React from "react";
import styles from "./task-list-table.module.css";
import { EnhancedTask } from "./EnhancedTask";

interface TaskListTableProps {
  rowHeight: number;
  rowWidth: string;
  fontFamily: string;
  fontSize: string;
  tasks: EnhancedTask[];
  selectedTaskId: string;
  setSelectedTask: (taskId: string) => void;
  onExpanderClick: (task: EnhancedTask) => void;
}

export const TaskListTableDefault: React.FC<TaskListTableProps> = ({
  rowHeight,
  rowWidth,
  tasks,
  fontFamily,
  fontSize,
  onExpanderClick,
}) => {
  return (
    <div
      className={styles.taskListWrapper}
      style={{
        fontFamily: fontFamily,
        fontSize: fontSize,
      }}
    >
      {tasks.map((t) => {
        let expanderSymbol = "";
        if (t.hasChildren) {
          expanderSymbol = t.subTasksHidden ? "▶" : "▼";
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
                minWidth: rowWidth,
                maxWidth: rowWidth,
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
