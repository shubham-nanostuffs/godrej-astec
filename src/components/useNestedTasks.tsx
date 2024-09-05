import { useMemo } from "react";
import { EnhancedTask } from "../components/EnhancedTask";

export const useNestedTasks = (
  tasks: EnhancedTask[]
): {
  enhancedTasks: EnhancedTask[];
  toggleExpandTask: (task: EnhancedTask) => EnhancedTask[];
} => {
  return useMemo(() => {
    const taskMap = new Map<string, EnhancedTask>();

    const enhancedTasks = tasks.map(task => {
      // Ensure all tasks have required properties like start, end, etc.
      const enhancedTask: EnhancedTask = {
        ...task,
        hidden: false,
        subTasksHidden: false,
        hasChildren: false,
        depth: 0,
        start: task.start ?? new Date(), // Provide default if start is undefined
        end: task.end ?? new Date(),     // Provide default if end is undefined
      };

      enhancedTask.hideSubTasks = () => {
        hideSubTasksRecursive(enhancedTask.id);
        enhancedTask.subTasksHidden = true;
      };

      enhancedTask.showSubTasks = () => {
        showSubTasksRecursive(enhancedTask.id);
        enhancedTask.subTasksHidden = false;
      };

      taskMap.set(task.id, enhancedTask);
      return enhancedTask;
    });

    function setTaskDepth(task: EnhancedTask, depth: number) {
      task.depth = depth;
      enhancedTasks.forEach(t => {
        if (t.project === task.id) {
          setTaskDepth(t, depth + 1);
        }
      });
    }

    enhancedTasks.forEach(task => {
      if (!task.project) {
        setTaskDepth(task, 0);
      }
      if (task.project) {
        const parent = taskMap.get(task.project);
        if (parent) {
          parent.hasChildren = true;
        }
      }
    });

    function hideSubTasksRecursive(taskId: string) {
      enhancedTasks.forEach(task => {
        if (task.project === taskId) {
          task.hidden = true;
          hideSubTasksRecursive(task.id);
        }
      });
    }

    function showSubTasksRecursive(taskId: string) {
      enhancedTasks.forEach(task => {
        if (task.project === taskId) {
          task.hidden = false;
          showSubTasksRecursive(task.id);
        }
      });
    }

    const toggleExpandTask = (task: EnhancedTask) => {
      if (task.subTasksHidden) task.showSubTasks!();
      else task.hideSubTasks!();

      return enhancedTasks.filter(t => !t.hidden);
    };

    return { enhancedTasks, toggleExpandTask };
  }, [tasks]);
};
