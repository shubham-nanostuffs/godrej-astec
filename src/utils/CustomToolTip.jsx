const CustomTooltip = ({ task, fontSize, fontFamily, project }) => {
  const {
    name,
    start,
    end,
    type,
    status,
    assignedToName,
    duration,
    plannedEnd,
    plannedStart,
    completedDate,
    expectedEndDate,
    projectStatus
  } = task;


  // Format dates
  const formatDate = (date) =>
    new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  // Determine border color based on status
  const borderColor =
    status === "In Progress"
      ? "orange"
      : status === "Completed"
      ? "green"
      : "#ccc";

  const plannedFields = assignedToName && duration;

  return (
    <div
      style={{
        padding: "10px",
        background: "#fff",
        border: `6px solid ${borderColor}`,
        textAlign: "start",
      }}
    >
      {type === "project" ? (
        // Display only start and end date for project type (stage)
        <>
          <div>
            <strong>Stage Name:</strong> {name}
          </div>
          <div>
            <strong>Start Date:</strong> {formatDate(start)}
          </div>
          <div>
            <strong>End Date:</strong> {formatDate(end)}
          </div>
          <div>
            <strong>Project Status:</strong> {projectStatus}
          </div>
        </>
      ) : (
        // Display detailed info for regular tasks
        <>
          <div>
            <strong>Task Name:</strong> {name}
          </div>
          {plannedFields && (
            <>
              <div>
                <strong>Assign To:</strong> {assignedToName}
              </div>

              <div>
                <strong>Duration:</strong> {duration} days
              </div>
            </>
          )}
          <div>
            <strong>Task Status:</strong> {status ? status : "Yet to start"}
          </div>
          <div>
            <strong>Planned Start Date:</strong> {formatDate(plannedStart)}
          </div>
          <div>
            <strong>Planned End Date:</strong> {formatDate(plannedEnd)}
          </div>
          {plannedFields && (
            <div>
              <strong>Actual Start Date:</strong> {formatDate(start)}
            </div>
          )}

          {status === "Completed" && completedDate ? (
            <div>
              <strong>Completion Date:</strong> {formatDate(completedDate)}
            </div>
          ) : (
            <>
              {plannedFields && (
                <div>
                  <strong>Expected End Date:</strong>{" "}
                  {formatDate(expectedEndDate)}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default CustomTooltip;
