import React, { useState } from "react";
import { Gantt, Task, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import { TaskListHeaderDefault } from "./TaskListHeader";
import { TaskListTableDefault } from "./TaskListTable";
import { EnhancedTask } from "./EnhancedTask";
import { useNestedTasks } from "./useNestedTasks";

interface GanttChartProps {
  initTasks: Task[];
}

const GanttChart: React.FC<GanttChartProps> = ({ initTasks }) => {
  const { enhancedTasks, toggleExpandTask } = useNestedTasks(initTasks);

  const [tasks, setTasks] = useState<EnhancedTask[]>(enhancedTasks);

  const toggleExpand = (task: EnhancedTask) => {
    setTasks(toggleExpandTask(task));
  };

  // const handleTaskChange = (task: Task) => {
  //   console.log(`Task updated: ${task.name}`);
  //   // Implement any additional logic for handling task changes if needed
  // };

  return (
    <div>
      <Gantt
        tasks={tasks}
        viewMode={ViewMode.HalfDay}
        todayColor="#FF7276"
        listCellWidth="300px"
        // onDateChange={handleTaskChange}
        TaskListHeader={(props) => <TaskListHeaderDefault {...props} />}
        TaskListTable={(props) => (
          <TaskListTableDefault
            {...props}
            tasks={tasks}  // Ensure the tasks prop is passed as EnhancedTask[]
            onExpanderClick={toggleExpand}
          />
        )}
      />
    </div>
  );
};

export default GanttChart;
