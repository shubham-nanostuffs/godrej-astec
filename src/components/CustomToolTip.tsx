import React from "react";
import { Task } from "gantt-task-react";

// Extend the Task interface to add custom fields
interface CustomTask extends Task {
  status: string;
  duration: number;
  assignedToName: string;
  completedDate?: Date;
}

const CustomTooltip: React.FC<{
  task: Task; // Keep the task as the base Task type to satisfy GanttProps
  fontSize: string;
  fontFamily: string;
}> = ({ task }) => {
  const {
    name,
    start,
    end,
    type,
  } = task;

  // Type-cast task to CustomTask where needed
  const customTask = task as CustomTask;

  // Format dates
  const formatDate = (date: Date) =>
    date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <div
      style={{ padding: "10px", background: "#fff", border: "1px solid #ccc" }}
    >
      {type === "project" ? (
        // Display only start and end date for project type (stage)
        <>
          <div>
            <strong>Stage Name:</strong> {name}
          </div>
          <div>
            <strong>Start Date:</strong> {formatDate(new Date(start))}
          </div>
          <div>
            <strong>End Date:</strong> {formatDate(new Date(end))}
          </div>
        </>
      ) : (
        // Display detailed info for regular tasks
        <>
          <div>
            <strong>Task Name:</strong> {name}
          </div>
          <div>
            <strong>Task Status:</strong> {customTask.status}
          </div>
          <div>
            <strong>Duration:</strong> {customTask.duration + 1} days
          </div>
          <div>
            <strong>Assign To:</strong> {customTask.assignedToName}
          </div>
          <div>
            <strong>Start Date:</strong> {formatDate(new Date(start))}
          </div>
          <div>
            <strong>End Date:</strong> {formatDate(new Date(end))}
          </div>
          {customTask.status === "Completed" && customTask.completedDate && (
            <div>
              <strong>Completed Date:</strong>
              {formatDate(new Date(customTask.completedDate))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CustomTooltip;
