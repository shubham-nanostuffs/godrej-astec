// Stages list
const stages = [
  "A0-G1",
  "G1 Stage",
  "A1-G2",
  "G2 Stage",
  "A2-G3",
  "G3 Stage",
  "A3-G4",
  "G4 Stage",
  "A4-G5",
  "G5 Stage",
  "A5-G6",
  "G6 Stage",
];

// Main function to create Gantt chart tasks
export const createGanttTasks = (templateTasks, plannedDates, actualTasks) => {
  const currentDate = new Date();

  // Helper function to get planned start and end dates for a task
  const getPlannedDatesForTask = (taskName) => {
    const isGStage = taskName.startsWith("G") && taskName.length === 2;
    const taskKey = isGStage ? `${taskName}` : taskName.substring(0, 5);

    const matchingPlannedDate = plannedDates.records.find(
      (record) =>
        record[`${taskKey}_Planned_Start_Date__c`] &&
        record[`${taskKey}_Planned_End_Date__c`]
    );

    if (!matchingPlannedDate) {
      return null;
    }

    const plannedStart = new Date(
      matchingPlannedDate[`${taskKey}_Planned_Start_Date__c`]
    );
    const plannedEnd = new Date(
      matchingPlannedDate[`${taskKey}_Planned_End_Date__c`]
    );

    let delayedDuration = 0;
    if (currentDate > plannedEnd) {
      const timeDiff = currentDate - plannedEnd;
      delayedDuration = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
    }

    return {
      start: plannedStart.toISOString().split("T")[0],
      end: plannedEnd.toISOString().split("T")[0],
      delayedDuration: delayedDuration > 0 ? delayedDuration : 0,
    };
  };

  // Helper function to get actual start, end dates, status, and other details for a task
  const getActualTaskDetails = (taskName) => {
    const taskKey = taskName.substring(0, 5);
    const matchingTask = actualTasks.records.find((task) =>
      task.Subject.startsWith(taskKey + "-")
    );

    if (matchingTask) {
      const startDate = new Date(matchingTask.Start_Date__c);
      const endDate = new Date(matchingTask.ActivityDate);
      const daysToAdd = matchingTask.Days__c || 0;

      const expectedEndDate = new Date(
        startDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000
      );
      const ownerName = matchingTask.Owner?.Name ?? "Unknown Owner Name";

      if (matchingTask.Status === "In Progress") {
        return {
          start: startDate,
          end: endDate,
          completedDate: matchingTask.CompletedDateTime
            ? new Date(matchingTask.CompletedDateTime)
            : null,
          status: matchingTask.Status,
          overdueFlag: expectedEndDate <= currentDate,
          assignToName: ownerName,
          currentDateUpdate: currentDate,
          duration: daysToAdd,
          expectedEndDate: expectedEndDate,
        };
      }
      return {
        start: startDate,
        end: endDate,
        duration: daysToAdd,
        completedDate: matchingTask.CompletedDateTime
          ? new Date(matchingTask.CompletedDateTime)
          : null,
        status: matchingTask.Status,
        assignToName: ownerName,
        expectedEndDate: expectedEndDate,
      };
    }
    return null;
  };

  // Function to calculate task progress based on dates and status
  const calculateProgress = (
    startDate,
    endDate,
    currentDate,
    completedDate,
    status,
    overdueFlag,
    expectedEndDate
  ) => {
    if (status === "Completed" && completedDate) {
      const totalDuration = completedDate - startDate;
      return Math.min(Math.max(totalDuration * 100, 0), 100);
    }

    if (status === "In Progress") {
      const totalDuration = expectedEndDate - startDate;
      const remainingDuration = expectedEndDate - currentDate;
      return Math.min(
        Math.max(100 - (remainingDuration / totalDuration) * 100, 0),
        100
      );
    }
    return 0;
  };

  // Function to get task styling based on status and other parameters
  const getTaskStyles = (status, completedDate, endDate, overdueFlag) => {
    if (status === "Completed") {
      return { progressColor: completedDate <= endDate ? "green" : "red" };
    }
    if (status === "In Progress") {
      return {
        progressColor: overdueFlag ? "#f76876" : "orange",
        backgroundColor: "orange",
      };
    }
    return { progressColor: "gray", backgroundColor: "gray" };
  };

  // Array to store the generated Gantt tasks
  const ganttTasks = [];
  const stageDates = {};

  // First pass: Populate `stageDates` with all initial project-level dates and tasks
  stages.forEach((stage) => {
    const stageTasks = templateTasks.filter(
      (task) => task.Stage_Gate_Activities_Template__r.Name === stage
    );

    if (stageTasks.length === 0) return;

    const extractTaskNumber = (taskName) => {
      const match = taskName.match(/T(\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    };

    // Sort tasks within the stage by task number
    stageTasks.sort(
      (a, b) => extractTaskNumber(a.Name) - extractTaskNumber(b.Name)
    );

    // Placeholder for project-level Gantt task
    const projectIndex = ganttTasks.length;

    let projectStatus = "Yet to start"; // Default status

    ganttTasks.push({
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 8),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
      name: stage,
      id: stage,
      progress: 100,
      hideChildren: true,
      type: "project",
      projectStatus: projectStatus,
      styles: {
        progressColor: "gray",
        backgroundColor: "gray",
        progressSelectedColor: "gray",
        backgroundSelectedColor: "green",
      }, // Default to 'Yet to start' color
    });

    let projectStartDate = null;
    let projectEndDate = null;

    // Track status flags within each stage
    let hasInProgress = false;
    let allCompleted = true;

    // Loop through each task within the stage and add task details to Gantt tasks
    stageTasks.forEach((task) => {
      const actualTaskDetails = getActualTaskDetails(task.Name);
      let plannedTaskDates = getPlannedDatesForTask(task.Name);

      if (actualTaskDetails || plannedTaskDates) {
        const startDate = new Date(
          actualTaskDetails?.start || plannedTaskDates?.start
        );
        const endDate = new Date(
          actualTaskDetails?.end || plannedTaskDates?.end
        );

        const status = actualTaskDetails?.status;
        const completedDate = actualTaskDetails?.completedDate ?? "";
        const overdueFlag = actualTaskDetails?.overdueFlag;
        const assignToName = actualTaskDetails?.assignToName;
        const expectedEndDate = actualTaskDetails?.expectedEndDate ?? endDate;

        const delayedDuration = plannedTaskDates?.delayedDuration;
        // Update project-level start and end dates
        if (!projectStartDate || startDate < projectStartDate)
          projectStartDate = startDate;
        if (!projectEndDate || expectedEndDate > projectEndDate)
          projectEndDate = expectedEndDate;
        projectStatus === "In Progress";
        if (!projectEndDate || completedDate > projectEndDate)
          projectEndDate = completedDate;
        projectStatus = "Completed";

        // Update project status based on task statuses
        if (status === "In Progress") hasInProgress = true;
        if (status !== "Completed") allCompleted = false;

        const progress = calculateProgress(
          startDate,
          endDate,
          currentDate,
          completedDate,
          status,
          overdueFlag,
          expectedEndDate
        );

        // Get styling for the task based on status
        const { progressColor, backgroundColor } = getTaskStyles(
          status,
          completedDate,
          endDate,
          overdueFlag
        );

        // Create task object and add to Gantt tasks
        ganttTasks.push({
          start: startDate,
          end:
            status === "Completed" && completedDate
              ? completedDate
              : expectedEndDate || plannedDates.end,
          name: `${task.Name} ${task.SUBJECT__c}`,
          id: task.Id,
          progress: progress,
          type: "task",
          project: stage,
          status: status,
          completedDate: completedDate,
          plannedStart: plannedTaskDates.start,
          plannedEnd: plannedTaskDates.end,
          duration: actualTaskDetails?.duration,
          delayedDuration: delayedDuration,
          expectedEndDate: expectedEndDate,
          assignedToName: assignToName,
          styles: {
            progressColor,
            backgroundColor,
            backgroundSelectedColor: backgroundColor,
            progressSelectedColor: progressColor,
          },
        });
      }
    });

    // Set projectStatus based on flags
    projectStatus = allCompleted
      ? "Completed"
      : hasInProgress
      ? "In Progress"
      : "Yet to Start";

    // Update initial project-level start and end dates in `stageDates`
    stageDates[stage] = {
      start:
        projectStartDate ||
        new Date(currentDate.getFullYear(), currentDate.getMonth(), 10),
      end:
        projectEndDate ||
        new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
    };

    ganttTasks[projectIndex].start = stageDates[stage].start;
    ganttTasks[projectIndex].end = stageDates[stage].end;
    ganttTasks[projectIndex].projectStatus = projectStatus; // Set the determined projectStatus

    const progressColor =
      projectStatus === "In Progress"
        ? "orange"
        : projectStatus === "Completed"
        ? "green"
        : "gray";

    const backgroundColor =
      projectStatus === "In Progress"
        ? "orange"
        : projectStatus === "Completed"
        ? "green"
        : "gray";

    // Set project color based on projectStatus
    ganttTasks[projectIndex].styles = {
      progressColor: progressColor,
      backgroundColor: backgroundColor,
      backgroundSelectedColor: backgroundColor,
      progressSelectedColor: progressColor,
    };
  });

  const gStageDates = {};
  // Second pass: Adjust dates and projectStatus for "G" stages based on dependencies
  stages.forEach((stage, stageIndex) => {
    const projectIndex = ganttTasks.findIndex((task) => task.name === stage);

    const gStageIndices = templateTasks
      .map((task, index) => ({ task, index })) // Create an array of objects with task and index
      .filter((item) => item.task.Name.startsWith("G")) // Filter tasks where Name starts with "G"
      .map((item) => ({ task: item.task, index: item.index })); // Return both task and index in the resulting array

    if (stage.startsWith("G") && projectIndex !== -1) {
      const prevStage = stages[stageIndex - 1];
      const nextStage = stages[stageIndex + 1];

      const plannedTaskDates = getPlannedDatesForTask(stage.split(" ")[0]);

      if (stageDates[prevStage] && stageDates[nextStage]) {
        const prevStageEnd = new Date(stageDates[prevStage].end); // Convert to Date object

        console.log(
          "Planned task dates",
          new Date(plannedTaskDates.start).getTime()
        );

        const gStage = gStageIndices.find(
          (item) => item.task.Name === stage // Use the task property directly
        );

        const gstageEnd = new Date(stageDates[gStage]); // Convert to Date object

        let delayedDuration = 0;
        console.log("Previous Stage Date", prevStage,prevStageEnd, currentDate);
        
        if (currentDate > prevStageEnd) {
          const timeDiff = currentDate - prevStageEnd;
          delayedDuration = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)); // Convert milliseconds to days

          let startDate = new Date(
            new Date(plannedTaskDates?.start).getTime() +
              delayedDuration * 24 * 60 * 60 * 1000
          );

          let endDate = new Date(
            new Date(plannedTaskDates?.end).getTime() +
              delayedDuration * 24 * 60 * 60 * 1000
          );

          console.log(startDate, endDate);

          ganttTasks[projectIndex].start = startDate;
          ganttTasks[projectIndex].end = endDate;
        } 
        // Use the index to get the Days_To_Complete__c value from templateTasks
        const daysToComplete = gStage
          ? gStage.task.Days_To_Complete__c || 0
          : 0;

        // Calculate start and end dates for the current G stage
        const start = prevStageEnd;
        const end = new Date(
          prevStageEnd.getTime() + daysToComplete * 24 * 60 * 60 * 1000
        );

        // Store G stage dates in gStageDates object
        gStageDates[stage] = { start, end };

        // Update ganttTasks start and end
        // ganttTasks[projectIndex].start = start;
        // ganttTasks[projectIndex].end = end;

        const prevStageStatus = ganttTasks.find(
          (task) => task.name === prevStage
        )?.projectStatus;
        const nextStageStatus = ganttTasks.find(
          (task) => task.name === nextStage
        )?.projectStatus;

        ganttTasks[projectIndex].projectStatus =
          prevStageStatus === "In Progress" || nextStageStatus === "In Progress"
            ? "In Progress"
            : prevStageStatus === "Completed" && nextStageStatus === "Completed"
            ? "Completed"
            : "Yet to start";

        const progressColor =
          ganttTasks[projectIndex].projectStatus === "In Progress"
            ? "orange"
            : ganttTasks[projectIndex].projectStatus === "Completed"
            ? "green"
            : "gray";

        const backgroundColor =
          ganttTasks[projectIndex].projectStatus === "In Progress"
            ? "orange"
            : ganttTasks[projectIndex].projectStatus === "Completed"
            ? "green"
            : "gray";

        ganttTasks[projectIndex].styles = {
          progressColor: progressColor,
          backgroundColor: backgroundColor,
          backgroundSelectedColor: backgroundColor,
          progressSelectedColor: progressColor,
        };
      }
    } else {
      const prevStage = stages[stageIndex - 1];
      const nextStage = stages[stageIndex + 1];

      if (stageDates[prevStage] && stageDates[nextStage]) {
        const prevStageEnd = new Date(stageDates[prevStage].end);

        // Use G stage start and end dates from gStageDates
        if (gStageDates) {
          console.log("Using stored G stage dates:", gStageDates);
        }
      }
      const stageTasks = templateTasks.filter(
        (task) => task.Stage_Gate_Activities_Template__r.Name === stage
      );

      if (stageTasks.length === 0) return;

      const extractTaskNumber = (taskName) => {
        const match = taskName.match(/T(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      };
      // Array to store tasks with only actual dates
      const tasksWithActualDates = [];
      const tasksWithPlannedDates = [];
      // Sort tasks within the stage by task number
      stageTasks.sort(
        (a, b) => extractTaskNumber(a.Name) - extractTaskNumber(b.Name)
      );

      stageTasks.forEach((task) => {
        const actualTaskDetails = getActualTaskDetails(task.Name);
        const plannedTaskDates = getPlannedDatesForTask(task.Name);

        // Store tasks with only actual dates
        if (actualTaskDetails) {
          tasksWithActualDates.push({
            name: `${task.Name} ${task.SUBJECT__c}`,
            startDate: actualTaskDetails.start,
            endDate: actualTaskDetails.end,
            status: actualTaskDetails.status,
          });
        }
        if (plannedTaskDates) {
          tasksWithPlannedDates.push({
            name: `${task.Name} ${task.SUBJECT__c}`,
            startDate: plannedTaskDates.start,
            endDate: plannedTaskDates.end,
            delayedDuration: plannedTaskDates?.delayedDuration,
          });
        }
      });

      const uniqueTasks = tasksWithPlannedDates.filter(
        (task) =>
          !tasksWithActualDates.find(
            (plannedTask) => plannedTask.name === task.name
          )
      );

      const uniqueTaskNames = uniqueTasks.map((task) => task.name);

      const templateTaskIndices = ganttTasks
        .map((task, index) => {
          if (uniqueTaskNames.includes(task.name)) {
            // Calculate the difference between start and end dates in days
            let startDate = new Date(task.start);
            let endDate = new Date(task.end);

            if (currentDate > endDate && task.delayedDuration !== 0) {
              startDate = new Date(
                startDate.getTime() + task.delayedDuration * 24 * 60 * 60 * 1000
              );
              endDate = new Date(
                endDate.getTime() + task.delayedDuration * 24 * 60 * 60 * 1000
              );
            }

            const project = task.project;
            const diffInMilliseconds = endDate - startDate;
            const diffInDays = diffInMilliseconds / (1000 * 60 * 60 * 24);

            const stagesIndex = stages.findIndex((stage) =>
              stage.includes(project)
            );

            const projectIndex = ganttTasks.findIndex(
              (task) => task.name === stage
            );

            const prevStage = stages[stagesIndex - 1];
            const nextStage = stages[stagesIndex + 1];
            const prevStageEndDate = new Date(gStageDates[prevStage].end);
            const currentStageEndDate = new Date(
              prevStageEndDate.getTime() + diffInDays * 24 * 60 * 60 * 1000
            );

            return {
              startDate: startDate,
              endDate: endDate,
              index: index,
              task: task,
              // durationInDays: diffInDays,
              project: project,
              stagesIndex: stagesIndex !== -1 ? stagesIndex : null, // Return index or null if no match
              projectIndex: projectIndex,
              prevStage: prevStage,
              nextStage: nextStage,
              prevStageEndDate: prevStageEndDate,
              currentStageEndDate: currentStageEndDate,
            };
          }
          return null;
        })
        .filter(Boolean); // Filter out null values

      templateTaskIndices.map((item) => {
        ganttTasks[item.index].start = item.startDate;
        // ganttTasks[item.projectIndex].start = item.prevStageEndDate;
        // ganttTasks[item.projectIndex].end = item.currentStageEndDate;
        ganttTasks[item.index].end = item.endDate;
      });

      // fetch G Stages start and end date here
    }
  });

  return ganttTasks;
};
