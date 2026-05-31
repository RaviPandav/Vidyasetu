const trimTrailingSlash = (value) => value.replace(/\/+$/, "");

const getRuntimeApiUrl = () => {
  if (typeof window === "undefined") return "http://localhost:5000/api";

  const override = window.localStorage?.getItem("vidyasetu-api-url");
  if (override) return override;

  if (window.location.protocol === "http:" || window.location.protocol === "https:") {
    return `${window.location.protocol}//${window.location.hostname}:5000/api`;
  }

  return "http://localhost:5000/api";
};

export const API_BASE_URL = trimTrailingSlash(
  import.meta.env.VITE_API_URL || getRuntimeApiUrl()
);

export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");
export const SOCKET_ORIGIN = trimTrailingSlash(import.meta.env.VITE_SOCKET_URL || API_ORIGIN);

export const getAssetUrl = (url) => {
  if (!url) return "";
  if (/^(https?:)?\/\//i.test(url) || /^data:/i.test(url) || /^blob:/i.test(url)) return url;

  const normalized = url.startsWith("/") ? url : `/${url}`;
  return `${API_ORIGIN}${normalized}`;
};
