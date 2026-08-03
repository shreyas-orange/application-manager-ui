import { useRef, useState } from "react";
import { Upload } from "lucide-react";

import { useImportRoadmap } from "../hooks/useRoadmap";

interface RoadmapImportButtonProps {
  applicationId: number;
  replaceExisting: boolean;
  label?: string;
  className?: string;
  onSuccess?: () => void;
}

export default function RoadmapImportButton({
  applicationId,
  replaceExisting,
  label = "Upload Roadmap",
  className = "btn btn-outline-secondary btn-sm",
  onSuccess,
}: RoadmapImportButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const importMutation = useImportRoadmap();

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
        onError: () => {
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
        accept=".csv,.xls,.xlsx"
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
