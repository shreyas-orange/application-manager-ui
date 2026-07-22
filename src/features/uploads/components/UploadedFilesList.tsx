import {
  ChangeEvent,
  useRef,
  useState,
} from "react";

import {
  FileSpreadsheet,
  Pencil,
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
import "../styles/UploadedFilesList.css";


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
      <div>
        Loading uploaded files...
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        {error instanceof Error
          ? error.message
          : "Unable to load uploads."}
      </div>
    );
  }

  return (
    <section className="uploads-list-section">
      <div className="uploads-list-header">
        <div>
          <h2>Uploaded Files</h2>

          <p>
            View, replace, or delete
            uploaded files.
          </p>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            setPage(1);
            setSearch(
              searchInput.trim(),
            );
          }}
        >
          <input
            type="search"
            value={searchInput}
            placeholder="Search files"
            onChange={(event) => {
              setSearchInput(
                event.target.value,
              );
            }}
          />

          <button type="submit">
            Search
          </button>
        </form>
      </div>

      {(updateMutation.isError ||
        deleteMutation.isError) && (
        <div className="upload-message upload-message--error">
          {updateMutation.error instanceof
          Error
            ? updateMutation.error.message
            : deleteMutation.error instanceof
                Error
              ? deleteMutation.error.message
              : "Operation failed."}
        </div>
      )}

      <div className="uploads-table-wrapper">
        <table className="uploads-table">
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
                <td colSpan={7}>
                  No uploaded files found.
                </td>
              </tr>
            ) : (
              uploads.map((upload) => (
                <tr key={upload.id}>
                  <td>
                    <div className="uploaded-file-name">
                      <FileSpreadsheet
                        size={18}
                      />

                      <span>
                        {upload.original_file_name ??
                          upload.file_name}
                      </span>
                    </div>
                  </td>

                  <td>
                    {upload.status}
                  </td>

                  <td>
                    {upload.total_rows}
                  </td>

                  <td>
                    {formatDate(
                      upload.uploaded_at,
                    )}
                  </td>

                  <td>
                    <div className="upload-row-actions">
                      <button
                        type="button"
                        disabled={
                          updateMutation.isPending
                        }
                        onClick={() => {
                          setSelectedUpload(
                            upload,
                          );

                          replacementInputRef
                            .current
                            ?.click();
                        }}
                      >
                        <Pencil size={16} />
                        Replace
                      </button>

                      <button
                        type="button"
                        disabled={
                          deleteMutation.isPending
                        }
                        onClick={() => {
                          void handleDelete(
                            upload,
                          );
                        }}
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {isFetching && (
          <div>
            Updating list...
          </div>
        )}
      </div>

      <input
        ref={replacementInputRef}
        type="file"
        hidden
        accept=".csv,.xls,.xlsx"
        onChange={
          handleReplacementChange
        }
      />

      <div className="uploads-pagination">
        <button
          type="button"
          disabled={
            page <= 1 ||
            isFetching
          }
          onClick={() => {
            setPage((current) =>
              Math.max(
                1,
                current - 1,
              ),
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
            isFetching
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