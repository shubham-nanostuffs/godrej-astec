import "gantt-task-react/dist/index.css";
import { useState } from "react";
import { ViewMode } from "gantt-task-react";

export const ViewSwitcher = ({ onViewModeChange }) => {
  const [activeView, setActiveView] = useState(ViewMode.Week); // Default view

  const handleViewModeChange = (viewMode) => {
    setActiveView(viewMode);
    onViewModeChange(viewMode);
  };

  return (
    <div className="ViewContainer">
      <div className="flex gap-4 justify-end">
        <button
          className={`w-full px-4 py-1 rounded-md ${
            activeView === ViewMode.Day
              ? "bg-orange-500 text-white"
              : "bg-gray-300"
          }`}
          onClick={() => handleViewModeChange(ViewMode.Day)}
        >
          Day
        </button>

        <button
          className={`w-full px-4 py-1 rounded-md ${
            activeView === ViewMode.Week
              ? "bg-orange-500 text-white"
              : "bg-gray-300"
          }`}
          onClick={() => handleViewModeChange(ViewMode.Week)}
        >
          Week
        </button>
      </div>
    </div>
  );
};
