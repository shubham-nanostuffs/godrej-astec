import React from "react";
import styles from "./task-list-table.module.css";
import { EnhancedTask } from "./EnhancedTask";

// const localeDateStringCache: Record<string, string> = {};

// const toLocaleDateStringFactory =
//   (locale: string) =>
//   (date: Date, dateTimeOptions: Intl.DateTimeFormatOptions): string => {
//     const key = date.toString();
//     let lds = localeDateStringCache[key];
//     if (!lds) {
//       lds = date.toLocaleDateString(locale, dateTimeOptions);
//       localeDateStringCache[key] = lds;
//     }
//     return lds;
//   };

// const dateTimeOptions: Intl.DateTimeFormatOptions = {
//   weekday: "short",
//   year: "numeric",
//   month: "long",
//   day: "numeric",
// };

interface TaskListTableProps {
  rowHeight: number;
  rowWidth: string;
  fontFamily: string;
  fontSize: string;
  locale: string;
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
//   locale,
  onExpanderClick,
}) => {
//   const toLocaleDateString = useMemo(
//     () => toLocaleDateStringFactory(locale),
//     [locale]
//   );

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
            {/* Uncomment these lines if you need to display start and end dates */}
            {/* <div
              className={styles.taskListCell}
              style={{
                minWidth: rowWidth,
                maxWidth: rowWidth,
              }}
            >
              &nbsp;{toLocaleDateString(t.start, dateTimeOptions)}
            </div>
            <div
              className={styles.taskListCell}
              style={{
                minWidth: rowWidth,
                maxWidth: rowWidth,
              }}
            >
              &nbsp;{toLocaleDateString(t.end, dateTimeOptions)}
            </div> */}
          </div>
        );
      })}
    </div>
  );
};
