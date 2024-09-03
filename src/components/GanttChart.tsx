import React, { useState, useMemo } from "react";
import { Gantt, Task, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import { TaskListHeaderDefault } from "./TaskListHeader";
import { TaskListTableDefault } from "./TaskListTable";
import { EnhancedTask } from "./EnhancedTask";
import { useNestedTasks } from "./useNestedTasks";

const GanttChart: React.FC<{ initTasks: Task[] }> = (props) => {
  const { enhancedTasks, toggleExpandTask } = useNestedTasks(props.initTasks);

  const [tasks, setTasks] = useState<EnhancedTask[]>(enhancedTasks);

  const [expandedTasks, setExpandedTasks] = useState<string[]>([]);

  const toggleExpand = (task: EnhancedTask) => {
    setTasks(() => toggleExpandTask(task));
  };

  const handleTaskChange = (task: Task) => {
    console.log(`Task updated: ${task.name}`);
    // Update the tasks state with the modified task if necessary
  };

  return (
    <div>
      <Gantt
        tasks={tasks}
        viewMode={ViewMode.HalfDay}
        todayColor={"#FF7276"}
        listCellWidth={300}
        onDateChange={handleTaskChange}
        TaskListHeader={(props) => <TaskListHeaderDefault {...props} />}
        TaskListTable={(props) => (
          <TaskListTableDefault {...props} onExpanderClick={toggleExpand} />
        )}
      />
    </div>
  );
};

export default GanttChart;
