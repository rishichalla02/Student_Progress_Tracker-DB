import { useEffect, useState } from "react";
import { useStudent } from "../context/StudentContext";
import Button from "../components/ui/Button";
import InputField from "../components/form/InputField";
import Loader from "../components/ui/Loader";
import "../style/tasks.css";

/* ─── External Link SVG Icon ─── */
const ExternalLinkIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    width="13"
    height="13"
  >
    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const Tasks = () => {
  const { subjects, getDailyProgress, saveDailyProgress } = useStudent();
  const [progress, setProgress] = useState({});
  const [minutes, setMinutes] = useState({});
  const [pageLoading, setPageLoading] = useState(true);

  const today = new Date().toISOString().split("T")[0];

  // Load daily progress from Firestore
  useEffect(() => {
    const load = async () => {
      const data = await getDailyProgress();
      setProgress(data);
      setPageLoading(false);
    };
    load();
  }, []);

  const handleAddMinutes = async (subject) => {
    const addMin = Number(minutes[subject.id]);
    if (!addMin || addMin <= 0) return;

    const current = progress[subject.id]?.studied || 0;
    const updatedStudied = Math.min(current + addMin, subject.dailyGoalMinutes);

    const updatedProgress = {
      ...progress,
      [subject.id]: {
        studied: updatedStudied,
        goal: subject.dailyGoalMinutes,
      },
    };

    setProgress(updatedProgress);
    await saveDailyProgress(updatedProgress);
    setMinutes((prev) => ({ ...prev, [subject.id]: "" }));
  };

  const handleReset = async (subjectId) => {
    const updated = { ...progress };
    delete updated[subjectId];
    setProgress(updated);
    await saveDailyProgress(updated);
  };

  const handleLearn = (url) => {
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  if (pageLoading) return <Loader text="Loading Tasks..." />;

  return (
    <div className="task-container">
      <div className="task-header-section">
        <h1>Daily Study Tasks</h1>
        <p className="task-subtitle">
          Track your study minutes and open learning resources for each subject
        </p>
      </div>

      <div className="tasks-grid">
        {subjects.map((sub) => {
          const studied = progress[sub.id]?.studied || 0;
          const goal = sub.dailyGoalMinutes;
          const completed = studied >= goal;
          const percent = Math.min((studied / goal) * 100, 100);

          return (
            <div
              className={`task-card ${completed ? "task-card-done" : ""}`}
              key={sub.id}
            >
              {/* Card Top */}
              <div className="task-top">
                <div>
                  <h3>{sub.name}</h3>
                  <p className="task-progress">
                    {studied} / {goal} min
                  </p>
                </div>
                <span
                  className={`task-badge ${completed ? "badge-done" : "badge-pending"}`}
                >
                  {completed ? "✓ Done" : "In Progress"}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="progress-bar">
                <div
                  className={`progress-fill ${completed ? "completed-bar" : ""}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
              <div className="progress-percent">{Math.round(percent)}%</div>

              {/* Actions */}
              <div className="task-action">
                <InputField
                  type="number"
                  placeholder="Add minutes studied"
                  value={minutes[sub.id] || ""}
                  disabled={completed}
                  onChange={(e) =>
                    setMinutes({ ...minutes, [sub.id]: e.target.value })
                  }
                />

                <div className="task-btns">
                  {/* Add */}
                  <Button
                    variant="secondary"
                    disabled={completed}
                    onClick={() => handleAddMinutes(sub)}
                  >
                    + Add
                  </Button>

                  {/* Reset */}
                  <Button
                    variant="danger"
                    disabled={!studied}
                    onClick={() => handleReset(sub.id)}
                  >
                    Reset
                  </Button>

                  {/* Learn */}
                  <button
                    className={`learn-btn ${!sub.learnUrl ? "learn-btn-disabled" : ""}`}
                    onClick={() => handleLearn(sub.learnUrl)}
                    disabled={!sub.learnUrl}
                    title={
                      sub.learnUrl
                        ? `Open: ${sub.learnUrl}`
                        : "No learning link for this subject"
                    }
                  >
                    <ExternalLinkIcon />
                    Learn
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Tasks;
