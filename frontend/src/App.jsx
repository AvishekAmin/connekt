import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ROUTES } from "./constants/routes";
import LandingPage from "./pages/landing";
import Authentication from "./pages/authentication";
import VideoMeetComponent from "./pages/videoMeet";
import DashboardComponent from "./pages/dashboard";
import History from "./pages/history";
import PrivacyPage from "./pages/privacy";
import AboutPage from "./pages/about";
import ContactPage from "./pages/contact";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path={ROUTES.LANDING} element={<LandingPage />} />
          <Route path={ROUTES.AUTH} element={<Authentication />} />
          <Route path={ROUTES.DASHBOARD} element={<DashboardComponent />} />
          <Route path={ROUTES.HISTORY} element={<History />} />
          <Route path={ROUTES.PRIVACY} element={<PrivacyPage />} />
          <Route path={ROUTES.ABOUT} element={<AboutPage />} />
          <Route path={ROUTES.CONTACT} element={<ContactPage />} />
          <Route path={ROUTES.MEETING} element={<VideoMeetComponent />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
