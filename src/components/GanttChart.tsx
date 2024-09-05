// src/components/GanttChart.tsx
import React, { useState } from "react";
import { Gantt, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import { TaskListHeaderDefault } from "./TaskListHeader";
import { TaskListTableDefault } from "./TaskListTable";
import { EnhancedTask } from "./EnhancedTask";
import { useNestedTasks } from "./useNestedTasks";

interface GanttChartProps {
  initTasks: EnhancedTask[];
}

const GanttChart: React.FC<GanttChartProps> = ({ initTasks }) => {
  const { enhancedTasks, toggleExpandTask } = useNestedTasks(initTasks);
  const [tasks, setTasks] = useState<EnhancedTask[]>(enhancedTasks);

  
  
  const toggleExpand = (task: EnhancedTask) => {
    console.log("task", task);
    setTasks(toggleExpandTask(task));
  };

  return (
    <div>
      <Gantt
        tasks={tasks}
        viewMode={ViewMode.HalfDay}
        todayColor="#FF7276"
        listCellWidth="300px"
        TaskListHeader={(props) => <TaskListHeaderDefault {...props} />}
        TaskListTable={(props) => (
          <TaskListTableDefault
            {...props}
            tasks={tasks}
            onExpanderClick={toggleExpand}
          />
        )}
      />
    </div>
  );
};

export default GanttChart;
