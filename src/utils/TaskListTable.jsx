import PropTypes from "prop-types";
import styles from "./task-list-table.module.css";

export const TaskListTableDefault = ({
  rowHeight,
  rowWidth,
  tasks,
  fontFamily,
  fontSize,
  onExpanderClick,
}) => {

  console.log("Expander Table");
  
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

        const indentationDepth = t.depth ? t.depth * 10 : 0;
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

// PropTypes validation
TaskListTableDefault.propTypes = {
  rowHeight: PropTypes.number.isRequired,
  rowWidth: PropTypes.string.isRequired,
  tasks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      project: PropTypes.bool,
      subTasksHidden: PropTypes.bool,
      depth: PropTypes.number,
    })
  ).isRequired,
  fontFamily: PropTypes.string.isRequired,
  fontSize: PropTypes.string.isRequired,
  onExpanderClick: PropTypes.func.isRequired,
};

export default TaskListTableDefault;
