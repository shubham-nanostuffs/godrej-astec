const stages = ["A0-G1", "A1-G2", "A2-G3", "A3-G4", "A4-G5", "A5-G6", "G1 Stage", "G3 Stage", "G4 Stage", "G2 Stage", "G5 Stage", "G6 Stage"];

export const createGanttTasks = (templateTasks, plannedDates) => {
  console.log("Template tasks --> ", templateTasks);
  const currentDate = new Date();

  // 1. Create an empty array to store the Gantt tasks
  const ganttTasks = [];

  // Helper function to get the planned dates based on task name (first 4 chars)
  const getPlannedDatesForTask = (taskName) => {
    // Extract first 4 characters from task name
    const taskKey = taskName.substring(0, 4);

    // Find the corresponding record from plannedDates
    const matchingPlannedDate = plannedDates.records.find(record => {
      return record[`${taskKey}_Planned_Start_Date__c`] && record[`${taskKey}_Planned_End_Date__c`];
    });

    if (matchingPlannedDate) {
      return {
        start: matchingPlannedDate[`${taskKey}_Planned_Start_Date__c`],
        end: matchingPlannedDate[`${taskKey}_Planned_End_Date__c`],
      };
    }

    return null;
  };

  // Function to extract the numeric part from the task name (e.g., "A0T10" -> 10)
  const extractTaskNumber = (taskName) => {
    const match = taskName.match(/T(\d+)$/);
    return match ? parseInt(match[1], 10) : 0; // Default to 0 if no match
  };

  // 2. Outer Loop: Iterate over each stage in the stages array
  stages.forEach((stage, index) => {
    // Add a task with type 'project' for each stage
    ganttTasks.push({
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 8),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
      name: stage,
      id: stage,
      progress: 20,
      hideChildren: true,
      type: "project",
    });

    // 3. Inner Loop: Filter tasks that belong to the current stage
    const stageTasks = templateTasks.filter(task => task.Stage_Gate_Activities_Template__r.Name === stage);

    // Sort the tasks within each stage by the numeric value after "T"
    stageTasks.sort((a, b) => extractTaskNumber(a.Name) - extractTaskNumber(b.Name));

    // 4. Add sorted tasks to the ganttTasks array
    stageTasks.forEach(task => {
      // Get the planned dates for the task
      const plannedDatesForTask = getPlannedDatesForTask(task.Name);

      // Create a new task object with the required properties
      const newTask = {
        start: plannedDatesForTask ? new Date(plannedDatesForTask.start) : new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
        end: plannedDatesForTask ? new Date(plannedDatesForTask.end) : new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
        name: task.Name + " " + task.SUBJECT__c,
        id: task.Id,
        progress: 50,
        type: "task",
        project: stage,
      };

      // Add the new task to the ganttTasks array
      ganttTasks.push(newTask);
    });
  });

  console.log("Gantt tasks --> ", ganttTasks);

  return ganttTasks;
};


