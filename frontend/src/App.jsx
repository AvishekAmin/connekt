import "./App.css";
import { Route } from "react-router-dom";
import { Routes } from "react-router-dom";
import { BrowserRouter as Router } from "react-router-dom";
import LandingPage from "./pages/landing";

function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage></LandingPage>}></Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
