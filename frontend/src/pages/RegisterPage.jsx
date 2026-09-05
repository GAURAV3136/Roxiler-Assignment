import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";

const RegisterPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/register", {
        name,
        email,
        password,
        address
      });

      login(response.data.token, response.data.user);
      navigate("/");
    } catch (apiError) {
      setError(
        apiError.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="section-heading">
          <h2>Create your account</h2>
          <p>Join the store rating platform</p>
        </div>

        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmit}>
          <label>
            <span style={{ display: "block", marginBottom: 6, fontSize: "0.9rem" }}>
              Name (20-60 characters)
            </span>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your full name"
              minLength={20}
              maxLength={60}
              required
            />
          </label>

          <label>
            <span style={{ display: "block", marginBottom: 6, fontSize: "0.9rem" }}>
              Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>

          <label>
            <span style={{ display: "block", marginBottom: 6, fontSize: "0.9rem" }}>
              Password (8-16 chars, 1 uppercase, 1 special character)
            </span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="e.g. Passw0rd!"
              minLength={8}
              maxLength={16}
              required
            />
          </label>

          <label>
            <span style={{ display: "block", marginBottom: 6, fontSize: "0.9rem" }}>
              Address (max 400 characters)
            </span>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Your address"
              maxLength={400}
              required
            />
          </label>

          <button
            type="submit"
            className="primary-button"
            disabled={loading}
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className="auth-links">
          Already have an account?{" "}
          <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;