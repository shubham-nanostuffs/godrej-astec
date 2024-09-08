import { Task } from "gantt-task-react";

export interface EnhancedTask extends Task {
  hidden: boolean;
  subTasksHidden: boolean;
  hasChildren: boolean;
  hideSubTasks: () => void;
  showSubTasks: () => void;
  depth: number;
}
