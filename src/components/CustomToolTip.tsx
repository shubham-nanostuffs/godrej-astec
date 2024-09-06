import React from "react";
import { Task } from "gantt-task-react";

interface CustomTooltipProps {
  task: Task;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ task }) => {
  const {
    name,
    status,
    duration,
    assignedToName,
    start,
    end,
    completedDate,
    type,
  } = task;

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
            <strong>Task Status:</strong> {status}
          </div>
          <div>
            <strong>Duration:</strong> {duration + 1} days
          </div>
          <div>
            <strong>Assign To:</strong> {assignedToName}
          </div>
          <div>
            <strong>Start Date:</strong> {formatDate(new Date(start))}
          </div>
          <div>
            <strong>End Date:</strong> {formatDate(new Date(end))}
          </div>
          {status === "Completed" && (
            <div>
              <strong>Completed Date:</strong>{" "}
              {formatDate(new Date(completedDate))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CustomTooltip;
