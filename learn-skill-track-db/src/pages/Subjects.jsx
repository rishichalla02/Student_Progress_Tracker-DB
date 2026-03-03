import { useState } from "react";
import { useStudent } from "../context/StudentContext";
import Button from "../components/ui/Button";
import InputField from "../components/form/InputField";
import Loader from "../components/ui/Loader";
import "../style/subject.css";

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

const Subjects = () => {
  const { subjects, addSubject, deleteSubject, loading } = useStudent();

  const [name, setName] = useState("");
  const [dailyGoalMinutes, setDGM] = useState("");
  const [learnUrl, setLearnUrl] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  /* ─── URL validator (optional field — only validate if filled) ─── */
  const isValidUrl = (url) => {
    if (!url) return true; // optional
    try {
      const u = new URL(url);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleAddSubject = async () => {
    setError("");

    if (!name.trim()) {
      setError("Subject name is required.");
      return;
    }
    if (!dailyGoalMinutes || Number(dailyGoalMinutes) <= 0) {
      setError("Daily goal must be a number greater than 0.");
      return;
    }
    if (learnUrl && !isValidUrl(learnUrl)) {
      setError("Please enter a valid URL starting with http:// or https://");
      return;
    }

    setActionLoading(true);

    await addSubject({
      id: name.toLowerCase().replace(/\s+/g, "_") + "_" + Date.now(),
      name: name.trim(),
      dailyGoalMinutes: Number(dailyGoalMinutes),
      learnUrl: learnUrl.trim() || "",
      isCustom: true,
      isUserModified: true,
    });

    setName("");
    setDGM("");
    setLearnUrl("");
    setActionLoading(false);
  };

  const handleDeleteSubject = async (id) => {
    setActionLoading(true);
    await deleteSubject(id);
    setActionLoading(false);
  };

  const handleLearn = (url) => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  if (loading) return <Loader text="Loading Subjects..." />;

  return (
    <div className="subjects-container">
      {/* Header */}
      <div className="subjects-header">
        <h1>My Subjects</h1>
        <p className="subjects-subtitle">
          Manage your learning subjects, daily goals and reference links
        </p>
      </div>

      {/* ─── Add Subject Form ─── */}
      <div className="add-subject-card">
        <h2>➕ Add New Subject</h2>

        {error && <div className="subject-error">⚠ {error}</div>}

        <div className="add-subject-form">
          {/* Row 1: Name + Goal */}
          <div className="add-form-row">
            <InputField
              label="Subject Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mathematics"
            />
            <InputField
              type="number"
              label="Daily Goal (Minutes) *"
              value={dailyGoalMinutes}
              onChange={(e) => setDGM(e.target.value)}
              placeholder="e.g. 60"
            />
          </div>

          {/* Row 2: URL */}
          <div className="url-input-wrap">
            <InputField
              type="url"
              label="Learning Resource URL (optional)"
              value={learnUrl}
              onChange={(e) => setLearnUrl(e.target.value)}
              placeholder="https://example.com/learn-subject"
            />
            <p className="url-hint">
              🔗 Paste a link to any website, YouTube playlist, or course where
              you study this subject.
            </p>
          </div>

          {/* Submit button */}
          <div className="add-form-btn">
            <Button
              variant="primary"
              disabled={actionLoading}
              onClick={handleAddSubject}
            >
              {actionLoading ? "Adding..." : "Add Subject"}
            </Button>
          </div>
        </div>
      </div>

      {/* ─── Subjects List ─── */}
      <div className="subjects-list">
        <h2>All Subjects ({subjects.length})</h2>
        <div className="subjects-grid">
          {subjects.map((sub) => (
            <div
              key={sub.id}
              className={`subject-card ${sub.isCustom ? "subject-custom" : ""}`}
            >
              {/* Left: icon + info */}
              <div className="subject-card-left">
                <div className="subject-icon">{sub.name[0].toUpperCase()}</div>
                <div className="subject-info">
                  <h3>{sub.name}</h3>
                  <p className="subject-goal">
                    🎯 {sub.dailyGoalMinutes} min / day
                  </p>
                  {sub.learnUrl && (
                    <p className="subject-url-preview" title={sub.learnUrl}>
                      🔗{" "}
                      {sub.learnUrl.replace(/^https?:\/\//, "").split("/")[0]}
                    </p>
                  )}
                </div>
              </div>

              {/* Right: badges + actions */}
              <div className="subject-card-right">
                {sub.isCustom && <span className="custom-badge">Custom</span>}

                {/* Learn button */}
                <button
                  className={`learn-btn ${!sub.learnUrl ? "learn-btn-disabled" : ""}`}
                  onClick={() => handleLearn(sub.learnUrl)}
                  disabled={!sub.learnUrl}
                  title={
                    sub.learnUrl
                      ? `Open: ${sub.learnUrl}`
                      : "No learning link added"
                  }
                >
                  <ExternalLinkIcon />
                  Learn
                </button>

                {/* Delete only for custom subjects */}
                {sub.isCustom && (
                  <Button
                    variant="danger"
                    disabled={actionLoading}
                    onClick={() => handleDeleteSubject(sub.id)}
                  >
                    Delete
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Subjects;
