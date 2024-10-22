const stages = ["A0-G1", "A1-G2", "A2-G3", "A3-G4", "A4-G5", "A5-G6"];

export const createGanttTasks = (templateTasks) => {
  console.log("templates tasjs --> ", templateTasks);

  // 1. Create an empty array to store the Gantt tasks
  const ganttTasks = [];

  // 2. Outer Loop: Iterate over each stage in the stages array
  stages.forEach((stage, index) => {
    // Add a a task with type project
    ganttTasks.push({
      id: index,
      name: stage,
      start: '2020-01-01',
      end: '2020-01-01',
      progress: 30,
      type: "project",
    });
    // 3. Inner Loop: Iterate over each task in the templateTasks array
    templateTasks.forEach((task) => {
      // 4. Check if the task's Stage_Gate_Activities_Template__r.Name matches the current stage
      if (task.Stage_Gate_Activities_Template__r.Name === stage) {
        // 5. Create a new task object with the required properties
        const newTask = {
          id: task.Id,
          name: task.Name,
          start: '2020-01-01',
          end: '2020-01-01',
          progress: 0,
          type: "task",
        };
        // 6. Add the new task to the ganttTasks array
        ganttTasks.push(newTask);
      }
    });
  });

  console.log("gantt tasks --> ", ganttTasks);

  return ganttTasks;
};
