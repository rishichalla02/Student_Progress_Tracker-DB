import { useEffect, useState } from "react";
import { useStudent } from "../context/StudentContext";
import Loader from "../components/ui/Loader";
import "../style/progress.css";

const Progress = () => {
  const { subjects, getDailyProgress } = useStudent();
  const [progress, setProgress] = useState({});
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await getDailyProgress();
      setProgress(data);
      setPageLoading(false);
    };
    load();
  }, []);

  if (pageLoading) return <Loader text="Loading Progress..." />;

  const totalGoal = subjects.reduce((sum, s) => sum + s.dailyGoalMinutes, 0);
  const totalStudied = subjects.reduce(
    (sum, s) => sum + (progress[s.id]?.studied || 0),
    0,
  );
  const overallPercent =
    totalGoal > 0 ? Math.min((totalStudied / totalGoal) * 100, 100) : 0;
  const completedCount = subjects.filter(
    (s) => (progress[s.id]?.studied || 0) >= s.dailyGoalMinutes,
  ).length;

  return (
    <div className="progress-container">
      <div className="progress-header-section">
        <h1>Study Progress</h1>
        <p className="progress-subtitle">Your daily learning overview</p>
      </div>

      {/* Overall Summary */}
      <div className="overall-row">
        <div className="overall-card">
          <h2>Overall Progress</h2>
          <div className="overall-bar">
            <div
              className="overall-fill"
              style={{ width: `${overallPercent}%` }}
            />
          </div>
          <div className="overall-stats">
            <span>{Math.round(overallPercent)}% completed</span>
            <span>
              {totalStudied} / {totalGoal} min
            </span>
          </div>
        </div>

        <div className="summary-cards">
          <div className="summary-card">
            <span className="summary-icon">🏆</span>
            <div>
              <p className="summary-val">{completedCount}</p>
              <p className="summary-label">Completed</p>
            </div>
          </div>
          <div className="summary-card">
            <span className="summary-icon">⏳</span>
            <div>
              <p className="summary-val">{subjects.length - completedCount}</p>
              <p className="summary-label">Remaining</p>
            </div>
          </div>
          <div className="summary-card">
            <span className="summary-icon">⏱️</span>
            <div>
              <p className="summary-val">{totalStudied}m</p>
              <p className="summary-label">Studied</p>
            </div>
          </div>
        </div>
      </div>

      {/* Subject-wise Progress */}
      <h2 className="subjects-heading">Subject Breakdown</h2>
      <div className="subject-progress">
        {subjects.map((sub) => {
          const studied = progress[sub.id]?.studied || 0;
          const goal = sub.dailyGoalMinutes;
          const percent = Math.min((studied / goal) * 100, 100);
          const completed = studied >= goal;

          return (
            <div
              className={`progress-card ${completed ? "progress-card-done" : ""}`}
              key={sub.id}
            >
              <div className="progress-card-top">
                <h3>{sub.name}</h3>
                <span className={completed ? "badge-done" : "badge-pending"}>
                  {completed ? "✓ Completed" : "In Progress"}
                </span>
              </div>
              <div className="progress-minutes">
                {studied} / {goal} minutes
              </div>
              <div className="progress-bar">
                <div
                  className={`progress-fill ${completed ? "completed-bar" : ""}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
              <div className="progress-percent-row">
                <span>{Math.round(percent)}%</span>
                <span>
                  {goal - studied > 0
                    ? `${goal - studied} min left`
                    : "Goal reached! 🎉"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Progress;
