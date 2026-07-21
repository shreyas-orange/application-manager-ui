import {
  useMemo,
  useState,
} from "react";

import { useUsers } from "../hooks/useUsers";

import "../styles/users.css";

export default function UsersPage() {
  const [searchInput, setSearchInput] =
    useState("");

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const pageSize = 10;

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useUsers({
    page,
    pageSize,
    search,
  });

  const users = data?.items ?? [];
  const total = data?.total ?? 0;

  const totalPages = useMemo(() => {
    return Math.max(
      1,
      Math.ceil(total / pageSize),
    );
  }, [total]);

  const handleSearch = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setPage(1);
    setSearch(searchInput.trim());
  };

  const formatDate = (
    value?: string,
  ) => {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="list-state">
        Loading users...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="list-state list-state--error">
        <h2>Unable to load users</h2>

        <p>
          {error instanceof Error
            ? error.message
            : "Something went wrong"}
        </p>

        <button
          type="button"
          onClick={() => {
            void refetch();
          }}
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <section className="users-page">
      <div className="list-page-header">

        <button
          type="button"
          className="secondary-button"
          disabled={isFetching}
          onClick={() => {
            void refetch();
          }}
        >
          {isFetching
            ? "Refreshing..."
            : "Refresh"}
        </button>
      </div>

      <div className="list-toolbar">
        <form
          className="list-search-form"
          onSubmit={handleSearch}
        >
          <input
            type="search"
            value={searchInput}
            placeholder="Search by name or email"
            onChange={(event) => {
              setSearchInput(
                event.target.value,
              );
            }}
          />

          <button type="submit">
            Search
          </button>

          {search && (
            <button
              type="button"
              className="clear-button"
              onClick={() => {
                setSearchInput("");
                setSearch("");
                setPage(1);
              }}
            >
              Clear
            </button>
          )}
        </form>

        <span className="list-count">
          {total} user{total === 1 ? "" : "s"}
        </span>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>

          <tbody>
            {users.length === 0 ? (
                <tr>
                <td
                    colSpan={6}
                    className="empty-table-cell"
                >
                    No users found.
                </td>
                </tr>
            ) : (
                users.map((user) => {
                const fullName =
                    `${user.first_name ?? ""} ${
                    user.last_name ?? ""
                    }`.trim() || "Unnamed user";

                return (
                    <tr key={user.id}>
                    <td>{user.id}</td>

                    <td>
                        <div className="user-cell">
                        <div className="user-avatar">
                            {user.first_name
                            ?.charAt(0)
                            .toUpperCase() || "U"}
                        </div>

                        <span>{fullName}</span>
                        </div>
                    </td>

                    <td>{user.email}</td>

                    <td>
                        <span className="role-badge">
                        {user.role?.name ?? "No role"}
                        </span>
                    </td>

                    <td>
                        <span
                        className={
                            user.is_active
                            ? "status-badge status-badge--active"
                            : "status-badge status-badge--inactive"
                        }
                        >
                        {user.is_active
                            ? "Active"
                            : "Inactive"}
                        </span>
                    </td>

                    <td>
                        {new Date(
                        user.created_at,
                        ).toLocaleDateString()}
                    </td>
                    </tr>
                );
                })
            )}
            </tbody>
        </table>
      </div>

      <div className="pagination">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => {
            setPage((current) =>
              Math.max(1, current - 1),
            );
          }}
        >
          Previous
        </button>

        <span>
          Page {page} of {totalPages}
        </span>

        <button
          type="button"
          disabled={
            page >= totalPages ||
            users.length === 0
          }
          onClick={() => {
            setPage((current) =>
              Math.min(
                totalPages,
                current + 1,
              ),
            );
          }}
        >
          Next
        </button>
      </div>
    </section>
  );
}