import { Task } from "gantt-task-react";

const stageMapping: Record<string, string> = {
  "A0-G1": "1",
  "A1-G2": "2",
  "A2-G3": "3",
  "A3-G4": "4",
  "A4-G5": "5",
  "A5-A6": "6",
};

// Helper function to format dates
const formatDate = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

// Function to format Salesforce data into Gantt chart format
export const formatTasksForGantt = (records: any[]): Record<string, Task[]> => {
  const stages: Record<string, Task[]> = {};

  records.forEach((record) => {
    const stageName =
      record.Stage_Gates__r?.Stage_Gate_Activities_Template__r?.Name;
    const stageId = stageMapping[stageName || "Unknown"];

    if (!stageId) return;

    if (!stages[stageId]) {
      stages[stageId] = [];
    }

    const start = new Date(record.Start_Date__c);
    
    const end = new Date(record.ActivityDate);

    // Log formatted dates
    console.log("Formatted Start Date:", formatDate(start));
    console.log("Formatted End Date:", formatDate(end));

    stages[stageId].push({
      start: start,
      end: end,
      name: record.Subject,
      id: record.Id,
      type: "task",
      progress: record.Days__c ? parseFloat(record.Days__c) : 0,
      hideChildren: false,
      dependencies: [],
    });
  });

  return stages;
};
