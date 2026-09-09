import React, { useContext, useState } from "react";
import withAuth from "../utils/withAuth";
import { useNavigate } from "react-router-dom";
import RestoreIcon from "@mui/icons-material/Restore";
import { Button, TextField, IconButton } from "@mui/material";
import { AuthContext } from "../contexts/AuthContext";
import "../App.css";

function HomeComponent() {
  let navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState("");
  const { addToUserHistory } = useContext(AuthContext);

  let handleJoinVideoCall = async () => {
    await addToUserHistory(meetingCode);
    navigate(`/${meetingCode}`);
  };

  return (
    <div>
      <div className="navBar">
        <div style={{ display: "flex", alignItems: "center" }}>
          <h2>Connekt</h2>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <IconButton>
            <RestoreIcon />
          </IconButton>
          <p>History</p>
          <Button
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/auth");
            }}
          >
            Logout
          </Button>
        </div>
      </div>
      <div className="meetContainer">
        <div className="leftPanel">
          <div>
            <h2>Providing Quality Video Call Just Like Quality Education</h2>
            <div style={{ display: "flex", gap: "10px" }}>
              <TextField
                onChange={(element) => setMeetingCode(element.target.value)}
                id="outlined-basic"
                label="Outlined"
                variant="outlined"
              />
              <Button onClick={handleJoinVideoCall} variant="contained">
                Join
              </Button>
            </div>
          </div>
        </div>
        <div className="rightPanel">
          <img srcSet="/logo.png" alt="logo" />
        </div>
      </div>
    </div>
  );
}

export default withAuth(HomeComponent);
