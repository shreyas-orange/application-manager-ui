type FastApiValidationIssue = {
  type?: string;
  loc?: unknown;
  msg?: string;
  input?: unknown;
  ctx?: unknown;
};

function detailToString(detail: unknown): string {
  if (detail == null) return "";

  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    const messages = detail
      .map((entry) => {
        if (typeof entry === "string") return entry;
        if (
          typeof entry === "object" &&
          entry !== null &&
          "msg" in entry
        ) {
          const item = entry as FastApiValidationIssue;
          if (item.msg) return item.msg;
        }
        return "";
      })
      .filter(Boolean);

    return messages.join("; ");
  }

  if (typeof detail === "object" && detail !== null) {
    const item = detail as FastApiValidationIssue;
    if (item.msg) return item.msg;
  }

  return "";
}

export function getApiErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const axiosError = error as {
      response?: {
        data?: {
          detail?: unknown;
          message?: unknown;
        };
      };
    };

    const detail = axiosError.response?.data?.detail;
    const message = axiosError.response?.data?.message;

    const detailText = detailToString(detail);
    if (detailText) return detailText;

    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong.";
}
