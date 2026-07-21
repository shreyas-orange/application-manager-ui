import {
  ChangeEvent,
  DragEvent,
  useRef,
  useState,
} from "react";

import {
  CheckCircle2,
  FileSpreadsheet,
  UploadCloud,
  X,
} from "lucide-react";

import { useUploadFile } from "../hooks/useUploadFile";

import "../styles/upload-file.css";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_EXTENSIONS = [
  "csv",
  "xls",
  "xlsx",
];

function getFileExtension(fileName: string): string {
  return fileName
    .split(".")
    .pop()
    ?.toLowerCase() ?? "";
}

function formatFileSize(size: number): string {
  if (size < 1024) {
    return `${size} bytes`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadFilePage() {
  const inputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [validationError, setValidationError] =
    useState("");

  const [isDragging, setIsDragging] =
    useState(false);

  const uploadMutation = useUploadFile();

  const validateAndSelectFile = (file: File) => {
    setValidationError("");
    uploadMutation.reset();

    const extension = getFileExtension(file.name);

    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      setSelectedFile(null);
      setValidationError(
        "Only CSV, XLS and XLSX files are allowed.",
      );
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setSelectedFile(null);
      setValidationError(
        "The selected file must be smaller than 10 MB.",
      );
      return;
    }

    setSelectedFile(file);
  };

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (file) {
      validateAndSelectFile(file);
    }

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

    const file = event.dataTransfer.files?.[0];

    if (file) {
      validateAndSelectFile(file);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setValidationError("");
    uploadMutation.reset();
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setValidationError(
        "Please select a file before uploading.",
      );
      return;
    }

    try {
      await uploadMutation.mutateAsync(selectedFile);
      setSelectedFile(null);
    } catch {
      // Mutation error is displayed below.
    }
  };

  return (
    <section className="upload-page">
      <div className="upload-page-header">
        <h1>Upload File</h1>

        <p>
          Upload application data using a CSV or Excel
          file.
        </p>
      </div>

      <div className="upload-card">
        <div className="upload-card-header">
          <div className="upload-card-icon">
            <UploadCloud size={22} />
          </div>

          <div>
            <h2>Application data file</h2>

            <p>
              Select a CSV, XLS or XLSX file up to 10 MB.
            </p>
          </div>
        </div>

        <div
          className={
            isDragging
              ? "upload-drop-zone upload-drop-zone--active"
              : "upload-drop-zone"
          }
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <UploadCloud size={42} />

          <h3>Drag and drop your file here</h3>

          <p>or select a file from your computer</p>

          <button
            type="button"
            className="upload-browse-button"
            disabled={uploadMutation.isPending}
            onClick={() => {
              inputRef.current?.click();
            }}
          >
            Browse File
          </button>

          <input
            ref={inputRef}
            type="file"
            className="upload-hidden-input"
            accept=".csv,.xls,.xlsx"
            onChange={handleFileChange}
          />
        </div>

        {selectedFile && (
          <div className="upload-selected-file">
            <div className="upload-file-icon">
              <FileSpreadsheet size={22} />
            </div>

            <div className="upload-file-details">
              <strong>{selectedFile.name}</strong>

              <span>
                {formatFileSize(selectedFile.size)}
              </span>
            </div>

            <button
              type="button"
              className="upload-remove-button"
              disabled={uploadMutation.isPending}
              onClick={removeSelectedFile}
              aria-label="Remove selected file"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {validationError && (
          <div className="upload-message upload-message--error">
            {validationError}
          </div>
        )}

        {uploadMutation.isError && (
          <div className="upload-message upload-message--error">
            {uploadMutation.error instanceof Error
              ? uploadMutation.error.message
              : "Unable to upload the file."}
          </div>
        )}

        {uploadMutation.isSuccess && (
          <div className="upload-result">
            <div className="upload-message upload-message--success">
              <CheckCircle2 size={18} />

              <span>
                {uploadMutation.data.original_file_name ||
                  uploadMutation.data.file_name}{" "}
                uploaded successfully.
              </span>
            </div>

            <div className="upload-result-grid">
              <div>
                <span>Status</span>
                <strong>
                  {uploadMutation.data.status}
                </strong>
              </div>

              <div>
                <span>Total rows</span>
                <strong>
                  {uploadMutation.data.total_rows}
                </strong>
              </div>

              <div>
                <span>Processed rows</span>
                <strong>
                  {uploadMutation.data.processed_rows}
                </strong>
              </div>

              <div>
                <span>Failed rows</span>
                <strong>
                  {uploadMutation.data.failed_rows}
                </strong>
              </div>
            </div>
          </div>
        )}

        <div className="upload-actions">
          <button
            type="button"
            className="upload-clear-button"
            disabled={
              !selectedFile ||
              uploadMutation.isPending
            }
            onClick={removeSelectedFile}
          >
            Clear
          </button>

          <button
            type="button"
            className="upload-submit-button"
            disabled={
              !selectedFile ||
              uploadMutation.isPending
            }
            onClick={() => {
              void handleUpload();
            }}
          >
            <UploadCloud size={17} />

            {uploadMutation.isPending
              ? "Uploading..."
              : "Upload File"}
          </button>
        </div>
      </div>
    </section>
  );
}