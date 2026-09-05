/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";

const emptyAddUserForm = { name: "", email: "", address: "", password: "", role: "USER" };
const emptyAddStoreForm = { name: "", email: "", address: "", ownerId: "" };
const emptyUserFilters = { name: "", email: "", address: "", role: "" };
const emptyStoreFilters = { name: "", email: "", address: "" };

const labelStyle = { display: "block", marginBottom: 6, fontSize: "0.9rem" };

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview");

  // Stats
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState("");

  // Users list
  const [users, setUsers] = useState([]);
  const [userFilters, setUserFilters] = useState(emptyUserFilters);
  const [userSort, setUserSort] = useState({ sortBy: "name", sortOrder: "ASC" });
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");

  // Stores list
  const [stores, setStores] = useState([]);
  const [storeFilters, setStoreFilters] = useState(emptyStoreFilters);
  const [storeSort, setStoreSort] = useState({ sortBy: "name", sortOrder: "ASC" });
  const [storesLoading, setStoresLoading] = useState(false);
  const [storesError, setStoresError] = useState("");

  // Add user form
  const [addUserForm, setAddUserForm] = useState(emptyAddUserForm);
  const [addUserError, setAddUserError] = useState("");
  const [addUserMessage, setAddUserMessage] = useState("");
  const [addUserLoading, setAddUserLoading] = useState(false);

  // Add store form
  const [addStoreForm, setAddStoreForm] = useState(emptyAddStoreForm);
  const [addStoreError, setAddStoreError] = useState("");
  const [addStoreMessage, setAddStoreMessage] = useState("");
  const [addStoreLoading, setAddStoreLoading] = useState(false);
  const [owners, setOwners] = useState([]);

  // User detail view
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserLoading, setSelectedUserLoading] = useState(false);
  const [selectedUserError, setSelectedUserError] = useState("");

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      setStatsError("");
      const response = await api.get("/admin/dashboard");
      setStats(response.data.stats);
    } catch (apiError) {
      setStatsError(
        apiError.response?.data?.message || "Unable to fetch dashboard statistics."
      );
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchUsers = async (filters = userFilters, sort = userSort) => {
    try {
      setUsersLoading(true);
      setUsersError("");
      const response = await api.get("/admin/users", { params: { ...filters, ...sort } });
      setUsers(response.data.users);
    } catch (apiError) {
      setUsersError(apiError.response?.data?.message || "Unable to fetch users.");
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchStores = async (filters = storeFilters, sort = storeSort) => {
    try {
      setStoresLoading(true);
      setStoresError("");
      const response = await api.get("/admin/stores", { params: { ...filters, ...sort } });
      setStores(response.data.stores);
    } catch (apiError) {
      setStoresError(apiError.response?.data?.message || "Unable to fetch stores.");
    } finally {
      setStoresLoading(false);
    }
  };

  const fetchOwners = async () => {
    try {
      const response = await api.get("/admin/users", { params: { role: "OWNER" } });
      setOwners(response.data.users);
    } catch {
      setOwners([]);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStats();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers(emptyUserFilters, userSort);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStores(emptyStoreFilters, storeSort);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOwners();
  }, []);

  const handleUserFilterChange = (field, value) => {
    setUserFilters((previous) => ({ ...previous, [field]: value }));
  };

  const handleStoreFilterChange = (field, value) => {
    setStoreFilters((previous) => ({ ...previous, [field]: value }));
  };

  const handleUserFilterSubmit = (event) => {
    event.preventDefault();
    fetchUsers(userFilters, userSort);
  };

  const handleStoreFilterSubmit = (event) => {
    event.preventDefault();
    fetchStores(storeFilters, storeSort);
  };

  const handleUserSortToggle = (column) => {
    const nextOrder = userSort.sortBy === column && userSort.sortOrder === "ASC" ? "DESC" : "ASC";
    const nextSort = { sortBy: column, sortOrder: nextOrder };
    setUserSort(nextSort);
    fetchUsers(userFilters, nextSort);
  };

  const handleStoreSortToggle = (column) => {
    const nextOrder = storeSort.sortBy === column && storeSort.sortOrder === "ASC" ? "DESC" : "ASC";
    const nextSort = { sortBy: column, sortOrder: nextOrder };
    setStoreSort(nextSort);
    fetchStores(storeFilters, nextSort);
  };

  const handleAddUserChange = (field, value) => {
    setAddUserForm((previous) => ({ ...previous, [field]: value }));
  };

  const handleAddUserSubmit = async (event) => {
    event.preventDefault();
    setAddUserError("");
    setAddUserMessage("");

    const trimmedName = addUserForm.name.trim();
    if (trimmedName.length < 20 || trimmedName.length > 60) {
      setAddUserError("Name must be between 20 and 60 characters.");
      return;
    }

    try {
      setAddUserLoading(true);
      const response = await api.post("/admin/users", addUserForm);
      setAddUserMessage(response.data.message || "User created successfully.");
      setAddUserForm(emptyAddUserForm);
      fetchStats();
      fetchUsers();
      if (addUserForm.role === "OWNER") {
        fetchOwners();
      }
    } catch (apiError) {
      setAddUserError(apiError.response?.data?.message || "Unable to create user.");
    } finally {
      setAddUserLoading(false);
    }
  };

  const handleAddStoreChange = (field, value) => {
    setAddStoreForm((previous) => ({ ...previous, [field]: value }));
  };

  const handleAddStoreSubmit = async (event) => {
    event.preventDefault();
    setAddStoreError("");
    setAddStoreMessage("");

    if (!addStoreForm.ownerId) {
      setAddStoreError("Please select a store owner.");
      return;
    }

    try {
      setAddStoreLoading(true);
      const response = await api.post("/admin/stores", addStoreForm);
      setAddStoreMessage(response.data.message || "Store created successfully.");
      setAddStoreForm(emptyAddStoreForm);
      fetchStats();
      fetchStores();
    } catch (apiError) {
      setAddStoreError(apiError.response?.data?.message || "Unable to create store.");
    } finally {
      setAddStoreLoading(false);
    }
  };

  const handleViewUser = async (userId) => {
    try {
      setSelectedUserLoading(true);
      setSelectedUserError("");
      setSelectedUser(null);
      const response = await api.get(`/admin/users/${userId}`);
      setSelectedUser(response.data.user);
    } catch (apiError) {
      setSelectedUserError(
        apiError.response?.data?.message || "Unable to fetch user details."
      );
    } finally {
      setSelectedUserLoading(false);
    }
  };

  const sortIndicator = (sort, column) =>
    sort.sortBy === column ? (sort.sortOrder === "ASC" ? " ▲" : " ▼") : "";

  return (
    <main className="dashboard-page">
      <header className="topbar">
        <div>
          <p className="eyebrow">SYSTEM ADMINISTRATOR</p>
          <h1>Admin Dashboard</h1>
        </div>

        <div className="topbar-actions">
          <span>Hello, {user?.name}</span>
          <button
            type="button"
            className="secondary-button"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            Log out
          </button>
        </div>
      </header>

      <div className="search-bar" style={{ marginBottom: 24 }}>
        {[
          ["overview", "Overview"],
          ["users", "Users"],
          ["stores", "Stores"],
          ["addUser", "+ Add User"],
          ["addStore", "+ Add Store"]
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={activeTab === key ? "primary-button" : "secondary-button"}
            onClick={() => setActiveTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <section className="content-card">
          <div className="section-heading">
            <h2>Platform Overview</h2>
            <p>Live totals across the platform.</p>
          </div>

          {statsError && <p className="error-message">{statsError}</p>}

          {statsLoading ? (
            <p className="status-message">Loading statistics...</p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 16
              }}
            >
              <div className="content-card" style={{ textAlign: "center" }}>
                <p style={{ marginBottom: 4 }}>Total Users</p>
                <h2>{stats.totalUsers}</h2>
              </div>
              <div className="content-card" style={{ textAlign: "center" }}>
                <p style={{ marginBottom: 4 }}>Total Stores</p>
                <h2>{stats.totalStores}</h2>
              </div>
              <div className="content-card" style={{ textAlign: "center" }}>
                <p style={{ marginBottom: 4 }}>Total Ratings Submitted</p>
                <h2>{stats.totalRatings}</h2>
              </div>
            </div>
          )}
        </section>
      )}

      {activeTab === "users" && (
        <section className="content-card">
          <div className="section-heading">
            <h2>All Users</h2>
            <p>Normal users, store owners, and admins. Filter by any field.</p>
          </div>

          <form className="search-bar" onSubmit={handleUserFilterSubmit}>
            <input
              type="text"
              placeholder="Filter by name"
              value={userFilters.name}
              onChange={(e) => handleUserFilterChange("name", e.target.value)}
            />
            <input
              type="text"
              placeholder="Filter by email"
              value={userFilters.email}
              onChange={(e) => handleUserFilterChange("email", e.target.value)}
            />
            <input
              type="text"
              placeholder="Filter by address"
              value={userFilters.address}
              onChange={(e) => handleUserFilterChange("address", e.target.value)}
            />
            <select
              value={userFilters.role}
              onChange={(e) => handleUserFilterChange("role", e.target.value)}
            >
              <option value="">All roles</option>
              <option value="ADMIN">Admin</option>
              <option value="USER">Normal User</option>
              <option value="OWNER">Store Owner</option>
            </select>
            <button type="submit">Apply Filters</button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                setUserFilters(emptyUserFilters);
                fetchUsers(emptyUserFilters, userSort);
              }}
            >
              Clear
            </button>
          </form>

          {usersError && <p className="error-message">{usersError}</p>}

          {usersLoading ? (
            <p className="status-message">Loading users...</p>
          ) : users.length === 0 ? (
            <p className="status-message">No users found.</p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th style={{ cursor: "pointer" }} onClick={() => handleUserSortToggle("name")}>
                      Name{sortIndicator(userSort, "name")}
                    </th>
                    <th style={{ cursor: "pointer" }} onClick={() => handleUserSortToggle("email")}>
                      Email{sortIndicator(userSort, "email")}
                    </th>
                    <th
                      style={{ cursor: "pointer" }}
                      onClick={() => handleUserSortToggle("address")}
                    >
                      Address{sortIndicator(userSort, "address")}
                    </th>
                    <th style={{ cursor: "pointer" }} onClick={() => handleUserSortToggle("role")}>
                      Role{sortIndicator(userSort, "role")}
                    </th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.address}</td>
                      <td>{u.role}</td>
                      <td>
                        <button
                          type="button"
                          className="small-button"
                          onClick={() => handleViewUser(u.id)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {(selectedUserLoading || selectedUser || selectedUserError) && (
            <div className="content-card" style={{ marginTop: 20 }}>
              <div className="section-heading">
                <h2>User Details</h2>
              </div>

              {selectedUserError && <p className="error-message">{selectedUserError}</p>}

              {selectedUserLoading ? (
                <p className="status-message">Loading user details...</p>
              ) : (
                selectedUser && (
                  <div>
                    <p>
                      <strong>Name:</strong> {selectedUser.name}
                    </p>
                    <p>
                      <strong>Email:</strong> {selectedUser.email}
                    </p>
                    <p>
                      <strong>Address:</strong> {selectedUser.address}
                    </p>
                    <p>
                      <strong>Role:</strong> {selectedUser.role}
                    </p>
                    {selectedUser.role === "OWNER" && (
                      <p>
                        <strong>Store Rating:</strong>{" "}
                        {selectedUser.ownedStores || "No stores assigned yet"}
                      </p>
                    )}
                    <button
                      type="button"
                      className="secondary-button"
                      style={{ marginTop: 12 }}
                      onClick={() => setSelectedUser(null)}
                    >
                      Close
                    </button>
                  </div>
                )
              )}
            </div>
          )}
        </section>
      )}

      {activeTab === "stores" && (
        <section className="content-card">
          <div className="section-heading">
            <h2>All Stores</h2>
            <p>Every registered store on the platform.</p>
          </div>

          <form className="search-bar" onSubmit={handleStoreFilterSubmit}>
            <input
              type="text"
              placeholder="Filter by name"
              value={storeFilters.name}
              onChange={(e) => handleStoreFilterChange("name", e.target.value)}
            />
            <input
              type="text"
              placeholder="Filter by email"
              value={storeFilters.email}
              onChange={(e) => handleStoreFilterChange("email", e.target.value)}
            />
            <input
              type="text"
              placeholder="Filter by address"
              value={storeFilters.address}
              onChange={(e) => handleStoreFilterChange("address", e.target.value)}
            />
            <button type="submit">Apply Filters</button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                setStoreFilters(emptyStoreFilters);
                fetchStores(emptyStoreFilters, storeSort);
              }}
            >
              Clear
            </button>
          </form>

          {storesError && <p className="error-message">{storesError}</p>}

          {storesLoading ? (
            <p className="status-message">Loading stores...</p>
          ) : stores.length === 0 ? (
            <p className="status-message">No stores found.</p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th style={{ cursor: "pointer" }} onClick={() => handleStoreSortToggle("name")}>
                      Name{sortIndicator(storeSort, "name")}
                    </th>
                    <th style={{ cursor: "pointer" }} onClick={() => handleStoreSortToggle("email")}>
                      Email{sortIndicator(storeSort, "email")}
                    </th>
                    <th
                      style={{ cursor: "pointer" }}
                      onClick={() => handleStoreSortToggle("address")}
                    >
                      Address{sortIndicator(storeSort, "address")}
                    </th>
                    <th
                      style={{ cursor: "pointer" }}
                      onClick={() => handleStoreSortToggle("overallRating")}
                    >
                      Rating{sortIndicator(storeSort, "overallRating")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stores.map((store) => (
                    <tr key={store.id}>
                      <td>{store.name}</td>
                      <td>{store.email}</td>
                      <td>{store.address}</td>
                      <td>
                        {store.overallRating ? `${store.overallRating} / 5` : "No ratings yet"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {activeTab === "addUser" && (
        <section className="content-card">
          <div className="section-heading">
            <h2>Add New User</h2>
            <p>Create a Normal User, Store Owner, or Admin account.</p>
          </div>

          {addUserError && <p className="error-message">{addUserError}</p>}
          {addUserMessage && <p className="success-message">{addUserMessage}</p>}

          <form onSubmit={handleAddUserSubmit} style={{ maxWidth: 480 }}>
            <label>
              <span style={labelStyle}>Name (20-60 characters)</span>
              <input
                type="text"
                value={addUserForm.name}
                onChange={(e) => handleAddUserChange("name", e.target.value)}
                placeholder="Full name"
                minLength={20}
                maxLength={60}
                required
              />
            </label>

            <label>
              <span style={labelStyle}>Email</span>
              <input
                type="email"
                value={addUserForm.email}
                onChange={(e) => handleAddUserChange("email", e.target.value)}
                placeholder="name@example.com"
                required
              />
            </label>

            <label>
              <span style={labelStyle}>
                Password (8-16 chars, 1 uppercase, 1 special character)
              </span>
              <input
                type="password"
                value={addUserForm.password}
                onChange={(e) => handleAddUserChange("password", e.target.value)}
                placeholder="e.g. Passw0rd!"
                minLength={8}
                maxLength={16}
                required
              />
            </label>

            <label>
              <span style={labelStyle}>Address (max 400 characters)</span>
              <input
                type="text"
                value={addUserForm.address}
                onChange={(e) => handleAddUserChange("address", e.target.value)}
                placeholder="Address"
                maxLength={400}
                required
              />
            </label>

            <label>
              <span style={labelStyle}>Role</span>
              <select
                value={addUserForm.role}
                onChange={(e) => handleAddUserChange("role", e.target.value)}
              >
                <option value="USER">Normal User</option>
                <option value="OWNER">Store Owner</option>
                <option value="ADMIN">Admin</option>
              </select>
            </label>

            <button
              type="submit"
              className="primary-button"
              disabled={addUserLoading}
              style={{ opacity: addUserLoading ? 0.7 : 1 }}
            >
              {addUserLoading ? "Creating user..." : "Create User"}
            </button>
          </form>
        </section>
      )}

      {activeTab === "addStore" && (
        <section className="content-card">
          <div className="section-heading">
            <h2>Add New Store</h2>
            <p>Register a store under an existing Store Owner account.</p>
          </div>

          {addStoreError && <p className="error-message">{addStoreError}</p>}
          {addStoreMessage && <p className="success-message">{addStoreMessage}</p>}

          {owners.length === 0 && (
            <p className="status-message">
              No Store Owner accounts exist yet. Create one from the "+ Add User" tab
              (Role: Store Owner) before adding a store.
            </p>
          )}

          <form onSubmit={handleAddStoreSubmit} style={{ maxWidth: 480 }}>
            <label>
              <span style={labelStyle}>Store Name</span>
              <input
                type="text"
                value={addStoreForm.name}
                onChange={(e) => handleAddStoreChange("name", e.target.value)}
                placeholder="Store name"
                maxLength={100}
                required
              />
            </label>

            <label>
              <span style={labelStyle}>Store Email</span>
              <input
                type="email"
                value={addStoreForm.email}
                onChange={(e) => handleAddStoreChange("email", e.target.value)}
                placeholder="store@example.com"
                required
              />
            </label>

            <label>
              <span style={labelStyle}>Store Address (max 400 characters)</span>
              <input
                type="text"
                value={addStoreForm.address}
                onChange={(e) => handleAddStoreChange("address", e.target.value)}
                placeholder="Store address"
                maxLength={400}
                required
              />
            </label>

            <label>
              <span style={labelStyle}>Store Owner</span>
              <select
                value={addStoreForm.ownerId}
                onChange={(e) => handleAddStoreChange("ownerId", e.target.value)}
                required
              >
                <option value="">Select a store owner</option>
                {owners.map((owner) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.name} ({owner.email})
                  </option>
                ))}
              </select>
            </label>

            <button
              type="submit"
              className="primary-button"
              disabled={addStoreLoading}
              style={{ opacity: addStoreLoading ? 0.7 : 1 }}
            >
              {addStoreLoading ? "Creating store..." : "Create Store"}
            </button>
          </form>
        </section>
      )}
    </main>
  );
};

export default AdminDashboard;
