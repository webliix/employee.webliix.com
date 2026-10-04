import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import InputAdornment from "@mui/material/InputAdornment";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import CircularProgress from "@mui/material/CircularProgress";
import { tokens } from "../theme/tokens";
import { authService } from "../services/authService";

export function EmployeeLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await authService.login(email, password);
      const user = data?.user;

      // Validate employee or staff role
      const roles: string[] = user?.roles || [];
      const isEmployeeOrStaff = roles.some((r) =>
        ["EMPLOYEE", "ROLE_EMPLOYEE", "ADMIN", "ROLE_ADMIN", "SUPER_ADMIN", "ROLE_SUPER_ADMIN", "MANAGER", "ROLE_MANAGER"].includes(r)
      );

      if (!isEmployeeOrStaff) {
        authService.logout();
        setError("Access denied: You do not have an active employee account. Please contact your manager.");
        setLoading(false);
        return;
      }

      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#0f172a",
        px: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 440,
          width: "100%",
          p: 2,
          borderRadius: `${tokens.borderRadius.xl}px`,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          bgcolor: "#ffffff",
        }}
      >
        <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <Box sx={{ textAlign: "center", mb: 1 }}>
            <Box
              component="img"
              src="https://res.cloudinary.com/vhth8clt/image/upload/v1788210409/logo.png"
              alt="Webliix"
              sx={{ height: 48, mb: 1 }}
            />
            <Typography variant="h5" fontWeight={800} sx={{ color: tokens.colors.secondary[900] }}>
              Employee Portal
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b" }}>
              Log in to manage tasks, daily work logs & tickets
            </Typography>
          </Box>

          {error && <Alert severity="error">{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Company Email"
              type="email"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon sx={{ color: "#94a3b8" }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Password"
              type="password"
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color: "#94a3b8" }} />
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                bgcolor: tokens.colors.primary[600],
                fontWeight: 700,
                textTransform: "none",
                borderRadius: `${tokens.borderRadius.md}px`,
                "&:hover": { bgcolor: tokens.colors.primary[700] },
              }}
            >
              {loading ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : "Sign In to Workspace"}
            </Button>
          </Box>

          <Typography variant="caption" sx={{ color: "#94a3b8", textAlign: "center" }}>
            Webliix Workspace • employee.webliix.com
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
