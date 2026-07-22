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

import "../styles/cloud.css";

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
        response.message ||
          "Connection successful.",
      );
    } catch (error) {
      setPageError(
        getErrorMessage(error),
      );
    }
  };

  if (cloudQuery.isLoading) {
    return (
      <div className="list-state">
        Loading cloud configurations...
      </div>
    );
  }

  if (cloudQuery.isError) {
    return (
      <div className="list-state list-state--error">
        <h2>
          Unable to load cloud
          configurations
        </h2>

        <p>
          {getErrorMessage(
            cloudQuery.error,
          )}
        </p>

        <button
          type="button"
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
    <section className="cloud-page">
      <div className="list-page-header">
        <div>
          <div className="cloud-page-title">
            <Cloud size={26} />

            <h1>
              Cloud Configurations
            </h1>
          </div>

          <p>
            Manage cloud provider
            connections and regions.
          </p>
        </div>

        <div className="cloud-header-actions">
          <button
            type="button"
            className="secondary-button"
            disabled={
              cloudQuery.isFetching
            }
            onClick={() => {
              void cloudQuery.refetch();
            }}
          >
            <RefreshCw
              size={17}
              className={
                cloudQuery.isFetching
                  ? "spin-icon"
                  : undefined
              }
            />

            Refresh
          </button>

          <button
            type="button"
            className="primary-button"
            onClick={openCreateModal}
          >
            <Plus size={17} />
            Add Cloud
          </button>
        </div>
      </div>

      {message && (
        <div className="cloud-alert cloud-alert--success">
          {message}
        </div>
      )}

      {pageError && (
        <div className="cloud-alert cloud-alert--error">
          {pageError}
        </div>
      )}

      <div className="list-toolbar">
        <div className="cloud-search">
          <Search
            size={18}
            className="cloud-search__icon"
          />

          <input
            type="search"
            value={searchInput}
            placeholder="Search cloud configurations..."
            onChange={(event) => {
              setSearchInput(
                event.target.value,
              );
            }}
          />

          {searchInput && (
            <button
              type="button"
              className="cloud-search__clear"
              aria-label="Clear search"
              onClick={() => {
                setSearchInput("");
                setSearch("");
                setPage(1);
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        <span className="list-count">
          {total} configuration
          {total === 1 ? "" : "s"}
        </span>
      </div>

      <CloudTable
        items={items}
        page={currentPage}
        pageSize={PAGE_SIZE}
        deletingId={
          deleteMutation.variables
        }
        onEdit={openEditModal}
        onDelete={handleDelete}
        onTest={handleTest}
      />

      <div className="pagination">
        <button
          type="button"
          disabled={
            currentPage <= 1 ||
            cloudQuery.isFetching
          }
          onClick={() => {
            setPage((current) =>
              Math.max(1, current - 1),
            );
          }}
        >
          Previous
        </button>

        <span>
          Page {currentPage} of{" "}
          {totalPages}
        </span>

        <button
          type="button"
          disabled={
            currentPage >= totalPages ||
            items.length === 0 ||
            cloudQuery.isFetching
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
    </section>
  );
}