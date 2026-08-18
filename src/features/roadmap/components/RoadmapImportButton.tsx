import { useRef, useState } from "react";
import { Upload } from "lucide-react";

import { getApiErrorMessage } from "@/lib/api-error";

import { useImportRoadmap } from "../hooks/useRoadmap";

interface RoadmapImportButtonProps {
  applicationId: number;
  replaceExisting: boolean;
  label?: string;
  className?: string;
  onSuccess?: () => void;
  onErrorMessage?: (message: string) => void;
}

function compactRoadmapError(message: string): string {
  const worksheets = Array.from(
    message.matchAll(/Worksheet '([^']+)' is missing required roadmap columns:\s*([^.]*)\.?/gi),
  );

  if (worksheets.length === 0) return message;

  return `Missing columns — ${worksheets
    .map((match) => `${match[1]}: ${match[2].trim()}`)
    .join("; ")}`;
}

export default function RoadmapImportButton({
  applicationId,
  replaceExisting,
  label = "Upload Roadmap",
  className = "btn btn-outline-secondary btn-sm",
  onSuccess,
  onErrorMessage,
}: RoadmapImportButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const importMutation = useImportRoadmap();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    onErrorMessage?.("");
    if (!/\.(xlsx|xlsm)$/i.test(file.name)) {
      onErrorMessage?.("Invalid roadmap file. Only .xlsx and .xlsm files are allowed.");
      e.target.value = "";
      return;
    }

    setSelectedFile(file);

    importMutation.mutate(
      { applicationId, file, replaceExisting },
      {
        onSuccess: () => {
          setSelectedFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
          onSuccess?.();
        },
        onError: (error) => {
          onErrorMessage?.(compactRoadmapError(getApiErrorMessage(error)));
          setSelectedFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        },
      },
    );
  };

  const isLoading = importMutation.isPending && selectedFile !== null;

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xlsm"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      <button
        type="button"
        className={className}
        onClick={handleClick}
        disabled={isLoading}
        style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
      >
        {isLoading ? (
          <>
            <div className="ods-spinner ods-spinner-sm" />
            Uploading...
          </>
        ) : (
          <>
            <Upload size={14} />
            {label}
          </>
        )}
      </button>
    </>
  );
}
