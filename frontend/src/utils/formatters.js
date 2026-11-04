export function formatNumber(value, options = {}) {
  return new Intl.NumberFormat(undefined, options).format(Number(value) || 0);
}

export function formatDate(value, options = {}) {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Not available"
    : date.toLocaleDateString(undefined, options);
}

export function formatDateTime(value) {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not available" : date.toLocaleString();
}

export function formatAsset(value) {
  return String(value || "").replace(/_/g, " ").toUpperCase();
}

export function getErrorMessage(error) {
  return error.response?.data?.message || "Something went wrong. Please try again.";
}
