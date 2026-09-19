// Single place where environment variables are read.
export const API_URL = import.meta.env.VITE_API_URL ?? "";
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";
