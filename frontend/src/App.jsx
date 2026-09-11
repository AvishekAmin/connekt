import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ROUTES } from "./constants/routes";
import LandingPage from "./pages/landing";
import Authentication from "./pages/authentication";
import VideoMeetComponent from "./pages/videoMeet";
import HomeComponent from "./pages/home";
import History from "./pages/history";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path={ROUTES.LANDING} element={<LandingPage />} />
          <Route path={ROUTES.AUTH} element={<Authentication />} />
          <Route path={ROUTES.HOME} element={<HomeComponent />} />
          <Route path={ROUTES.HISTORY} element={<History />} />
          <Route path={ROUTES.MEETING} element={<VideoMeetComponent />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
