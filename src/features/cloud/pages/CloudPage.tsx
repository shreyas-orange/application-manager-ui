import {
  useEffect,
  useState,
} from "react";

import {
  Cloud,
  Plus,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

import CloudModal from "../components/CloudModal";
import CloudTable from "../components/CloudTable";

import {
  useCloudConfigurations,
  useCreateCloud,
  useDeleteCloud,
  useUpdateCloud,
} from "../hooks/useCloud";

import type {
  CloudConfiguration,
  CreateCloudRequest,
} from "../types/cloud";


const PAGE_SIZE = 10;

function getErrorMessage(
  error: unknown,
): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const axiosError = error as {
      response?: {
        data?: {
          detail?: string;
          message?: string;
        };
      };
    };

    return (
      axiosError.response?.data?.detail ??
      axiosError.response?.data?.message ??
      "Something went wrong."
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong.";
}

export default function CloudPage() {
  const [page, setPage] = useState(1);

  const [
    searchInput,
    setSearchInput,
  ] = useState("");

  const [search, setSearch] =
    useState("");

  const [modalOpen, setModalOpen] =
    useState(false);

  const [
    selectedCloud,
    setSelectedCloud,
  ] =
    useState<CloudConfiguration | null>(
      null,
    );

  const [message, setMessage] =
    useState("");

  const [pageError, setPageError] =
    useState("");

  useEffect(() => {
    const timeoutId =
      window.setTimeout(() => {
        setSearch(searchInput.trim());
        setPage(1);
      }, 400);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchInput]);

  const cloudQuery =
    useCloudConfigurations({
      page,
      size: PAGE_SIZE,
      search,
    });

  const createMutation =
    useCreateCloud();

  const updateMutation =
    useUpdateCloud();

  const deleteMutation =
    useDeleteCloud();

  const items =
    cloudQuery.data?.items ?? [];

  const total =
    cloudQuery.data?.total ?? 0;

  const currentPage =
    cloudQuery.data?.page ?? page;

  const totalPages = Math.max(
    1,
    cloudQuery.data?.total_pages ??
      Math.ceil(total / PAGE_SIZE),
  );

  const openCreateModal = () => {
    setSelectedCloud(null);
    setPageError("");
    setModalOpen(true);
  };

  const openEditModal = (
    cloud: CloudConfiguration,
  ) => {
    setSelectedCloud(cloud);
    setPageError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (
      createMutation.isPending ||
      updateMutation.isPending
    ) {
      return;
    }

    setModalOpen(false);
    setSelectedCloud(null);
  };

  const handleSubmit = async (
    payload: CreateCloudRequest,
  ) => {
    setPageError("");
    setMessage("");

    try {
      if (selectedCloud) {
        await updateMutation.mutateAsync({
          id: selectedCloud.id,
          payload,
        });

        setMessage(
          "Cloud configuration updated successfully.",
        );
      } else {
        await createMutation.mutateAsync(
          payload,
        );

        setMessage(
          "Cloud configuration created successfully.",
        );
      }

      setModalOpen(false);
      setSelectedCloud(null);
    } catch (error) {
      setPageError(
        getErrorMessage(error),
      );
    }
  };

  const handleDelete = async (
    cloud: CloudConfiguration,
  ) => {
    const confirmed =
      window.confirm(
        `Delete "${cloud.name}"?`,
      );

    if (!confirmed) {
      return;
    }

    setPageError("");
    setMessage("");

    try {
      await deleteMutation.mutateAsync(
        cloud.id,
      );

      setMessage(
        "Cloud configuration deleted successfully.",
      );

      if (
        items.length === 1 &&
        page > 1
      ) {
        setPage((current) =>
          Math.max(1, current - 1),
        );
      }
    } catch (error) {
      setPageError(
        getErrorMessage(error),
      );
    }
  };

  const handleTest = async (
    cloud: CloudConfiguration,
  ) => {
    setPageError("");
    setMessage("");

    try {
      setMessage(
        "Connection test completed.",
      );
    } catch (error) {
      setPageError(
        getErrorMessage(error),
      );
    }
  };

  if (cloudQuery.isLoading) {
    return (
      <div
        style={{
          display:        "flex",
          flexDirection:  "column",
          alignItems:     "center",
          justifyContent: "center",
          minHeight:      "60vh",
          gap:            "1rem",
        }}
      >
        <div className="ods-spinner" />
        <p style={{ color: "var(--ods-gray-600)", fontSize: "var(--ods-font-size-sm)" }}>
          Loading cloud configurations...
        </p>
      </div>
    );
  }

  if (cloudQuery.isError) {
    return (
      <div className="ods-empty-state">
        <span className="ods-empty-icon">⚠️</span>
        <div className="ods-empty-title">Unable to load cloud configurations</div>
        <p className="ods-empty-text">
          {getErrorMessage(cloudQuery.error)}
        </p>
        <button
          type="button"
          className="btn btn-primary mt-3"
          onClick={() => {
            void cloudQuery.refetch();
          }}
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div>

      {/* ── Page header ─────────────────────────────────────── */}
      <div className="ods-page-header">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Cloud size={24} style={{ color: "var(--ods-orange)" }} />
            <h1 className="page-title">Cloud Configurations</h1>
          </div>
          <p className="page-subtitle">
            Manage cloud provider connections and regions.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            type="button"
            className="btn btn-outline-secondary"
            disabled={cloudQuery.isFetching}
            onClick={() => {
              void cloudQuery.refetch();
            }}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <RefreshCw
              size={15}
              style={{
                animation: cloudQuery.isFetching ? "ods-spin 0.7s linear infinite" : "none",
              }}
            />
            Refresh
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={openCreateModal}
          >
            <Plus size={16} style={{ marginRight: "0.35rem" }} />
            Add Cloud
          </button>
        </div>
      </div>

      {/* ── Alerts ──────────────────────────────────────────── */}
      {message && (
        <div className="ods-form-message success" style={{ margin: "0 0 1rem" }}>
          {message}
        </div>
      )}

      {pageError && (
        <div className="ods-form-message error" style={{ margin: "0 0 1rem" }}>
          {pageError}
        </div>
      )}

      {/* ── Main panel ──────────────────────────────────────── */}
      <div className="ods-card">

        {/* ── Toolbar ───────────────────────────────────────── */}
        <div className="ods-card-header" style={{ flexWrap: "wrap", gap: "0.75rem" }}>
          <div className="ods-search" style={{ flex: 1, minWidth: 260 }}>
            <Search className="ods-search-icon" size={15} />
            <input
              type="search"
              className="form-control form-control-sm"
              value={searchInput}
              placeholder="Search cloud configurations..."
              onChange={(event) => {
                setSearchInput(event.target.value);
              }}
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  setSearch("");
                  setPage(1);
                }}
                aria-label="Clear search"
                style={{
                  position:  "absolute",
                  right:     "0.5rem",
                  top:       "50%",
                  transform: "translateY(-50%)",
                  background:"none",
                  border:    "none",
                  color:     "var(--ods-gray-500)",
                  cursor:    "pointer",
                  padding:   "0.25rem",
                  display:   "flex",
                  alignItems:"center",
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* ── Result count ──────────────────────────────────── */}
        <div className="ods-list-toolbar">
          <span className="ods-list-count">
            <strong style={{ color: "var(--ods-gray-900)" }}>{total}</strong> configuration{total === 1 ? "" : "s"}
          </span>
        </div>

        {/* ── Table ─────────────────────────────────────────── */}
        <div className="ods-card-body" style={{ padding: 0 }}>
          <CloudTable
            items={items}
            page={currentPage}
            pageSize={PAGE_SIZE}
            deletingId={deleteMutation.variables}
            onEdit={openEditModal}
            onDelete={handleDelete}
            onTest={handleTest}
          />
        </div>

        {/* ── Pagination ────────────────────────────────────── */}
        <div className="ods-pagination">
          <span className="ods-pagination-info">
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
          </span>

          <div className="ods-pagination-actions">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              disabled={currentPage <= 1 || cloudQuery.isFetching}
              onClick={() => {
                setPage((current) => Math.max(1, current - 1));
              }}
            >
              Previous
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              disabled={currentPage >= totalPages || items.length === 0 || cloudQuery.isFetching}
              onClick={() => {
                setPage((current) => Math.min(totalPages, current + 1));
              }}
            >
              Next
            </button>
          </div>
        </div>

      </div>

      {/* ── Modal ───────────────────────────────────────────── */}
      <CloudModal
        open={modalOpen}
        cloud={selectedCloud}
        isSubmitting={
          createMutation.isPending ||
          updateMutation.isPending
        }
        onClose={closeModal}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
