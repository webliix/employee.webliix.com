import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { tokens } from "../theme/tokens";

export function NotFound404Page() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        p: 3,
      }}
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          bgcolor: "rgba(100, 116, 139, 0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 3,
        }}
      >
        <SearchOffIcon sx={{ fontSize: 44, color: "#64748b" }} />
      </Box>

      <Typography variant="h4" fontWeight={800} sx={{ color: tokens.colors.secondary[900], mb: 1 }}>
        404 - Page Not Found
      </Typography>

      <Typography variant="body1" sx={{ color: "#64748b", maxWidth: 440, mb: 4, lineHeight: 1.6 }}>
        The workspace path you are looking for does not exist or has been relocated.
      </Typography>

      <Button
        variant="contained"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/dashboard")}
        sx={{
          bgcolor: tokens.colors.primary[600],
          textTransform: "none",
          fontWeight: 700,
          px: 3,
          py: 1,
          borderRadius: `${tokens.borderRadius.md}px`,
          "&:hover": { bgcolor: tokens.colors.primary[700] },
        }}
      >
        Back to Dashboard
      </Button>
    </Box>
  );
}
