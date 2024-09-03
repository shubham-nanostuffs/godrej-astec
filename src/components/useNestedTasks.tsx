import { Task } from "gantt-task-react";
import { useMemo } from "react";
import { EnhancedTask } from "./EnhancedTask";

export const useNestedTasks = (
  tasks: Task[]
): {
  enhancedTasks: EnhancedTask[];
  toggleExpandTask: (task: EnhancedTask) => EnhancedTask[];
} => {
  return useMemo(() => {
    const taskMap = new Map<string, EnhancedTask>();

    const enhancedTasks = tasks.map((task) => {
      const enhancedTask: EnhancedTask = {
        ...task,
        hidden: false,
        subTasksHidden: false,
        hasChildren: false,
        depth: 0,
      } as EnhancedTask;

      enhancedTask.hideSubTasks = () => {
        console.debug("hideSubTasks", enhancedTask.id);
        hideSubTasksRecursive(enhancedTask.id);
        enhancedTask.subTasksHidden = true;
      };

      enhancedTask.showSubTasks = () => {
        console.debug("showSubTasks", enhancedTask.id);
        showSubTasksRecursive(enhancedTask.id);
        enhancedTask.subTasksHidden = false;
      };

      taskMap.set(task.id, enhancedTask);
      return enhancedTask;
    });

    // Set the depth for each task
    function setTaskDepth(task: EnhancedTask, depth: number) {
      task.depth = depth;
      enhancedTasks.forEach((t) => {
        if (t.project === task.id) {
          setTaskDepth(t, depth + 1);
        }
      });
    }

    enhancedTasks.forEach((task) => {
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

    // Recursive function to hide subtasks
    function hideSubTasksRecursive(taskId: string) {
      enhancedTasks.forEach((task) => {
        if (task.project === taskId) {
          task.hidden = true;
          console.debug("hid", task.id);
          hideSubTasksRecursive(task.id);
          task.subTasksHidden = true;
        }
      });
    }

    // Recursive function to show subtasks
    function showSubTasksRecursive(taskId: string) {
      enhancedTasks.forEach((task) => {
        if (task.project === taskId) {
          task.hidden = false;
          console.debug("show", task.id);
          showSubTasksRecursive(task.id);
          task.subTasksHidden = false;
        }
      });
    }

    const toggleExpandTask = (task: EnhancedTask) => {
      console.log("expand/collapse", task.name);
      if (task.subTasksHidden) task.showSubTasks();
      else task.hideSubTasks();

      return enhancedTasks.filter((t) => !t.hidden);
    };

    return { enhancedTasks, toggleExpandTask };
  }, [tasks]);
};
