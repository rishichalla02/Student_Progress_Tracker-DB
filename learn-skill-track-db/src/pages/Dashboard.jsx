import { useEffect, useState } from "react";
import { useStudent } from "../context/StudentContext";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import "../style/dashboard.css";

const Dashboard = () => {
  const { subjects, profile, getDailyProgress, getWeeklyHistory } =
    useStudent();
  const [progress, setProgress] = useState({});
  const [weeklyData, setWeeklyData] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Load daily progress from Firestore
  useEffect(() => {
    const load = async () => {
      const data = await getDailyProgress();
      setProgress(data);
    };
    load();
  }, []);

  // Load weekly history from Firestore
  useEffect(() => {
    const loadWeekly = async () => {
      const history = await getWeeklyHistory();
      const weekData = [];
      const todayDate = new Date();
      const dayOfWeek = todayDate.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(todayDate);
      monday.setDate(todayDate.getDate() + mondayOffset);

      for (let i = 0; i < 7; i++) {
        const day = new Date(monday);
        day.setDate(monday.getDate() + i);
        const dateKey = day.toISOString().split("T")[0];
        const label = day.toLocaleDateString("en-US", { weekday: "short" });
        weekData.push({ label, minutes: history[dateKey] || 0 });
      }
      setWeeklyData(weekData);
    };

    loadWeekly();
    const interval = setInterval(loadWeekly, 30000);
    return () => clearInterval(interval);
  }, []);

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const totalSubjects = subjects.length;
  const totalGoalMinutes = subjects.reduce(
    (sum, s) => sum + s.dailyGoalMinutes,
    0,
  );
  const totalStudiedMinutes = subjects.reduce(
    (sum, s) => sum + (progress[s.id]?.studied || 0),
    0,
  );
  const completedTasks = subjects.filter((s) => {
    const studied = progress[s.id]?.studied || 0;
    return studied >= s.dailyGoalMinutes;
  }).length;
  const remainingMinutes = Math.max(totalGoalMinutes - totalStudiedMinutes, 0);
  const pieData = [
    { name: "Studied", value: totalStudiedMinutes },
    { name: "Remaining", value: remainingMinutes || 1 },
  ];
  const COLORS = ["#6366f1", "#e2e8f0"];

  const hour = currentTime.getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const formattedDate = currentTime.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const maxWeekly = Math.max(...weeklyData.map((d) => d.minutes), 1);

  return (
    <div className="dashboard-container">
      {/* Greeting */}
      <div className="dashboard-greeting">
        <div className="greeting-left">
          <h2>
            {greeting},{" "}
            <span className="greeting-name">
              {profile?.firstName || "Student"}
            </span>{" "}
            👋
          </h2>
          <p className="motivation-line">
            Keep pushing — every minute counts towards your goal.
          </p>
          <p className="date-time">
            {formattedDate} &nbsp;|&nbsp; {formattedTime}
          </p>
        </div>
        <div className="greeting-badge">
          <span>
            {completedTasks}/{totalSubjects}
          </span>
          <small>tasks done</small>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card card-blue">
          <div className="stat-icon">📚</div>
          <div>
            <h3>Total Subjects</h3>
            <p>{totalSubjects}</p>
          </div>
        </div>
        <div className="stat-card card-green">
          <div className="stat-icon">✅</div>
          <div>
            <h3>Completed Tasks</h3>
            <p>{completedTasks}</p>
          </div>
        </div>
        <div className="stat-card card-purple">
          <div className="stat-icon">⏱️</div>
          <div>
            <h3>Minutes Studied</h3>
            <p>{totalStudiedMinutes}</p>
          </div>
        </div>
        <div className="stat-card card-orange">
          <div className="stat-icon">🎯</div>
          <div>
            <h3>Daily Goal</h3>
            <p>{totalGoalMinutes} min</p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="charts-row">
        {/* Pie Chart */}
        <div className="chart-card">
          <h2>Daily Completion</h2>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="center-text">
              {totalGoalMinutes > 0
                ? Math.round((totalStudiedMinutes / totalGoalMinutes) * 100)
                : 0}
              %
            </div>
          </div>
          <div className="chart-legend">
            <span>
              <i className="dot dot-studied"></i>Studied
            </span>
            <span>
              <i className="dot dot-remaining"></i>Remaining
            </span>
          </div>
        </div>

        {/* Weekly Bar Chart */}
        <div className="chart-card">
          <h2>Weekly Study Analytics</h2>
          <div className="weekly-chart">
            {weeklyData.map((day, index) => (
              <div className="weekly-bar-wrapper" key={index}>
                <span className="weekly-mins">
                  {day.minutes > 0 ? `${day.minutes}m` : ""}
                </span>
                <div className="weekly-bar-bg">
                  <div
                    className="weekly-bar-fill"
                    style={{ height: `${(day.minutes / maxWeekly) * 100}%` }}
                  />
                </div>
                <span className="weekly-label">{day.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Goal Planner */}
      <div className="goal-card">
        <div className="goal-header">
          <h2>Daily Goal Progress</h2>
          <span className="goal-count">
            {completedTasks} of {totalSubjects} complete
          </span>
        </div>
        <div className="goal-progress">
          <div
            className="goal-fill"
            style={{
              width: `${totalGoalMinutes > 0 ? (totalStudiedMinutes / totalGoalMinutes) * 100 : 0}%`,
            }}
          />
        </div>
        <div className="goal-stats">
          <span>{totalStudiedMinutes} min studied</span>
          <span>{remainingMinutes} min remaining</span>
        </div>
      </div>

      {/* Calendar */}
      <div className="calendar-card">
        <h2>Calendar View</h2>
        <div className="calendar-days-header">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="calendar-grid">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className={`calendar-day ${i === new Date().getDate() - 1 ? "today" : ""}`}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
