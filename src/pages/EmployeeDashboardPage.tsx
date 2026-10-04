import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import FolderSpecialOutlinedIcon from "@mui/icons-material/FolderSpecialOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import { tokens } from "../theme/tokens";
import { authService, type EmployeeProfile } from "../services/authService";
import { projectApi, type Project } from "../services/projectApi";
import { ticketApi, type Ticket } from "../services/ticketApi";
import { workLogApi, type WorkLog } from "../services/workLogApi";

export function EmployeeDashboardPage() {
  const user = authService.getCurrentUser();
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [profData, projData, tickData, logsData] = await Promise.allSettled([
          authService.fetchMyEmployeeProfile(),
          projectApi.getMyProjects(),
          ticketApi.getMyTickets(),
          workLogApi.getMyWorkLogs(0, 5),
        ]);

        if (profData.status === "fulfilled") setProfile(profData.value);
        if (projData.status === "fulfilled") setProjects(projData.value);
        if (tickData.status === "fulfilled") setTickets(tickData.value);
        if (logsData.status === "fulfilled") setWorkLogs(logsData.value.content || []);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  const openTickets = tickets.filter((t) => t.status === "OPEN" || t.status === "IN_PROGRESS");

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Welcome Greeting */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} sx={{ color: tokens.colors.secondary[900] }}>
            Welcome back, {user?.firstName || "Employee"}! 👋
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b" }}>
            {profile?.designationName || user?.jobTitle || "Team Member"} • {profile?.departmentName || "Engineering"}
          </Typography>
        </Box>
        <Button
          component={Link}
          to="/work-logs"
          variant="contained"
          sx={{
            bgcolor: tokens.colors.primary[600],
            textTransform: "none",
            fontWeight: 700,
            borderRadius: `${tokens.borderRadius.md}px`,
          }}
        >
          + Submit Daily Work Log
        </Button>
      </Box>

      {/* KPI Cards (Grid via Box) */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }, gap: 2.5 }}>
        <Card sx={{ borderRadius: `${tokens.borderRadius.lg}px`, boxShadow: tokens.shadows.sm }}>
          <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ p: 1.5, borderRadius: `${tokens.borderRadius.md}px`, bgcolor: tokens.colors.primary[50], color: tokens.colors.primary[600] }}>
              <FolderSpecialOutlinedIcon />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>Assigned Projects</Typography>
              <Typography variant="h5" fontWeight={800}>{projects.length}</Typography>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: `${tokens.borderRadius.lg}px`, boxShadow: tokens.shadows.sm }}>
          <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ p: 1.5, borderRadius: `${tokens.borderRadius.md}px`, bgcolor: tokens.colors.warning[50], color: tokens.colors.warning[700] }}>
              <ConfirmationNumberOutlinedIcon />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>Open Tickets</Typography>
              <Typography variant="h5" fontWeight={800}>{openTickets.length}</Typography>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: `${tokens.borderRadius.lg}px`, boxShadow: tokens.shadows.sm }}>
          <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ p: 1.5, borderRadius: `${tokens.borderRadius.md}px`, bgcolor: tokens.colors.success[50], color: tokens.colors.success[700] }}>
              <AssignmentTurnedInOutlinedIcon />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>Reports Submitted</Typography>
              <Typography variant="h5" fontWeight={800}>{workLogs.length}</Typography>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: `${tokens.borderRadius.lg}px`, boxShadow: tokens.shadows.sm }}>
          <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ p: 1.5, borderRadius: `${tokens.borderRadius.md}px`, bgcolor: tokens.colors.secondary[100], color: tokens.colors.secondary[700] }}>
              <PaymentsOutlinedIcon />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>Employee Code</Typography>
              <Typography variant="h6" fontWeight={800}>{profile?.employeeCode || "N/A"}</Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Projects & Work Logs overview */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" }, gap: 3 }}>
        {/* Assigned Projects */}
        <Card sx={{ borderRadius: `${tokens.borderRadius.lg}px`, boxShadow: tokens.shadows.sm }}>
          <CardContent>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={700}>My Assigned Projects</Typography>
              <Button component={Link} to="/projects" size="small" sx={{ textTransform: "none" }}>View All</Button>
            </Box>
            {projects.length === 0 ? (
              <Typography variant="body2" sx={{ color: "#94a3b8", py: 3, textAlign: "center" }}>
                No active projects assigned yet.
              </Typography>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {projects.slice(0, 4).map((p) => (
                  <Box key={p.id} sx={{ p: 1.5, border: "1px solid #e2e8f0", borderRadius: `${tokens.borderRadius.md}px`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                      <Typography variant="body2" fontWeight={700}>{p.projectName}</Typography>
                      <Typography variant="caption" sx={{ color: "#64748b" }}>Code: {p.projectCode}</Typography>
                    </Box>
                    <Chip label={p.status} size="small" sx={{ fontSize: "0.75rem", fontWeight: 600 }} />
                  </Box>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Assigned Tickets */}
        <Card sx={{ borderRadius: `${tokens.borderRadius.lg}px`, boxShadow: tokens.shadows.sm }}>
          <CardContent>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={700}>Assigned Tickets</Typography>
              <Button component={Link} to="/tickets" size="small" sx={{ textTransform: "none" }}>View All</Button>
            </Box>
            {tickets.length === 0 ? (
              <Typography variant="body2" sx={{ color: "#94a3b8", py: 3, textAlign: "center" }}>
                No tickets assigned to you.
              </Typography>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {tickets.slice(0, 4).map((t) => (
                  <Box key={t.id} sx={{ p: 1.5, border: "1px solid #e2e8f0", borderRadius: `${tokens.borderRadius.md}px`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box sx={{ maxWidth: "70%" }}>
                      <Typography variant="body2" fontWeight={700} noWrap>{t.title}</Typography>
                      <Typography variant="caption" sx={{ color: "#64748b" }}>{t.ticketNumber}</Typography>
                    </Box>
                    <Chip label={t.status} size="small" color={t.status === "OPEN" ? "warning" : "default"} sx={{ fontSize: "0.75rem", fontWeight: 600 }} />
                  </Box>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
