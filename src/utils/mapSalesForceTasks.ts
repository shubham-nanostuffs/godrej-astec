import { Task } from "gantt-task-react";
import { SalesforceTaskDataResponse } from "../services/salesforceTaskApi";

// Define stage order mapping
const stageMapping: Record<string, number> = {
  "A0-G1": 1,
  "A1-G2": 2,
  "A2-G3": 3,
  "A3-G4": 4,
  "A4-G5": 5,
  "A5-G6": 6,
};

export const mapSalesforceTasksToGanttTasks = (
  salesforceTasks: SalesforceTaskDataResponse["records"]
): Task[] => {
  const tasks: Task[] = [];
  const stageProjects: Record<string, Task> = {};

  salesforceTasks.forEach((sfTask) => {
    const stageName =
      sfTask.Stage_Gates__r?.Stage_Gate_Activities_Template__r?.Name;
    const stageStartDate = sfTask.Stage_Gates__r?.Start_Date__c;
    const stageEndDate = sfTask.Stage_Gates__r?.End_Date__c;

    const stageId =
      stageMapping[stageName] !== undefined ? stageName : "Unknown Stage";

    if (!stageProjects[stageId]) {
      stageProjects[stageId] = {
        id: stageId,
        name: stageId,
        start: stageStartDate ? new Date(stageStartDate) : new Date(),
        end: stageEndDate ? new Date(stageEndDate) : new Date(),
        progress: 0,
        type: "project",
        hideChildren: true, // Initially hide children
      };
      tasks.push(stageProjects[stageId]);
    }

    const task: Task = {
      id: sfTask.Id,
      name: sfTask.Subject,
      start: sfTask.Start_Date__c ? new Date(sfTask.Start_Date__c) : new Date(),
      end: sfTask.ActivityDate ? new Date(sfTask.ActivityDate) : new Date(),
      progress: Math.random() * 100, // Set progress or define logic
      type: "task",
      project: stageId, // Associate task with the stage project
      dependencies: [], // Add dependencies if available
    };

    tasks.push(task);

    // Adjust stage project dates to encompass the task dates
    if (task.start < stageProjects[stageId].start) {
      stageProjects[stageId].start = task.start;
    }
    if (task.end > stageProjects[stageId].end) {
      stageProjects[stageId].end = task.end;
    }
  });

  // Sort tasks by stage start date and end date, then by task dates
  tasks.sort((a, b) => {
    if (a.type === "project" && b.type === "project") {
      if (a.start < b.start) return -1;
      if (a.start > b.start) return 1;
      if (a.end < b.end) return -1;
      if (a.end > b.end) return 1;
      return (stageMapping[a.name] || 0) - (stageMapping[b.name] || 0);
    }
    if (a.type === "task" && b.type === "task") {
      if (a.start < b.start) return -1;
      if (a.start > b.start) return 1;
      if (a.end < b.end) return -1;
      if (a.end > b.end) return 1;
    }
    return 0;
  });

  return tasks;
};
