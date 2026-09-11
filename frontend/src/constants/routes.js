export const ROUTES = {
  LANDING: "/",
  AUTH: "/auth",
  HOME: "/home",
  HISTORY: "/history",
  MEETING: "/:url",
  getMeetingPath: (code) => `/${code}`,
};

export const STORAGE_KEYS = {
  TOKEN: "token",
};
