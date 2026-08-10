import {
  ChangeEvent,
  useRef,
  useState,
} from "react";

import {
  FileSpreadsheet,
  Pencil,
  Search,
  Trash2,
} from "lucide-react";

import {
  useUploadedFiles,
} from "../hooks/useUploadedFiles";

import {
  useUpdateUploadedFile,
} from "../hooks/useUpdateUploadedFile";

import {
  useDeleteUploadedFile,
} from "../hooks/useDeleteUploadedFile";

import type {
  UploadFileResponse,
} from "../types/upload.types";


const PAGE_SIZE = 10;

function formatDate(
  value?: string,
): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString();
}

export default function UploadedFilesList() {
  const replacementInputRef =
    useRef<HTMLInputElement>(null);

  const [
    selectedUpload,
    setSelectedUpload,
  ] =
    useState<UploadFileResponse | null>(
      null,
    );

  const [page, setPage] =
    useState(1);

  const [searchInput, setSearchInput] =
    useState("");

  const [search, setSearch] =
    useState("");

  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
  } = useUploadedFiles({
    page,
    pageSize: PAGE_SIZE,
    search,
  });

  const updateMutation =
    useUpdateUploadedFile();

  const deleteMutation =
    useDeleteUploadedFile();

  const uploads =
    data?.items ?? [];

  const totalPages =
    Math.max(
      1,
      data?.total_pages ?? 1,
    );

  const handleReplacementChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file =
      event.target.files?.[0];

    event.target.value = "";

    if (!file || !selectedUpload) {
      return;
    }

    try {
      await updateMutation.mutateAsync({
        uploadId: selectedUpload.id,
        file,
      });

      setSelectedUpload(null);
    } catch {
      // Error shown below.
    }
  };

  const handleDelete = async (
    upload: UploadFileResponse,
  ) => {
    const confirmed =
      window.confirm(
        `Delete ${
          upload.original_file_name ??
          upload.file_name
        }?`,
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(
        upload.id,
      );
    } catch {
      // Error shown below.
    }
  };

  if (isLoading) {
    return (
      <div
        style={{
          display:        "flex",
          flexDirection:  "column",
          alignItems:     "center",
          justifyContent: "center",
          padding:        "3rem",
          gap:            "1rem",
        }}
      >
        <div className="ods-spinner" />
        <p style={{ color: "var(--ods-gray-600)", fontSize: "var(--ods-font-size-sm)" }}>
          Loading uploaded files...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="ods-form-message error" style={{ marginTop: "1.5rem" }}>
        {error instanceof Error
          ? error.message
          : "Unable to load uploads."}
      </div>
    );
  }

  return (
    <section className="ods-uploads-section">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="ods-uploads-header">
        <div>
          <h2>Uploaded Files</h2>
          <p>
            View, replace, or delete uploaded files.
          </p>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            setPage(1);
            setSearch(searchInput.trim());
          }}
          style={{ display: "flex", gap: "0.5rem" }}
        >
          <div className="ods-search">
            <Search className="ods-search-icon" size={15} />
            <input
              type="search"
              className="form-control form-control-sm"
              value={searchInput}
              placeholder="Search files"
              onChange={(event) => {
                setSearchInput(event.target.value);
              }}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-sm">
            Search
          </button>
        </form>
      </div>

      {/* ── Error messages ──────────────────────────────────── */}
      {(updateMutation.isError || deleteMutation.isError) && (
        <div className="ods-upload-message error">
          {updateMutation.error instanceof Error
            ? updateMutation.error.message
            : deleteMutation.error instanceof Error
              ? deleteMutation.error.message
              : "Operation failed."}
        </div>
      )}

      {/* ── Table ───────────────────────────────────────────── */}
      <div className="ods-table-wrapper">
        <table className="ods-uploads-table">
          <thead>
            <tr>
              <th>File</th>
              <th>Status</th>
              <th>Total rows</th>
              <th>Uploaded at</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {uploads.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className="ods-empty-state" style={{ padding: "2rem" }}>
                    <span className="ods-empty-icon">📂</span>
                    <p className="ods-empty-text">
                      No uploaded files found.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              uploads.map((upload) => (
                <tr key={upload.id}>
                  <td>
                    <div className="ods-uploads-file-name">
                      <FileSpreadsheet size={18} />
                      <span>
                        {upload.original_file_name ?? upload.file_name}
                      </span>
                    </div>
                  </td>

                  <td>
                    <span className="ods-status-badge active">
                      {upload.status}
                    </span>
                  </td>

                  <td style={{ color: "var(--ods-gray-600)" }}>
                    {upload.total_rows}
                  </td>

                  <td style={{ color: "var(--ods-gray-500)", whiteSpace: "nowrap" }}>
                    {formatDate(upload.uploaded_at ?? upload.created_at)}
                  </td>

                  <td>
                    <div className="ods-uploads-actions">
                      <button
                        type="button"
                        className="ods-action-btn"
                        disabled={updateMutation.isPending}
                        onClick={() => {
                          setSelectedUpload(upload);
                          replacementInputRef.current?.click();
                        }}
                      >
                        <Pencil size={14} />
                        Replace
                      </button>

                      <button
                        type="button"
                        className="ods-action-btn danger"
                        disabled={deleteMutation.isPending}
                        onClick={() => {
                          void handleDelete(upload);
                        }}
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Updating indicator ──────────────────────────────── */}
      {isFetching && (
        <div
          style={{
            textAlign:  "center",
            padding:    "0.75rem",
            fontSize:   "var(--ods-font-size-xs)",
            color:      "var(--ods-gray-500)",
            background: "var(--ods-gray-100)",
          }}
        >
          Updating list...
        </div>
      )}

      {/* ── Hidden file input ───────────────────────────────── */}
      <input
        ref={replacementInputRef}
        type="file"
        hidden
        accept=".csv,.xls,.xlsx"
        onChange={handleReplacementChange}
      />

      {/* ── Pagination ──────────────────────────────────────── */}
      <div className="ods-pagination" style={{ borderTop: "1px solid var(--ods-gray-200)" }}>
        <span className="ods-pagination-info">
          Page <strong>{page}</strong> of <strong>{totalPages}</strong>
        </span>

        <div className="ods-pagination-actions">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            disabled={page <= 1 || isFetching}
            onClick={() => {
              setPage((current) => Math.max(1, current - 1));
            }}
          >
            Previous
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            disabled={page >= totalPages || isFetching}
            onClick={() => {
              setPage((current) => Math.min(totalPages, current + 1));
            }}
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
