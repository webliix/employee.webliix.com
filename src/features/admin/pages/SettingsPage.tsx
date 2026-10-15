import { useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Divider from "@mui/material/Divider";
import Alert from "@mui/material/Alert";
import { tokens } from "../../../theme/tokens";
import { Can } from "../../../components/Can";

export function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [companyName, setCompanyName] = useState("Webliix Tech Solutions");
  const [supportEmail, setSupportEmail] = useState("support@webliix.com");
  const [require2FA, setRequire2FA] = useState(false);
  const [autoApproveExpensesUnder, setAutoApproveExpensesUnder] = useState("0");

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, maxWidth: 800 }}>
      <Box>
        <Typography variant="h5" fontWeight={800} sx={{ color: tokens.colors.secondary[900] }}>
          System & Workspace Configuration
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748b" }}>
          Global organization preferences, security policies, and integrations
        </Typography>
      </Box>

      {saved && <Alert severity="success">Settings saved successfully.</Alert>}

      <Card sx={{ borderRadius: `${tokens.borderRadius.lg}px`, boxShadow: tokens.shadows.sm }}>
        <CardContent sx={{ display: "flex", flexDirection: "column", gap: 3, p: 3 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            General Organization
          </Typography>

          <TextField
            label="Organization Name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            fullWidth
          />

          <TextField
            label="Primary Support Email"
            value={supportEmail}
            onChange={(e) => setSupportEmail(e.target.value)}
            fullWidth
          />

          <Divider />

          <Typography variant="subtitle1" fontWeight={700}>
            Security & Access Control Policies
          </Typography>

          <FormControlLabel
            control={<Switch checked={require2FA} onChange={(e) => setRequire2FA(e.target.checked)} />}
            label="Enforce Two-Factor Authentication (2FA) for all workspace staff"
          />

          <Divider />

          <Typography variant="subtitle1" fontWeight={700}>
            Maker-Checker & Approvals
          </Typography>

          <TextField
            label="Maker-Checker Auto-Approve Threshold ($)"
            type="number"
            value={autoApproveExpensesUnder}
            onChange={(e) => setAutoApproveExpensesUnder(e.target.value)}
            fullWidth
            helperText="Set to 0 to require explicit maker-checker authorization on all expense claims."
          />

          <Can permission="SETTINGS_MANAGE">
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
              <Button
                variant="contained"
                onClick={handleSave}
                sx={{
                  bgcolor: tokens.colors.primary[600],
                  textTransform: "none",
                  fontWeight: 700,
                  px: 4,
                  py: 1,
                  borderRadius: `${tokens.borderRadius.md}px`,
                  "&:hover": { bgcolor: tokens.colors.primary[700] },
                }}
              >
                Save Configuration
              </Button>
            </Box>
          </Can>
        </CardContent>
      </Card>
    </Box>
  );
}
