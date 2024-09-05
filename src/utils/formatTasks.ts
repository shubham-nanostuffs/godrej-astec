import { Task } from "gantt-task-react";

// Function to get the start and end dates for a project from records
export const getStartEndDateForProject = (records: any[], projectId: string) => {
  const projectRecords = records.filter((r) => {
    const stageName = r.Stage_Gates__r?.Stage_Gate_Activities_Template__r?.Name;
    return stageMapping[stageName || "Unknown"] === projectId;
  });

  if (projectRecords.length === 0) {
    return [null, null];
  }

  let start = new Date(projectRecords[0].Start_Date__c);
  let end = new Date(projectRecords[0].ActivityDate);

  for (let i = 1; i < projectRecords.length; i++) {
    const record = projectRecords[i];
    const recordStart = new Date(record.Start_Date__c);
    const recordEnd = new Date(record.ActivityDate);

    if (start.getTime() > recordStart.getTime()) {
      start = recordStart;
    }
    if (end.getTime() < recordEnd.getTime()) {
      end = recordEnd;
    }
  }
  return [start, end];
};

const stageMapping: Record<string, string> = {
  "A0-G1": "1",
  "A1-G2": "2",
  "A2-G3": "3",
  "A3-G4": "4",
  "A4-G5": "5",
  "A5-A6": "6",
};

// Helper function to format dates
const formatDate = (date: Date | null | undefined): string => {
  return date ? date.toISOString().split("T")[0] : "N/A";
};

// Function to format Salesforce data into Gantt chart format
export const formatTasksForGantt = (records: any[]): Record<string, Task[]> => {
  const stages: Record<string, Task[]> = {};

  // Organize tasks by stageId
  const tasksByStage: Record<string, Task[]> = {};

  records.forEach((record) => {
    const stageName =
      record.Stage_Gates__r?.Stage_Gate_Activities_Template__r?.Name;
    const stageId = stageMapping[stageName || "Unknown"];

    if (!stageId) return;

    if (!tasksByStage[stageId]) {
      tasksByStage[stageId] = [];
    }

    // Check for null or undefined dates
    const start = record.Start_Date__c ? new Date(record.Start_Date__c) : null;
    const end = record.ActivityDate ? new Date(record.ActivityDate) : null;

    // If both start and end dates are null, skip the record
    if (!start || !end) return;

    tasksByStage[stageId].push({
      start,
      end,
      name: record.Subject,
      id: record.Id,
      type: "task",
      progress: record.Days__c ? parseFloat(record.Days__c) : 0,
      hideChildren: false,
      dependencies: [],
    });
  });

  // Determine the start and end dates for each stage
  Object.keys(tasksByStage).forEach((stageId) => {
    const stageTasks = tasksByStage[stageId];
    const [stageStart, stageEnd] = getStartEndDateForProject(records, stageId);

    // Update tasks with the correct start and end dates for the stage
    stages[stageId] = stageTasks.map(task => ({
      ...task,
      start: stageStart, // Assign the Date object directly
      end: stageEnd,     // Assign the Date object directly
    }));
  });

  console.log(stages);

  return stages;
};
