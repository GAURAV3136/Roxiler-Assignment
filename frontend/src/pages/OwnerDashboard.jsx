import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ChangePassword from "../components/ChangePassword";

const sortRows = (rows, key, direction) => {
  if (!key) return rows;

  return [...rows].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;

    if (typeof aVal === "number" && typeof bVal === "number") {
      return direction === "asc" ? aVal - bVal : bVal - aVal;
    }

    return direction === "asc"
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });
};

const sortIndicator = (sort, column) =>
  sort.key === column ? (sort.direction === "asc" ? " ▲" : " ▼") : "";

const OwnerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [stores, setStores] = useState([]);
  const [ratingsSummary, setRatingsSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [storeSort, setStoreSort] = useState({ key: null, direction: "asc" });
  const [ratingSort, setRatingSort] = useState({ key: null, direction: "asc" });

  const toggleStoreSort = (key) => {
    setStoreSort((previous) => ({
      key,
      direction: previous.key === key && previous.direction === "asc" ? "desc" : "asc"
    }));
  };

  const toggleRatingSort = (key) => {
    setRatingSort((previous) => ({
      key,
      direction: previous.key === key && previous.direction === "asc" ? "desc" : "asc"
    }));
  };

  const sortedStores = useMemo(
    () => sortRows(stores, storeSort.key, storeSort.direction),
    [stores, storeSort]
  );

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/owner/dashboard", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("Non-OK response:", res.status, errText);
        throw new Error(`Request failed with status ${res.status}`);
      }

      const data = await res.json();

      setStores(data.stores || []);
      setRatingsSummary(data.ratingsSummary || []);
    } catch (err) {
      console.error("Dashboard error:", err);
      setError(err.message || "Unable to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDashboard();
  }, []);

  return (
    <main className="dashboard-page">
      <header className="topbar">
        <div>
          <p className="eyebrow">STORE OWNER PORTAL</p>
          <h1>Owner Dashboard</h1>
        </div>

        <div className="topbar-actions">
          <div style={{ textAlign: "right" }}>
            <div>Hello, {user?.name}</div>
            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                logout();
                navigate("/login");
              }}
              style={{ marginTop: 4 }}
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <section className="content-card">
        <div className="section-heading">
          <h2>Your Stores</h2>
          <p>Stores registered under your account.</p>
        </div>

        {error && <p className="error-message">{error}</p>}

        {loading ? (
          <p className="status-message">Loading dashboard...</p>
        ) : stores.length === 0 ? (
          <p className="status-message">
            No stores found for your account. Please add stores from admin panel.
          </p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th style={{ cursor: "pointer" }} onClick={() => toggleStoreSort("name")}>
                    Store Name{sortIndicator(storeSort, "name")}
                  </th>
                  <th style={{ cursor: "pointer" }} onClick={() => toggleStoreSort("address")}>
                    Address{sortIndicator(storeSort, "address")}
                  </th>
                  <th style={{ cursor: "pointer" }} onClick={() => toggleStoreSort("email")}>
                    Email{sortIndicator(storeSort, "email")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedStores.map((store) => (
                  <tr key={store.id}>
                    <td>{store.name}</td>
                    <td>{store.address}</td>
                    <td>{store.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="content-card" style={{ marginTop: 24 }}>
        <div className="section-heading">
          <h2>Ratings Received</h2>
          <p>Users who have rated your stores.</p>
        </div>

        {ratingsSummary.length === 0 ? (
          <p className="status-message">No ratings received yet.</p>
        ) : (
          ratingsSummary.map((summary) => (
            <div key={summary.storeId} style={{ marginBottom: 24 }}>
              <h3>{summary.storeName}</h3>

              {summary.ratings.length === 0 ? (
                <p className="status-message">No ratings yet for this store.</p>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th
                          style={{ cursor: "pointer" }}
                          onClick={() => toggleRatingSort("userName")}
                        >
                          User Name{sortIndicator(ratingSort, "userName")}
                        </th>
                        <th
                          style={{ cursor: "pointer" }}
                          onClick={() => toggleRatingSort("userEmail")}
                        >
                          Email{sortIndicator(ratingSort, "userEmail")}
                        </th>
                        <th
                          style={{ cursor: "pointer" }}
                          onClick={() => toggleRatingSort("rating")}
                        >
                          Rating{sortIndicator(ratingSort, "rating")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortRows(summary.ratings, ratingSort.key, ratingSort.direction).map(
                        (r, idx) => (
                          <tr key={idx}>
                            <td>{r.userName}</td>
                            <td>{r.userEmail}</td>
                            <td>{r.rating} / 5</td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))
        )}
      </section>

      <ChangePassword />
    </main>
  );
};

export default OwnerDashboard;