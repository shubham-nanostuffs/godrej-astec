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
  let expectedDelay = 0;
  // console.log("Planned dates", plannedDates);
  // console.log("Actual Tasks", actualTasks);
  // console.log("Stages Planned Date", stagePlannedDates);

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
  //Calculated deplayed duration
  const calculateDelayedDuration = (estimatedEndDate) => {
    const a0g1PlannedEnd = new Date(getPlannedStageDates("A0-G1").plannedEnd);
    const estimatedEnd = new Date(estimatedEndDate);

    // Calculate difference in days
    let delayInDays = Math.round(
      (estimatedEnd - a0g1PlannedEnd) / (1000 * 60 * 60 * 24)
    );

    return delayInDays > 0 ? delayInDays : 0; // Only count positive delays
  };

  // console.log("Get Planned Dates For Stage", getPlannedStageDates("A2-G3"));
  const delayedDuration = () => {
    // let start = new Date(getPlannedStageDates("A0-G1").plannedStart);
    let end = new Date(getPlannedStageDates("A0-G1").plannedEnd);
    let currentDate = new Date();

    let durationInDays = 0;

    // Check if the current date is beyond the planned end date
    if (currentDate > end) {
      durationInDays =
        (currentDate - end) / (1000 * 60 * 60 * 24) + expectedDelay;
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
  const gStageIndices = templateTasks
    .map((task, index) => ({ task, index })) // Create an array of objects with task and index
    .filter((item) => item.task.Name.startsWith("G")) // Filter tasks where Name starts with "G"
    .map((item) => item.index); // Return both task and index in the resulting array

  const getPlannedDatesForGStages = (stageName) => {
    // Extract the first two characters as the task key (G1, G2, etc.)
    const taskKey = stageName.substring(0, 2);

    // Find the matching record for the task key
    const matchingPlannedDate = plannedDates.records.find(
      (record) =>
        record[`${taskKey}_Planned_Start_Date__c`] &&
        record[`${taskKey}_Planned_End_Date__c`]
    );

    // Return the start and end dates if found
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
    const stagesPlannedDate = getPlannedStageDates(stage);
    let gstagePlannedDates = getPlannedDatesForGStages(stage);
    let projectStatus = "Yet to start"; // Default status

    ganttTasks.push({
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 8),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
      name: stage,
      id: stage,
      progress: 100,
      hideChildren: true,
      type: "project",
      plannedStart: stagesPlannedDate.plannedStart ?? gstagePlannedDates.start,
      plannedEnd: stagesPlannedDate.plannedEnd ?? gstagePlannedDates.end,
      delayedDuration: delayedDuration(),
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

        calculateDelayedDuration(expectedEndDate);

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
      : "Yet to start";

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

    // console.log("Project Index and Stage:", projectIndex, stage);

    if (stage.startsWith("G") && projectIndex !== -1) {
      const prevStage = stages[stageIndex - 1];
      const nextStage = stages[stageIndex + 1];
      // console.log("Prev", prevStage, "Next", nextStage);

      // console.log("Stages", stage);

      if (stageDates[prevStage] && stageDates[nextStage]) {
        let prevStageEnd = new Date(stageDates[prevStage].end); // Convert to Date object

        let a0g1ExpectedDate = new Date(stageDates["A0-G1"].end);

        expectedDelay = calculateDelayedDuration(a0g1ExpectedDate);
        ganttTasks[0].delayedDuration = expectedDelay;

        // Find the index of the current stage in gStageIndices
        const gStageIndex = gStageIndices.find(
          (index) => templateTasks[index].Name === stage
        );

        // Use the index to get the Days_To_Complete__c value from templateTasks
        const daysToComplete =
          templateTasks[gStageIndex].Days_To_Complete__c || 0;
        ganttTasks[projectIndex].delayedDuration = expectedDelay;
        if (expectedDelay !== 0) {
          // console.log("Delayed Duration true", delayedDuration());

          const plannedDatesForStage = getPlannedDatesForGStages(stage);
          if (plannedDatesForStage) {
            const prevStageEnd = new Date(
              getPlannedStageDates(prevStage).plannedEnd
            );

            // Add delayedDuration to start and end dates
            ganttTasks[projectIndex].start = new Date(
              new Date(plannedDatesForStage.start).getTime() +
                expectedDelay * 24 * 60 * 60 * 1000
            );
            ganttTasks[projectIndex].end = new Date(
              new Date(plannedDatesForStage.end).getTime() +
                expectedDelay * 24 * 60 * 60 * 1000
            );

            // console.log(
            //   ["Start", ganttTasks[projectIndex].start],
            //   ["End", ganttTasks[projectIndex].end]
            // );
          }
        } else {
          ganttTasks[projectIndex].start = prevStageEnd;
          ganttTasks[projectIndex].end = new Date(
            prevStageEnd.getTime() + daysToComplete * 24 * 60 * 60 * 1000
          );
        }
        // Calculate start and end dates for the current G stage
        const start = ganttTasks[projectIndex].start;
        const end = ganttTasks[projectIndex].end;

        // Store G stage dates in gStageDates object
        gStageDates[stage] = { start, end, daysToComplete };

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
            ? "Yet to start"
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
      const stageTasks = templateTasks.filter(
        (task) => task.Stage_Gate_Activities_Template__r.Name === stage
      );

      // console.log("StageTasks", stageTasks);

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

        // console.log("Actual Task Details", actualTasks);

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
          });
        }
      });

      // console.log("Tasks with Planned dates", tasksWithActualDates);

      const uniqueTasks = tasksWithPlannedDates.filter(
        (task) =>
          !tasksWithActualDates.find(
            (plannedTask) => plannedTask.name === task.name
          )
      );
      // console.log("Unique Tasks", uniqueTasks);
      // console.log("Gantt Tasks", ganttTasks);
      const uniqueTaskNames = uniqueTasks.map((task) => task.name);

      const templateTaskIndices = ganttTasks
        .map((task, index) => {
          if (uniqueTaskNames.includes(task.name)) {
            // Calculate the difference between start and end dates in days
            const startDate = new Date(task.start);
            const endDate = new Date(task.end);
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

            ganttTasks[index].start = new Date(
              task.start.getTime() + expectedDelay * 24 * 60 * 60 * 1000
            );
            ganttTasks[index].end = new Date(
              task.end.getTime() + expectedDelay * 24 * 60 * 60 * 1000
            );
            const plannedDates = getPlannedStageDates(project);
            ganttTasks[projectIndex].delayedDuration = expectedDelay;

            if (typeof plannedDates !== "string") {
              // Ensure plannedDates is valid
              ganttTasks[projectIndex].start = new Date(
                new Date(plannedDates.plannedStart).getTime() +
                  expectedDelay * 24 * 60 * 60 * 1000
              );

              ganttTasks[projectIndex].end = new Date(
                new Date(plannedDates.plannedEnd).getTime() +
                  expectedDelay * 24 * 60 * 60 * 1000
              );
            } else {
              console.warn(plannedDates); // Log the error message if the stage was not found
            }

            return {
              index: index,
              task: task,
              durationInDays: diffInDays,
              project: project,
              stagesIndex: stagesIndex !== -1 ? stagesIndex : null, // Return index or null if no match
              projectIndex: projectIndex,
              prevStage: prevStage,
              nextStage: nextStage,
            };
          }
          return null;
        })
        .filter(Boolean); // Filter out null values
    }
  });

  return ganttTasks;
};
