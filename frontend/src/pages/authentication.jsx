import * as React from "react";
import {
  Avatar,
  Box,
  Button,
  CssBaseline,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { AuthContext } from "../contexts/AuthContext";

const defaultTheme = createTheme();

export default function Authentication() {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [error, setError] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [formState, setFormState] = React.useState(0);
  const [open, setOpen] = React.useState(false);

  const { handleRegister, handleLogin } = React.useContext(AuthContext);

  const handleAuth = async () => {
    try {
      setError("");

      if (formState === 0) {
        await handleLogin(username, password);
      } else {
        const result = await handleRegister(name, username, password);

        setUsername("");
        setPassword("");
        setName("");
        setMessage(result);
        setOpen(true);
        setFormState(0);
      }
    } catch (err) {
      console.error(err);

      const errorMessage =
        err?.response?.data?.message || "Something went wrong.";

      setError(errorMessage);
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />

      <Stack
        direction={{ xs: "column", md: "row" }}
        sx={{
          minHeight: "100vh",
          width: "100%",
        }}
      >
        {/* Left side */}
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            flex: 1,
            minHeight: "100vh",
            backgroundImage:
              "url(https://source.unsplash.com/random?wallpapers)",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        {/* Right side */}
        <Paper
          elevation={6}
          square
          sx={{
            width: { xs: "100%", md: "45%" },
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              handleAuth();
            }}
            sx={{
              width: "100%",
              maxWidth: 420,
              px: { xs: 3, sm: 5 },
              py: 6,
            }}
          >
            <Stack
              spacing={2}
              sx={{
                alignItems: "center",
              }}
            >
              <Avatar sx={{ bgcolor: "secondary.main" }}>
                <LockOutlinedIcon />
              </Avatar>

              <Typography component="h1" variant="h5">
                {formState === 0 ? "Sign In" : "Create Account"}
              </Typography>

              <Stack direction="row" spacing={1}>
                <Button
                  variant={formState === 0 ? "contained" : "text"}
                  onClick={() => {
                    setFormState(0);
                    setError("");
                  }}
                >
                  Sign In
                </Button>

                <Button
                  variant={formState === 1 ? "contained" : "text"}
                  onClick={() => {
                    setFormState(1);
                    setError("");
                  }}
                >
                  Sign Up
                </Button>
              </Stack>

              {formState === 1 && (
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              )}

              <TextField
                margin="normal"
                required
                fullWidth
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {error && (
                <Typography color="error" sx={{ width: "100%" }}>
                  {error}
                </Typography>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 1 }}
              >
                {formState === 0 ? "Login" : "Register"}
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Stack>

      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={() => setOpen(false)}
        message={message}
      />
    </ThemeProvider>
  );
}
