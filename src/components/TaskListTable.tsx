import React, { useMemo } from "react";
import styles from "./task-list-table.module.css";
import { EnhancedTask } from "./EnhancedTask";

const localeDateStringCache = {};
const toLocaleDateStringFactory =
  (locale: string) =>
  (date: Date, dateTimeOptions: Intl.DateTimeFormatOptions) => {
    const key = date.toString();
    let lds = localeDateStringCache[key];
    if (!lds) {
      lds = date.toLocaleDateString(locale, dateTimeOptions);
      localeDateStringCache[key] = lds;
    }
    return lds;
  };
const dateTimeOptions: Intl.DateTimeFormatOptions = {
  weekday: "short",
  year: "numeric",
  month: "long",
  day: "numeric",
};

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
  locale,
  onExpanderClick,
}) => {
  const toLocaleDateString = useMemo(
    () => toLocaleDateStringFactory(locale),
    [locale]
  );

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
            style={{ height: rowHeight,  }}
            key={`${t.id}row`}

          >
            <div
              className={styles.taskListCell}
              style={{
                minWidth: 300,
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
