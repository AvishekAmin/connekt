export const ROUTES = {
  LANDING: "/",
  AUTH: "/auth",
  DASHBOARD: "/dashboard",
  HISTORY: "/history",
  PRIVACY: "/terms-and-privacy",
  ABOUT: "/about",
  CONTACT: "/contact",
  MEETING: "/:url",
  getMeetingPath: (code) => `/${code}`,
};
