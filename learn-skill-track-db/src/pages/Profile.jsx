import { useEffect, useState } from "react";
import { useStudent } from "../context/StudentContext";
import InputField from "../components/form/InputField";
import Button from "../components/ui/Button";
import Loader from "../components/ui/Loader";
import "../style/profile.css";

const Profile = () => {
  const { profile, updateProfile } = useStudent();
  const [localProfile, setLocalProfile] = useState(null);
  const [originalProfile, setOriginalProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setLocalProfile(profile);
      setOriginalProfile(profile);
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    await updateProfile(localProfile);
    setOriginalProfile(localProfile);
    setIsEditing(false);
    setSaving(false);
    setMessage("Profile updated successfully ✅");
    setTimeout(() => setMessage(""), 3000);
  };

  const handleCancel = () => {
    setLocalProfile(originalProfile);
    setIsEditing(false);
  };

  if (!localProfile) return <Loader text="Loading Profile..." />;

  return (
    <div className="profile-container">
      <div className="profile-header-section">
        <div className="profile-avatar">
          {localProfile.firstName?.[0]?.toUpperCase()}
          {localProfile.lastName?.[0]?.toUpperCase()}
        </div>
        <div>
          <h1>
            {localProfile.firstName} {localProfile.lastName}
          </h1>
          <p className="profile-email">{localProfile.email}</p>
          <span className="profile-type-badge">
            {localProfile.educationType}
          </span>
        </div>
      </div>

      {message && <div className="success-msg">{message}</div>}

      <div className="profile-card">
        <h2>Personal Information</h2>
        <div className="profile-grid">
          <InputField
            label="First Name"
            name="firstName"
            value={localProfile.firstName}
            onChange={handleChange}
            disabled={!isEditing}
          />
          <InputField
            label="Last Name"
            name="lastName"
            value={localProfile.lastName}
            onChange={handleChange}
            disabled={!isEditing}
          />
          <InputField
            label="Email"
            name="email"
            value={localProfile.email}
            onChange={handleChange}
            disabled={!isEditing}
          />
          <InputField
            label="Mobile"
            name="mobile"
            value={localProfile.mobile}
            onChange={handleChange}
            disabled={!isEditing}
          />
          <InputField label="Gender" value={localProfile.gender} disabled />
          <InputField
            label="Education Type"
            value={localProfile.educationType}
            disabled
          />
          <InputField label="Date of Birth" value={localProfile.dob} disabled />
        </div>

        <div className="profile-actions">
          {!isEditing ? (
            <Button variant="primary" onClick={() => setIsEditing(true)}>
              ✏️ Edit Profile
            </Button>
          ) : (
            <div className="edit-actions">
              <Button variant="primary" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              <Button variant="secondary" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
