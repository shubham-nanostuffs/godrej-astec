import { Task } from "gantt-task-react";

export function getStartEndDateForProject(tasks: Task[], projectId: string): [Date, Date] {
    // Filter tasks to only include those belonging to the specified project
    const projectTasks = tasks.filter((task) => task.project === projectId);
  
    // Return default dates if no tasks found
    if (projectTasks.length === 0) {
      return [new Date(), new Date()];
    }
  
    // Initialize start and end dates with the first task's dates
    let start = new Date(projectTasks[0].start);
    let end = new Date(projectTasks[0].end);
  
    // Iterate through tasks to find the earliest start date and latest end date
    for (const task of projectTasks) {
      if (task.start < start) {
        start = new Date(task.start);
      }
      if (task.end > end) {
        end = new Date(task.end);
      }
    }
  
    return [start, end];
  }
  