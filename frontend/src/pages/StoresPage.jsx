/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import ChangePassword from "../components/ChangePassword";

const StoresPage = () => {
  const { user, logout } = useAuth();

  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState("");
  const [ratings, setRatings] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sort, setSort] = useState({ sortBy: "name", sortOrder: "ASC" });

  const sortIndicator = (column) =>
    sort.sortBy === column ? (sort.sortOrder === "ASC" ? " ▲" : " ▼") : "";

  const fetchStores = async (searchValue = "", sortState = sort) => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/stores", {
        params: {
          search: searchValue,
          sortBy: sortState.sortBy,
          sortOrder: sortState.sortOrder
        }
      });

      setStores(response.data.stores);

      const existingRatings = {};

      response.data.stores.forEach((store) => {
        existingRatings[store.id] =
          store.userRating !== null ? store.userRating : "";
      });

      setRatings(existingRatings);
    } catch (apiError) {
      setError(
        apiError.response?.data?.message ||
          "Unable to fetch stores."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStores();
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    setMessage("");
    fetchStores(search, sort);
  };

  const handleSortToggle = (column) => {
    const nextOrder = sort.sortBy === column && sort.sortOrder === "ASC" ? "DESC" : "ASC";
    const nextSort = { sortBy: column, sortOrder: nextOrder };
    setSort(nextSort);
    fetchStores(search, nextSort);
  };

  const handleRatingChange = (storeId, value) => {
    setRatings((previousRatings) => ({
      ...previousRatings,
      [storeId]: value
    }));
  };

  const handleSaveRating = async (store) => {
    const rating = Number(ratings[store.id]);

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      setError("Please select a rating from 1 to 5.");
      return;
    }

    try {
      setError("");
      setMessage("");

      const method = store.userRating === null ? "post" : "put";

      const response = await api[method](
        `/stores/${store.id}/rating`,
        { rating }
      );

      setMessage(response.data.message);
      fetchStores(search, sort);
    } catch (apiError) {
      setError(
        apiError.response?.data?.message ||
          "Unable to save rating."
      );
    }
  };

  return (
    <main className="dashboard-page">
      <header className="topbar">
        <div>
          <p className="eyebrow">NORMAL USER PORTAL</p>
          <h1>Explore stores</h1>
        </div>

        <div className="topbar-actions">
          <span>Hello, {user?.name}</span>

          <button
            type="button"
            className="secondary-button"
            onClick={logout}
          >
            Log out
          </button>
        </div>
      </header>

      <section className="content-card">
        <div className="section-heading">
          <h2>Registered Stores</h2>
          <p>Search a store and submit or update your rating.</p>
        </div>

        <form className="search-bar" onSubmit={handleSearch}>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by store name or address"
          />

          <button type="submit">Search</button>

          <button
            type="button"
            className="secondary-button"
            onClick={() => {
              setSearch("");
              setMessage("");
              fetchStores("", sort);
            }}
          >
            Clear
          </button>
        </form>

        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}

        {loading ? (
          <p className="status-message">Loading stores...</p>
        ) : stores.length === 0 ? (
          <p className="status-message">No stores found.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th style={{ cursor: "pointer" }} onClick={() => handleSortToggle("name")}>
                    Store Name{sortIndicator("name")}
                  </th>
                  <th style={{ cursor: "pointer" }} onClick={() => handleSortToggle("address")}>
                    Address{sortIndicator("address")}
                  </th>
                  <th
                    style={{ cursor: "pointer" }}
                    onClick={() => handleSortToggle("overallRating")}
                  >
                    Overall Rating{sortIndicator("overallRating")}
                  </th>
                  <th>Your Rating</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {stores.map((store) => (
                  <tr key={store.id}>
                    <td>{store.name}</td>
                    <td>{store.address}</td>
                    <td>
                      {store.overallRating
                        ? `${store.overallRating} / 5`
                        : "No ratings yet"}
                    </td>
                    <td>
                      <select
                        value={ratings[store.id] ?? ""}
                        onChange={(event) =>
                          handleRatingChange(store.id, event.target.value)
                        }
                      >
                        <option value="">Select</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                      </select>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="small-button"
                        onClick={() => handleSaveRating(store)}
                      >
                        {store.userRating === null
                          ? "Submit Rating"
                          : "Update Rating"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <ChangePassword />
    </main>
  );
};

export default StoresPage;