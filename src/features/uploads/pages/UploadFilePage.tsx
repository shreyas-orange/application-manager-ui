import {
  type ChangeEvent,
  type DragEvent,
  useRef,
  useState,
} from "react";

import {
  CheckCircle2,
  FileSpreadsheet,
  UploadCloud,
  X,
} from "lucide-react";

import { PageHeader } from "@/components/ui";

import { useUploadFile } from "../hooks/useUploadFile";

import UploadedFilesList from "../components/UploadedFilesList";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_EXTENSIONS = [
  "csv",
  "xls",
  "xlsx",
];

function getFileExtension(
  fileName: string,
): string {
  return (
    fileName
      .split(".")
      .pop()
      ?.toLowerCase() ?? ""
  );
}

function formatFileSize(
  size: number,
): string {
  if (size < 1024) {
    return `${size} bytes`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(
    size /
    (1024 * 1024)
  ).toFixed(1)} MB`;
}

export default function UploadFilePage() {
  const inputRef =
    useRef<HTMLInputElement>(null);

  const [selectedFiles, setSelectedFiles] =
    useState<File[]>([]);

  const [validationError, setValidationError] =
    useState("");

  const [isDragging, setIsDragging] =
    useState(false);

  const uploadMutation = useUploadFile();

  const validateAndSelectFiles = (
    files: File[],
  ) => {
    setValidationError("");
    uploadMutation.reset();

    if (files.length === 0) {
      return;
    }

    const invalidExtensionFile =
      files.find((file) => {
        const extension =
          getFileExtension(file.name);

        return !ALLOWED_EXTENSIONS.includes(
          extension,
        );
      });

    if (invalidExtensionFile) {
      setValidationError(
        `${invalidExtensionFile.name}: only CSV, XLS and XLSX files are allowed.`,
      );
      return;
    }

    const oversizedFile = files.find(
      (file) =>
        file.size > MAX_FILE_SIZE,
    );

    if (oversizedFile) {
      setValidationError(
        `${oversizedFile.name}: each file must be smaller than 10 MB.`,
      );
      return;
    }

    setSelectedFiles((currentFiles) => {
      const existingFiles = new Set(
        currentFiles.map(
          (file) =>
            `${file.name}-${file.size}-${file.lastModified}`,
        ),
      );

      const newFiles = files.filter(
        (file) =>
          !existingFiles.has(
            `${file.name}-${file.size}-${file.lastModified}`,
          ),
      );

      return [
        ...currentFiles,
        ...newFiles,
      ];
    });
  };

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(
      event.target.files ?? [],
    );

    validateAndSelectFiles(files);

    event.target.value = "";
  };

  const handleDragOver = (
    event: DragEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (
    event: DragEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (
    event: DragEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();
    setIsDragging(false);

    const files = Array.from(
      event.dataTransfer.files ?? [],
    );

    validateAndSelectFiles(files);
  };

  const removeSelectedFile = (
    indexToRemove: number,
  ) => {
    setSelectedFiles((currentFiles) =>
      currentFiles.filter(
        (_, index) =>
          index !== indexToRemove,
      ),
    );

    setValidationError("");
    uploadMutation.reset();
  };

  const clearSelectedFiles = () => {
    setSelectedFiles([]);
    setValidationError("");
    uploadMutation.reset();
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setValidationError(
        "Please select at least one file before uploading.",
      );
      return;
    }

    try {
      await uploadMutation.mutateAsync(
        selectedFiles,
      );

      setSelectedFiles([]);
    } catch {
      // Mutation error is displayed below.
    }
  };

  return (
    <div>

      <PageHeader
        title="Upload Files"
        subtitle="Upload application data using CSV or Excel files."
      />

      {/* ── Upload Card ─────────────────────────────────────── */}
      <div className="ods-upload-card">

        {/* ── Card header ───────────────────────────────────── */}
        <div className="ods-upload-card-header">
          <div className="ods-upload-card-icon">
            <UploadCloud size={22} />
          </div>
          <div>
            <h2>Application data files</h2>
            <p>
              Select one or more CSV, XLS or XLSX files up to 10 MB each.
            </p>
          </div>
        </div>

        {/* ── Drop zone ─────────────────────────────────────── */}
        <div
          className={`ods-upload-dropzone ${isDragging ? "drag-over" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <UploadCloud size={42} />
          <h3>Drag and drop your files here</h3>
          <p>or select files from your computer</p>

          <button
            type="button"
            className="ods-upload-browse-btn"
            disabled={uploadMutation.isPending}
            onClick={() => {
              inputRef.current?.click();
            }}
          >
            Browse Files
          </button>

          <input
            ref={inputRef}
            type="file"
            multiple
            className="ods-upload-hidden-input"
            accept=".csv,.xls,.xlsx"
            onChange={handleFileChange}
          />
        </div>

        {/* ── Selected files ────────────────────────────────── */}
        {selectedFiles.length > 0 && (
          <div className="ods-upload-selected-files">
            {selectedFiles.map(
              (file, index) => (
                <div
                  className="ods-upload-file-item"
                  key={`${file.name}-${file.size}-${file.lastModified}`}
                >
                  <div className="ods-upload-file-icon">
                    <FileSpreadsheet size={22} />
                  </div>

                  <div className="ods-upload-file-info">
                    <strong>{file.name}</strong>
                    <span>{formatFileSize(file.size)}</span>
                  </div>

                  <button
                    type="button"
                    className="ods-upload-remove-btn"
                    disabled={uploadMutation.isPending}
                    onClick={() => {
                      removeSelectedFile(index);
                    }}
                    aria-label={`Remove ${file.name}`}
                  >
                    <X size={18} />
                  </button>
                </div>
              ),
            )}
          </div>
        )}

        {/* ── Validation error ──────────────────────────────── */}
        {validationError && (
          <div className="ods-upload-message error">
            {validationError}
          </div>
        )}

        {/* ── Upload error ──────────────────────────────────── */}
        {uploadMutation.isError && (
          <div className="ods-upload-message error">
            {uploadMutation.error instanceof Error
              ? uploadMutation.error.message
              : "Unable to upload the files."}
          </div>
        )}

        {/* ── Upload success ────────────────────────────────── */}
        {uploadMutation.isSuccess && (
          <div className="ods-upload-result">
            <div className="ods-upload-result-message">
              <CheckCircle2 size={18} />
              <span>
                {uploadMutation.data.length}{" "}
                file
                {uploadMutation.data.length === 1 ? "" : "s"}{" "}
                uploaded successfully.
              </span>
            </div>

            <div className="ods-upload-result-list">
              {uploadMutation.data.map(
                (uploadedFile) => (
                  <div
                    className="ods-upload-result-item"
                    key={uploadedFile.id}
                  >
                    <div>
                      <strong>
                        {uploadedFile.original_file_name ||
                          uploadedFile.file_name}
                      </strong>
                    </div>

                    <div className="ods-upload-result-grid">
                      <div>
                        <span>Status</span>
                        <strong>{uploadedFile.status}</strong>
                      </div>
                      <div>
                        <span>Total rows</span>
                        <strong>{uploadedFile.total_rows}</strong>
                      </div>
                      <div>
                        <span>Processed rows</span>
                        <strong>{uploadedFile.processed_rows}</strong>
                      </div>
                      <div>
                        <span>Failed rows</span>
                        <strong>{uploadedFile.failed_rows}</strong>
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        )}

        {/* ── Actions ───────────────────────────────────────── */}
        <div className="ods-upload-actions">
          <button
            type="button"
            className="btn btn-outline-secondary"
            disabled={
              selectedFiles.length === 0 ||
              uploadMutation.isPending
            }
            onClick={clearSelectedFiles}
          >
            Clear
          </button>

          <button
            type="button"
            className="btn btn-primary"
            disabled={
              selectedFiles.length === 0 ||
              uploadMutation.isPending
            }
            onClick={() => {
              void handleUpload();
            }}
          >
            <UploadCloud size={16} style={{ marginRight: "0.35rem" }} />
            {uploadMutation.isPending
              ? "Uploading..."
              : `Upload ${selectedFiles.length} File${selectedFiles.length === 1 ? "" : "s"}`}
          </button>
        </div>
      </div>

      {/* ── Uploaded files list ─────────────────────────────── */}
      <UploadedFilesList />
    </div>
  );
}
