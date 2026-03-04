import { useEffect, useState } from "react";
import { useStudent } from "../context/StudentContext";
import Loader from "../components/ui/Loader";
import YOUTUBE_RESOURCES from "../data/videoResources";
import "../style/progress.css";

/* ── SVG Icons ──────────────────────────────────────────────── */
const YTLogo = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="#ff0000">
    <path d="M23.5 6.2a3.01 3.01 0 00-2.1-2.1C19.6 3.6 12 3.6 12 3.6s-7.6 0-9.4.5A3.01 3.01 0 00.5 6.2 31.3 31.3 0 000 12a31.3 31.3 0 00.5 5.8 3.01 3.01 0 002.1 2.1c1.8.5 9.4.5 9.4.5s7.6 0 9.4-.5a3.01 3.01 0 002.1-2.1A31.3 31.3 0 0024 12a31.3 31.3 0 00-.5-5.8z" />
    <polygon points="9.6,15.6 15.9,12 9.6,8.4" fill="white" />
  </svg>
);

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="white" width="32" height="32">
    <polygon points="6,3 20,12 6,21" />
  </svg>
);

/* ════════════════════════════════════════════════════════════
   PROGRESS PAGE
════════════════════════════════════════════════════════════ */
const Progress = () => {
  const { subjects, getDailyProgress } = useStudent();
  const [progress, setProgress] = useState({});
  const [pageLoading, setPageLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    const load = async () => {
      const data = await getDailyProgress();
      setProgress(data);
      setPageLoading(false);
    };
    load();
  }, []);

  if (pageLoading) return <Loader text="Loading Progress..." />;

  /* ── Derived values ── */
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

  /* ── YouTube section ── */
  const ytSubjects = subjects.filter((s) => YOUTUBE_RESOURCES[s.id]);
  const availableTags = [
    "All",
    ...new Set(ytSubjects.map((s) => YOUTUBE_RESOURCES[s.id].tag)),
  ];
  const filteredYT =
    activeFilter === "All"
      ? ytSubjects
      : ytSubjects.filter((s) => YOUTUBE_RESOURCES[s.id].tag === activeFilter);

  return (
    <div className="progress-container">
      {/* ── Header ── */}
      <div className="progress-header-section">
        <h1>Study Progress</h1>
        <p className="progress-subtitle">Your daily learning overview</p>
      </div>

      {/* ── Overall Row ── */}
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

      {/* ── Subject Breakdown ── */}
      <h2 className="subjects-heading">Subject Breakdown</h2>
      <div className="subject-progress">
        {subjects.map((sub) => {
          const studied = progress[sub.id]?.studied || 0;
          const goal = sub.dailyGoalMinutes;
          const percent = Math.min((studied / goal) * 100, 100);
          const completed = studied >= goal;
          return (
            <div
              key={sub.id}
              className={`progress-card ${completed ? "progress-card-done" : ""}`}
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

      {/* ── Learn · Watch · Progress ── */}
      {ytSubjects.length > 0 && (
        <div className="lwp-section">
          <div className="lwp-header">
            <div className="lwp-title-row">
              <div className="lwp-yt-badge">
                <YTLogo />
              </div>
              <div>
                <h2 className="lwp-heading">
                  Learn &middot; Watch &middot; Progress
                </h2>
                <p className="lwp-subtitle">
                  Curated YouTube videos and playlists — click any card to watch
                </p>
              </div>
            </div>

            {availableTags.length > 2 && (
              <div className="lwp-filters">
                {availableTags.map((tag) => (
                  <button
                    key={tag}
                    className={`lwp-filter-btn ${activeFilter === tag ? "lwp-filter-active" : ""}`}
                    onClick={() => setActiveFilter(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="lwp-grid">
            {filteredYT.map((sub) => {
              const res = YOUTUBE_RESOURCES[sub.id];
              return (
                <a
                  key={sub.id}
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="lwp-card"
                >
                  <div className="lwp-thumb-wrap">
                    <img
                      src={res.thumb}
                      alt={res.title}
                      className="lwp-thumb"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src =
                          "https://img.youtube.com/vi/default/hqdefault.jpg";
                      }}
                    />
                    <div className="lwp-overlay" />
                    <div className="lwp-play-btn">
                      <PlayIcon />
                    </div>
                    <span className="lwp-duration-pill">🕐 {res.duration}</span>
                    <span className="lwp-type-pill">
                      {res.type === "playlist" ? "▶ Playlist" : "▶ Video"}
                    </span>
                  </div>
                  <div className="lwp-info">
                    <span className="lwp-subject-tag">{sub.name}</span>
                    <h3 className="lwp-card-title">{res.title}</h3>
                    <p className="lwp-channel">📺 {res.channel}</p>
                    <div className="lwp-watch-row">
                      <span className="lwp-watch-btn">Watch on YouTube →</span>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>

          <p className="lwp-note">
            ℹ️ Student Now Watch and Learn From YouTube and Maintain Your
            Discipline with Consistent Study Habits.
          </p>
        </div>
      )}
    </div>
  );
};

export default Progress;
