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
export const createGanttTasks = (
  templateTasks,
  plannedDates,
  stagePlannedDates,
  actualTasks
) => {
  const currentDate = new Date();
  console.log("Template tasks", templateTasks);

  // console.log("Stage Planned  Dates", stagePlannedDates.groupResults);

  // Helper function to get planned start and end dates for a task
  // Helper function to get planned dates for a specific stage

  const getPlannedStageDates = (stageName) => {
    const result = stagePlannedDates.groupResults.find(
      (groupResult) => groupResult.groupName === stageName
    );

    if (!result) {
      return `Stage "${stageName}" not found.`;
    }

    return {
      plannedStart: result.minDate,
      plannedEnd: result.maxDate,
    };
  };
  // console.log("Get Planned Dates For Stage", getPlannedStageDates("A2-G3"));
  const delayedDuration = () => {
    // let start = new Date(getPlannedStageDates("A0-G1").plannedStart);
    let end = new Date(getPlannedStageDates("A0-G1").plannedEnd);
    let currentDate = new Date();

    let durationInDays = 0;

    // Check if the current date is beyond the planned end date
    if (currentDate > end) {
      durationInDays = (currentDate - end) / (1000 * 60 * 60 * 24);
    }

    return Math.round(durationInDays);
  };

  // Helper function to get planned start and end dates for a task
  const getPlannedDatesForTask = (taskName) => {
    const taskKey = taskName.substring(0, 5);
    const matchingPlannedDate = plannedDates.records.find(
      (record) =>
        record[`${taskKey}_Planned_Start_Date__c`] &&
        record[`${taskKey}_Planned_End_Date__c`]
    );

    return matchingPlannedDate
      ? {
          start: matchingPlannedDate[`${taskKey}_Planned_Start_Date__c`],
          end: matchingPlannedDate[`${taskKey}_Planned_End_Date__c`],
        }
      : null;
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
      const plannedTaskDates = getPlannedDatesForTask(task.Name);

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

  // Second pass: Adjust dates and projectStatus for "G" stages based on dependencies
  stages.forEach((stage, stageIndex) => {
    const projectIndex = ganttTasks.findIndex((task) => task.name === stage);
    const gStageIndices = templateTasks
      .map((task, index) => ({ task, index }))
      .filter((item) => item.task.Name.startsWith("G"))
      .map((item) => item.index);
    console.log("Stage tasks", gStageIndices);

    console.log("Delayed Duration", delayedDuration());

    if (stage.startsWith("G") && projectIndex !== -1) {
      const prevStage = stages[stageIndex - 1];
      const nextStage = stages[stageIndex + 1];

      if (stageDates[prevStage] && stageDates[nextStage]) {
        const prevStageEnd = new Date(stageDates[prevStage].end); // Convert to Date object
        // Find the index of the current stage in gStageIndices
        const gStageIndex = gStageIndices.find(
          (index) => templateTasks[index].Name === stage
        );

        // Use the index to get the Days_To_Complete__c value from templateTasks
        const daysToComplete =
          templateTasks[gStageIndex].Days_To_Complete__c || 0;
        // Update ganttTasks start and end
        if (delayedDuration() !== 0) {
          console.log("Delayed Duration true", delayedDuration());

          // Add delayedDuration to start and end dates
          ganttTasks[projectIndex].start = new Date(
            prevStageEnd.getTime() + delayedDuration() * 24 * 60 * 60 * 1000
          );
          ganttTasks[projectIndex].end = new Date(
            prevStageEnd.getTime() +
              (delayedDuration() + daysToComplete) * 24 * 60 * 60 * 1000
          );

          console.log(
            ["Start", ganttTasks[projectIndex].start],
            ["End", ganttTasks[projectIndex].end]
          );
        } else {
          ganttTasks[projectIndex].start = prevStageEnd;
          ganttTasks[projectIndex].end = new Date(
            prevStageEnd.getTime() + daysToComplete * 24 * 60 * 60 * 1000
          );
        }

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
    }
  });

  // console.log("Stage Dates", stages);

  return ganttTasks;
};
