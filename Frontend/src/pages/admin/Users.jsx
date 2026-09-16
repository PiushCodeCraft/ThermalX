import React, { useMemo, useState } from "react";
import {
  Search,
  UserPlus,
  Shield,
  User,
  MoreVertical,
} from "lucide-react";

import "./Users.css";

const Users = () => {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const users = [
    {
      id: "USR-001",
      name: "Admin User",
      email: "admin@thermalx.in",
      role: "Admin",
      status: "Active",
      lastActive: "Just now",
    },
    {
      id: "USR-002",
      name: "Rahul Sharma",
      email: "rahul@example.com",
      role: "User",
      status: "Active",
      lastActive: "5 min ago",
    },
    {
      id: "USR-003",
      name: "Priya Singh",
      email: "priya@example.com",
      role: "User",
      status: "Active",
      lastActive: "18 min ago",
    },
    {
      id: "USR-004",
      name: "Arjun Kumar",
      email: "arjun@example.com",
      role: "User",
      status: "Inactive",
      lastActive: "2 hours ago",
    },
    {
      id: "USR-005",
      name: "Neha Patel",
      email: "neha@example.com",
      role: "User",
      status: "Active",
      lastActive: "1 hour ago",
    },
  ];

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const query = search.toLowerCase();

      const matchesSearch =
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.id.toLowerCase().includes(query);

      const matchesRole =
        roleFilter === "All" ||
        user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [search, roleFilter]);

  return (
    <div className="tx-users">

      {/* HEADER */}

      <header className="tx-users-header">

        <div>
          <span className="tx-users-eyebrow">
            THERMAL-X / ADMINISTRATION
          </span>

          <h1>Users</h1>

          <p>
            Manage registered users and account
            access.
          </p>
        </div>

        <button
          type="button"
          className="tx-users-add-button"
        >
          <UserPlus size={16} />
          ADD USER
        </button>

      </header>


      {/* SUMMARY */}

      <section className="tx-users-summary">

        <div className="tx-users-summary-card">

          <div className="tx-users-summary-icon">
            <User size={18} />
          </div>

          <div>
            <span>Total Users</span>
            <strong>1,248</strong>
          </div>

        </div>


        <div className="tx-users-summary-card">

          <div className="tx-users-summary-icon">
            <Shield size={18} />
          </div>

          <div>
            <span>Administrators</span>
            <strong>4</strong>
          </div>

        </div>


        <div className="tx-users-summary-card">

          <div className="tx-users-summary-icon">
            <User size={18} />
          </div>

          <div>
            <span>Active Users</span>
            <strong>1,197</strong>
          </div>

        </div>

      </section>


      {/* USER TABLE */}

      <section className="tx-users-card">

        <div className="tx-users-card-header">

          <div>
            <span className="tx-users-card-eyebrow">
              USER MANAGEMENT
            </span>

            <h2>Registered Users</h2>
          </div>

          <span className="tx-users-count">
            {filteredUsers.length} shown
          </span>

        </div>


        {/* FILTERS */}

        <div className="tx-users-filters">

          <div className="tx-users-search">

            <Search size={15} />

            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

          </div>


          <select
            className="tx-users-role-filter"
            value={roleFilter}
            onChange={(event) =>
              setRoleFilter(event.target.value)
            }
          >
            <option value="All">
              All Roles
            </option>

            <option value="Admin">
              Admin
            </option>

            <option value="User">
              User
            </option>
          </select>

        </div>


        {/* TABLE */}

        <div className="tx-users-table-wrapper">

          <table className="tx-users-table">

            <thead>
              <tr>
                <th>USER</th>
                <th>USER ID</th>
                <th>ROLE</th>
                <th>STATUS</th>
                <th>LAST ACTIVE</th>
                <th>ACTION</th>
              </tr>
            </thead>

            <tbody>

              {filteredUsers.map((user) => (

                <tr key={user.id}>

                  <td>

                    <div className="tx-user-profile">

                      <div className="tx-user-avatar">
                        {user.name
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>
                        <strong>
                          {user.name}
                        </strong>

                        <span>
                          {user.email}
                        </span>
                      </div>

                    </div>

                  </td>


                  <td>
                    <span className="tx-user-id">
                      {user.id}
                    </span>
                  </td>


                  <td>

                    <span
                      className={`tx-user-role ${
                        user.role.toLowerCase()
                      }`}
                    >
                      {user.role}
                    </span>

                  </td>


                  <td>

                    <span
                      className={`tx-user-status ${
                        user.status.toLowerCase()
                      }`}
                    >
                      <span />
                      {user.status}
                    </span>

                  </td>


                  <td>
                    {user.lastActive}
                  </td>


                  <td>

                    <button
                      type="button"
                      className="tx-user-action"
                      aria-label={`Actions for ${user.name}`}
                    >
                      <MoreVertical size={16} />
                    </button>

                  </td>

                </tr>

              ))}


              {filteredUsers.length === 0 && (

                <tr>
                  <td
                    colSpan="6"
                    className="tx-users-empty"
                  >
                    No users found.
                  </td>
                </tr>

              )}

            </tbody>

          </table>

        </div>

      </section>

    </div>
  );
};

export default Users;