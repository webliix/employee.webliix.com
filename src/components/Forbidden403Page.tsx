import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ContactSupportOutlinedIcon from "@mui/icons-material/ContactSupportOutlined";
import { useNavigate } from "react-router-dom";
import { tokens } from "../theme/tokens";

interface Forbidden403PageProps {
  permission?: string;
  anyOf?: string[];
  message?: string;
}

export function Forbidden403Page({
  permission,
  anyOf,
  message,
}: Forbidden403PageProps) {
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
          bgcolor: "rgba(239, 68, 68, 0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 3,
        }}
      >
        <ShieldOutlinedIcon sx={{ fontSize: 44, color: "#ef4444" }} />
      </Box>

      <Typography
        variant="h4"
        fontWeight={800}
        sx={{ color: tokens.colors.secondary[900], mb: 1 }}
      >
        Access Restricted
      </Typography>

      <Typography
        variant="body1"
        sx={{ color: "#64748b", maxWidth: 480, mb: 3, lineHeight: 1.6 }}
      >
        {message ||
          "You do not possess the required permission to view this module. If you require access, please reach out to your department lead or workspace administrator."}
      </Typography>

      {(permission || (anyOf && anyOf.length > 0)) && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 4,
            p: 1.5,
            bgcolor: "#f1f5f9",
            borderRadius: `${tokens.borderRadius.md}px`,
          }}
        >
          <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
            Required permission:
          </Typography>
          {permission && (
            <Chip
              label={permission}
              size="small"
              sx={{
                bgcolor: "#e2e8f0",
                fontWeight: 700,
                fontSize: "0.75rem",
                fontFamily: "monospace",
              }}
            />
          )}
          {anyOf &&
            anyOf.map((p) => (
              <Chip
                key={p}
                label={p}
                size="small"
                sx={{
                  bgcolor: "#e2e8f0",
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  fontFamily: "monospace",
                }}
              />
            ))}
        </Box>
      )}

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center" }}>
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
          Return to Dashboard
        </Button>
        <Button
          variant="outlined"
          startIcon={<ContactSupportOutlinedIcon />}
          href="mailto:admin@webliix.com"
          sx={{
            textTransform: "none",
            fontWeight: 600,
            px: 3,
            py: 1,
            borderRadius: `${tokens.borderRadius.md}px`,
            borderColor: "#cbd5e1",
            color: "#475569",
            "&:hover": { borderColor: "#94a3b8", bgcolor: "rgba(0,0,0,0.02)" },
          }}
        >
          Request Access
        </Button>
      </Box>
    </Box>
  );
}
