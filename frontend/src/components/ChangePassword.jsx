import { useState } from "react";
import api from "../api/api";

const labelStyle = { display: "block", marginBottom: 6, fontSize: "0.9rem" };

const ChangePassword = () => {
  const [expanded, setExpanded] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.put("/auth/change-password", {
        currentPassword,
        newPassword
      });

      setMessage(response.data.message || "Password updated successfully.");
      resetForm();
    } catch (apiError) {
      setError(
        apiError.response?.data?.message || "Unable to update password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="content-card" style={{ marginTop: 24 }}>
      <div
        className="section-heading"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12
        }}
      >
        <div>
          <h2>Change Password</h2>
          <p>Update the password for your account.</p>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={() => {
            setExpanded((previous) => !previous);
            setError("");
            setMessage("");
            resetForm();
          }}
        >
          {expanded ? "Cancel" : "Change Password"}
        </button>
      </div>

      {expanded && (
        <>
          {error && <p className="error-message">{error}</p>}
          {message && <p className="success-message">{message}</p>}

          <form onSubmit={handleSubmit} style={{ maxWidth: 420 }}>
            <label>
              <span style={labelStyle}>Current Password</span>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </label>

            <label>
              <span style={labelStyle}>
                New Password (8-16 chars, 1 uppercase, 1 special character)
              </span>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={8}
                maxLength={16}
                required
              />
            </label>

            <label>
              <span style={labelStyle}>Confirm New Password</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={8}
                maxLength={16}
                required
              />
            </label>

            <button
              type="submit"
              className="primary-button"
              disabled={loading}
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </>
      )}
    </section>
  );
};

export default ChangePassword;
