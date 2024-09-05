// src/components/EnhancedTask.ts
import { Task } from "gantt-task-react";

export interface EnhancedTask extends Task {
  hidden?: boolean;
  subTasksHidden?: boolean;
  hasChildren?: boolean;
  depth?: number;
  showSubTasks?: () => void;
  hideSubTasks?: () => void;
}
