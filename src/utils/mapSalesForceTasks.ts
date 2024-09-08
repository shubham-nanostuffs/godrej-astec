import { Task } from "gantt-task-react";
import { SalesforceTaskDataResponse } from "../services/salesforceTaskApi";
import { Task as GanttTask } from "gantt-task-react";

interface CustomTask extends GanttTask {
  stage?: string; // Add stage property to the task
}

const stageMapping: Record<string, number> = {
  "A0-G1": 1,
  "A1-G2": 2,
  "A2-G3": 3,
  "A3-G4": 4,
  "A4-G5": 5,
  "A5-G6": 6,
};

const parseDate = (
  dateString: Date | string | null,
  fallbackDate: Date = new Date()
): Date => {
  const date = new Date(dateString ?? "");
  return isNaN(date.valueOf()) ? fallbackDate : date;
};

// Refactored function to handle different progress color conditions
const calculateProgressStyles = (
  progress: number
): { progressColor: string; backgroundColor: string } => {
  if (progress > 100) {
    return {
      progressColor: "red", // Over-progress should be red
      backgroundColor: "red", // Over-progress should be red
    };
  } else {
    return {
      progressColor: "green", // Progress part is green
      backgroundColor: "gray", // Remaining part is gray
    };
  }
};

const calculateProgress = (
  startDate: Date,
  completedDate: Date,
  endDate: Date
): number => {
  const taskEnd = endDate.getTime();
  const taskCompleted = completedDate.getTime();

  const totalDuration = taskEnd - startDate.getTime();
  const elapsedDuration = taskCompleted - startDate.getTime();

  if (elapsedDuration >= totalDuration) {
    return elapsedDuration > totalDuration ? 120 : 100; // Over-completed or fully completed
  }

  const progress = (elapsedDuration / totalDuration) * 100;
  return progress < 0 ? 0 : progress; // Ensure progress isn't negative
};

const naturalSort = (a: string, b: string) => {
  const ax: [number, string][] = [];
  const bx: [number, string][] = [];

  a.replace(/(\d+)|(\D+)/g, (_, $1, $2) => {
    ax.push([$1 ? parseInt($1, 10) : Infinity, $2 || ""]);
    return "";
  });
  b.replace(/(\d+)|(\D+)/g, (_, $1, $2) => {
    bx.push([$1 ? parseInt($1, 10) : Infinity, $2 || ""]);
    return "";
  });

  while (ax.length && bx.length) {
    const an = ax.shift()!;
    const bn = bx.shift()!;
    const nn = an[0] - bn[0] || an[1].localeCompare(bn[1]);
    if (nn) return nn;
  }

  return ax.length - bx.length;
};

export const mapSalesforceTasksToGanttTasks = (
  salesforceTasks: SalesforceTaskDataResponse["records"]
): CustomTask[] => {
  const tasks: CustomTask[] = [];
  const stageProjects: Record<string, CustomTask> = {};
  const stageTasks: Record<string, CustomTask[]> = {};

  salesforceTasks.forEach((sfTask) => {
    const stageName =
      sfTask.Stage_Gates__r?.Stage_Gate_Activities_Template__r?.Name ??
      "Unknown Stage";

    const assignToName = sfTask.Owner?.Name ?? "Unknown Owner Name";
    // const taskStatus = sfTask.Status ?? "Unknown Task Status";

    const stageStartDate = sfTask.Stage_Gates__r?.Start_Date__c ?? "null";
    const taskCompletedDate = sfTask.CompletedDateTime ?? "null";

    const parsedStageStartDate = parseDate(stageStartDate, new Date());
    const parsedTaskCompletedDate = parseDate(taskCompletedDate, new Date());

    const stageId =
      stageMapping[stageName] !== undefined ? stageName : "Unknown Stage";

    if (!stageProjects[stageId]) {
      stageProjects[stageId] = {
        id: stageId,
        name: stageId,
        start: parsedStageStartDate,
        end: new Date(0),
        progress: 30,
        type: "project",
        hideChildren: true,
        stage: stageId, // Assign the stage to the project
      };
      tasks.push(stageProjects[stageId]);
      stageTasks[stageId] = [];
    }

    const taskStartDate = parseDate(sfTask.Start_Date__c, new Date());
    const taskEndDate = parseDate(sfTask.ActivityDate, new Date());

    const progress = calculateProgress(
      taskStartDate,
      parsedTaskCompletedDate,
      taskEndDate
    );
    const { progressColor, backgroundColor } =
      calculateProgressStyles(progress);

    const duration = Math.round(
      (taskEndDate.getTime() - taskStartDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    const task: CustomTask = {
      id: sfTask.Id ?? "Unknown Task ID",
      name: sfTask.Subject ?? "Unknown Task",
      start: taskStartDate,
      end: taskEndDate,
      progress: progress,
      type: "task",
      project: stageId,
      dependencies: [],
      styles: {
        progressColor: progress ? progressColor : "red",
        backgroundColor,
      },
      duration: duration,
      assignedToName: assignToName,
      completedDate: taskCompletedDate,
      stage: stageId, // Assign the stage to the task
    };

    stageTasks[stageId].push(task);

    if (task.end > stageProjects[stageId].end) {
      stageProjects[stageId].end = task.end;
    }
  });

  for (const stageId in stageTasks) {
    stageTasks[stageId].sort((a, b) => {
      if (a.start.getTime() !== b.start.getTime()) {
        return a.start.getTime() - b.start.getTime();
      }
      return naturalSort(a.name, b.name);
    });
  }

  const sortedTasks: Task[] = [];
  for (const stageId of Object.keys(stageMapping)) {
    if (stageProjects[stageId]) {
      sortedTasks.push(stageProjects[stageId]);
    }
    if (stageTasks[stageId]) {
      sortedTasks.push(...stageTasks[stageId]);
    }
  }

  return sortedTasks;
};
