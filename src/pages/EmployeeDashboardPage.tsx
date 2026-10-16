import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";

import FolderSpecialOutlinedIcon from "@mui/icons-material/FolderSpecialOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import KeyOutlinedIcon from "@mui/icons-material/KeyOutlined";
import Divider from "@mui/material/Divider";

import { tokens } from "../theme/tokens";
import { authService, type EmployeeProfile } from "../services/authService";
import { projectApi, type Project } from "../services/projectApi";
import { ticketApi, type Ticket } from "../services/ticketApi";
import { workLogApi, type WorkLog } from "../services/workLogApi";
import { MyPermissionsDrawer } from "../components/MyPermissionsDrawer";
import { getPermissionMetadata, SCOPE_DESCRIPTIONS } from "../utils/permissionMetadata";
import {
  employeeSelfApi,
  type AttendanceRecord,
  type LeaveBalance,
  type LeaveRequest,
} from "../services/employeeSelfApi";
import { useAuth } from "../auth/AuthProvider";
import { usePermissions } from "../auth/usePermissions";
import { Can } from "../components/Can";

export function EmployeeDashboardPage() {
  const { user, permissions } = useAuth();
  const { can } = usePermissions();

  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [permissionsDrawerOpen, setPermissionsDrawerOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  
  // Real HR state
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
  const [attendanceStatus, setAttendanceStatus] = useState<string>("NOT_CLOCKED_IN");
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [clockLoading, setClockLoading] = useState(false);
  const [showSalary, setShowSalary] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [submittingLeave, setSubmittingLeave] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Leave Form
  const [leaveForm, setLeaveForm] = useState({
    leaveType: "CASUAL",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    reason: "",
  });

  const loadData = async () => {
    try {
      const promises: Promise<any>[] = [
        authService.fetchMyEmployeeProfile(),
        employeeSelfApi.getAttendance().catch(() => null),
        employeeSelfApi.getLeaveBalances().catch(() => []),
        employeeSelfApi.getLeaves().catch(() => []),
      ];

      if (can("PROJECTS_VIEW")) {
        promises.push(projectApi.getMyProjects().catch(() => []));
      }
      if (can("TICKETS_VIEW")) {
        promises.push(ticketApi.getMyTickets().catch(() => []));
      }
      if (can("WORKLOGS_VIEW") || can("WORKLOGS_SUBMIT")) {
        promises.push(workLogApi.getMyWorkLogs(0, 5).catch(() => ({ content: [] })));
      }

      const results = await Promise.allSettled(promises);

      const r0 = results[0];
      if (r0 && r0.status === "fulfilled") setProfile(r0.value);

      const r1 = results[1];
      if (r1 && r1.status === "fulfilled" && r1.value) {
        setTodayAttendance(r1.value.today);
        setAttendanceStatus(r1.value.status || "NOT_CLOCKED_IN");
      }

      const r2 = results[2];
      if (r2 && r2.status === "fulfilled" && Array.isArray(r2.value)) {
        setLeaveBalances(r2.value);
      }

      const r3 = results[3];
      if (r3 && r3.status === "fulfilled" && Array.isArray(r3.value)) {
        setLeaves(r3.value);
      }

      let idx = 4;
      if (can("PROJECTS_VIEW")) {
        const r = results[idx];
        if (r && r.status === "fulfilled") setProjects(r.value || []);
        idx++;
      }
      if (can("TICKETS_VIEW")) {
        const r = results[idx];
        if (r && r.status === "fulfilled") setTickets(r.value || []);
        idx++;
      }
      if (can("WORKLOGS_VIEW") || can("WORKLOGS_SUBMIT")) {
        const r = results[idx];
        if (r && r.status === "fulfilled") setWorkLogs(r.value?.content || []);
        idx++;
      }
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [can]);

  const handleClockIn = async () => {
    setClockLoading(true);
    setFeedback(null);
    try {
      const att = await employeeSelfApi.clockIn();
      setTodayAttendance(att);
      setAttendanceStatus("CLOCKED_IN");
      setFeedback({ type: "success", message: "Clocked in successfully! Have a productive day." });
    } catch (err: any) {
      setFeedback({ type: "error", message: err?.response?.data?.message || "Failed to clock in." });
    } finally {
      setClockLoading(false);
    }
  };

  const handleClockOut = async () => {
    setClockLoading(true);
    setFeedback(null);
    try {
      const att = await employeeSelfApi.clockOut();
      setTodayAttendance(att);
      setAttendanceStatus("CLOCKED_OUT");
      setFeedback({ type: "success", message: "Clocked out successfully! Great job today." });
    } catch (err: any) {
      setFeedback({ type: "error", message: err?.response?.data?.message || "Failed to clock out." });
    } finally {
      setClockLoading(false);
    }
  };

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingLeave(true);
    setFeedback(null);
    try {
      await employeeSelfApi.applyLeave(leaveForm);
      setLeaveDialogOpen(false);
      setFeedback({ type: "success", message: "Leave request submitted for manager review." });
      // Reload balances and leaves
      const [newBalances, newLeaves] = await Promise.all([
        employeeSelfApi.getLeaveBalances(),
        employeeSelfApi.getLeaves(),
      ]);
      setLeaveBalances(newBalances);
      setLeaves(newLeaves);
    } catch (err: any) {
      setFeedback({ type: "error", message: err?.response?.data?.message || "Failed to submit leave request." });
    } finally {
      setSubmittingLeave(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  const openTickets = tickets.filter((t) => t.status === "OPEN" || t.status === "IN_PROGRESS");
  const totalLeaveRemaining = leaveBalances.reduce((sum, b) => sum + (Number(b.remainingDays) || 0), 0);

  const formatCurrency = (amt?: number) => {
    if (amt === undefined || amt === null) return "₹0.00";
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amt);
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return "--:--";
    try {
      const date = new Date(timeStr);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return timeStr;
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Welcome Greeting & Quick Actions */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} sx={{ color: tokens.colors.secondary[900] }}>
            Welcome back, {user?.firstName || "Employee"}! 👋
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b" }}>
            {profile?.designationName || user?.jobTitle || "Workspace Member"} • {profile?.departmentName || "Engineering"} • ID: <Box component="span" sx={{ fontWeight: 700, color: tokens.colors.primary[600] }}>{profile?.employeeCode || "EMP-001"}</Box>
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          <Button
            variant="outlined"
            onClick={() => setLeaveDialogOpen(true)}
            startIcon={<AddCircleOutlineIcon />}
            sx={{
              borderColor: tokens.colors.secondary[200],
              color: tokens.colors.secondary[800],
              textTransform: "none",
              fontWeight: 700,
              borderRadius: `${tokens.borderRadius.md}px`,
            }}
          >
            Apply Leave
          </Button>
          <Can anyOf={["WORKLOGS_SUBMIT", "WORKLOGS_VIEW"]}>
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
              + Submit Work Log
            </Button>
          </Can>
        </Box>
      </Box>

      {/* Feedback banner */}
      {feedback && (
        <Alert
          severity={feedback.type}
          onClose={() => setFeedback(null)}
          sx={{ borderRadius: `${tokens.borderRadius.md}px`, fontWeight: 600 }}
        >
          {feedback.message}
        </Alert>
      )}

      {/* Approver Banner if user can approve expenses or review payments */}
      {(can("EXPENSES_APPROVE") || can("PAYMENT_SUBMISSIONS_REVIEW")) && (
        <Alert
          icon={<PendingActionsIcon />}
          severity="info"
          action={
            <Box sx={{ display: "flex", gap: 1 }}>
              <Can permission="EXPENSES_APPROVE">
                <Button component={Link} to="/expenses" size="small" variant="outlined" sx={{ textTransform: "none", fontWeight: 700 }}>
                  Review Expenses
                </Button>
              </Can>
              <Can permission="PAYMENT_SUBMISSIONS_REVIEW">
                <Button component={Link} to="/payments" size="small" variant="outlined" sx={{ textTransform: "none", fontWeight: 700 }}>
                  Review Payments
                </Button>
              </Can>
            </Box>
          }
          sx={{ borderRadius: `${tokens.borderRadius.md}px`, fontWeight: 600 }}
        >
          You have pending approval authority assigned to your account.
        </Alert>
      )}

      {/* Primary Employee KPI Cards Grid */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }, gap: 2.5 }}>
        {/* Card 1: Salary & Compensation */}
        <Card sx={{ borderRadius: `${tokens.borderRadius.lg}px`, boxShadow: tokens.shadows.sm }}>
          <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box sx={{ p: 1.25, borderRadius: `${tokens.borderRadius.md}px`, bgcolor: tokens.colors.success[50], color: tokens.colors.success[700] }}>
                <PaymentsOutlinedIcon />
              </Box>
              <Tooltip title={showSalary ? "Hide salary" : "Reveal salary"}>
                <IconButton size="small" onClick={() => setShowSalary(!showSalary)}>
                  {showSalary ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
            </Box>
            <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
              Monthly Compensation
            </Typography>
            <Typography variant="h5" fontWeight={800}>
              {showSalary ? formatCurrency(profile?.salary) : "••••••••"}
            </Typography>
            <Typography variant="caption" sx={{ color: "#94a3b8" }}>
              {profile?.employmentType || "FULL_TIME"} • Net Payout
            </Typography>
          </CardContent>
        </Card>

        {/* Card 2: Attendance Live Widget */}
        <Card sx={{ borderRadius: `${tokens.borderRadius.lg}px`, boxShadow: tokens.shadows.sm }}>
          <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box sx={{ p: 1.25, borderRadius: `${tokens.borderRadius.md}px`, bgcolor: tokens.colors.primary[50], color: tokens.colors.primary[600] }}>
                <AccessTimeFilledIcon />
              </Box>
              <Chip
                label={attendanceStatus.replace("_", " ")}
                size="small"
                color={
                  attendanceStatus === "CLOCKED_IN"
                    ? "success"
                    : attendanceStatus === "CLOCKED_OUT"
                    ? "default"
                    : "warning"
                }
                sx={{ fontWeight: 700, fontSize: "0.7rem" }}
              />
            </Box>
            <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
              Today's Attendance
            </Typography>
            <Typography variant="body2" fontWeight={700}>
              In: {formatTime(todayAttendance?.checkInTime)} | Out: {formatTime(todayAttendance?.checkOutTime)}
            </Typography>
            <Box sx={{ mt: 0.5 }}>
              {attendanceStatus === "NOT_CLOCKED_IN" ? (
                <Button
                  size="small"
                  variant="contained"
                  fullWidth
                  startIcon={<LoginIcon />}
                  disabled={clockLoading}
                  onClick={handleClockIn}
                  sx={{
                    bgcolor: tokens.colors.primary[600],
                    textTransform: "none",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    py: 0.5,
                  }}
                >
                  {clockLoading ? "Clocking In..." : "Clock In Now"}
                </Button>
              ) : attendanceStatus === "CLOCKED_IN" ? (
                <Button
                  size="small"
                  variant="contained"
                  color="warning"
                  fullWidth
                  startIcon={<LogoutIcon />}
                  disabled={clockLoading}
                  onClick={handleClockOut}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    py: 0.5,
                  }}
                >
                  {clockLoading ? "Clocking Out..." : "Clock Out"}
                </Button>
              ) : (
                <Typography variant="caption" sx={{ color: "#16a34a", fontWeight: 700 }}>
                  ✓ Shift complete ({todayAttendance?.workingHours ? `${todayAttendance.workingHours.toFixed(1)} hrs` : "Logged"})
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Card 3: Leave Quotas & Balances */}
        <Card sx={{ borderRadius: `${tokens.borderRadius.lg}px`, boxShadow: tokens.shadows.sm }}>
          <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box sx={{ p: 1.25, borderRadius: `${tokens.borderRadius.md}px`, bgcolor: tokens.colors.secondary[100], color: tokens.colors.secondary[700] }}>
                <EventAvailableIcon />
              </Box>
              <Chip
                label="Available"
                size="small"
                sx={{ bgcolor: "#f1f5f9", fontWeight: 700, fontSize: "0.7rem" }}
              />
            </Box>
            <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
              Leave Balance
            </Typography>
            <Typography variant="h5" fontWeight={800}>
              {totalLeaveRemaining} <Typography component="span" variant="body2" sx={{ color: "#64748b" }}>Days Left</Typography>
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 0.5 }}>
              {leaveBalances.map((b) => (
                <Chip
                  key={b.id || b.leaveType}
                  label={`${b.leaveType[0]}: ${b.remainingDays}d`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: "0.68rem", fontWeight: 600 }}
                />
              ))}
            </Box>
          </CardContent>
        </Card>

        {/* Card 4: Open Tickets / Work Status */}
        <Card sx={{ borderRadius: `${tokens.borderRadius.lg}px`, boxShadow: tokens.shadows.sm }}>
          <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box sx={{ p: 1.25, borderRadius: `${tokens.borderRadius.md}px`, bgcolor: tokens.colors.warning[50], color: tokens.colors.warning[700] }}>
                <ConfirmationNumberOutlinedIcon />
              </Box>
              <Chip
                label={`${projects.length} Projects`}
                size="small"
                sx={{ bgcolor: "#eff6ff", color: "#1d4ed8", fontWeight: 700, fontSize: "0.7rem" }}
              />
            </Box>
            <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
              Assigned Tickets
            </Typography>
            <Typography variant="h5" fontWeight={800}>
              {openTickets.length} <Typography component="span" variant="body2" sx={{ color: "#64748b" }}>Active</Typography>
            </Typography>
            <Typography variant="caption" sx={{ color: "#94a3b8" }}>
              {workLogs.length} work logs submitted this month
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Projects & Tickets Overview */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" }, gap: 3 }}>
        <Can permission="PROJECTS_VIEW">
          <Card sx={{ borderRadius: `${tokens.borderRadius.lg}px`, boxShadow: tokens.shadows.sm }}>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <FolderSpecialOutlinedIcon sx={{ color: tokens.colors.primary[600] }} />
                  <Typography variant="subtitle1" fontWeight={700}>My Assigned Projects</Typography>
                </Box>
                <Button component={Link} to="/projects" size="small" sx={{ textTransform: "none", fontWeight: 600 }}>View All</Button>
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
        </Can>

        <Can permission="TICKETS_VIEW">
          <Card sx={{ borderRadius: `${tokens.borderRadius.lg}px`, boxShadow: tokens.shadows.sm }}>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <ConfirmationNumberOutlinedIcon sx={{ color: tokens.colors.warning[700] }} />
                  <Typography variant="subtitle1" fontWeight={700}>Assigned Tickets</Typography>
                </Box>
                <Button component={Link} to="/tickets" size="small" sx={{ textTransform: "none", fontWeight: 600 }}>View All</Button>
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
        </Can>
      </Box>

      {/* My Assigned Permissions & Portal Capabilities Card */}
      <Card
        sx={{
          borderRadius: `${tokens.borderRadius.lg}px`,
          boxShadow: tokens.shadows.sm,
          border: `1px solid ${tokens.colors.secondary[200]}`,
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        }}
      >
        <CardContent sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  p: 1,
                  borderRadius: `${tokens.borderRadius.md}px`,
                  bgcolor: tokens.colors.primary[50],
                  color: tokens.colors.primary[600],
                  display: "flex",
                }}
              >
                <SecurityOutlinedIcon />
              </Box>
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="subtitle1" fontWeight={800} sx={{ color: tokens.colors.secondary[900] }}>
                    My Assigned Permissions & Portal Capabilities
                  </Typography>
                  <Chip
                    label={`${permissions.size} Active Grants`}
                    size="small"
                    color="primary"
                    sx={{ fontWeight: 800, fontSize: "0.7rem", height: 22 }}
                  />
                </Box>
                <Typography variant="caption" sx={{ color: "#64748b" }}>
                  Verified permissions determining what features, operational records, and approval actions you can perform
                </Typography>
              </Box>
            </Box>

            <Button
              size="small"
              variant="outlined"
              onClick={() => setPermissionsDrawerOpen(true)}
              startIcon={<KeyOutlinedIcon />}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                borderRadius: `${tokens.borderRadius.md}px`,
                borderColor: tokens.colors.primary[200],
                color: tokens.colors.primary[700],
                bgcolor: "#ffffff",
                "&:hover": { bgcolor: tokens.colors.primary[50] },
              }}
            >
              View Full Permissions Guide ({permissions.size})
            </Button>
          </Box>

          <Divider />

          {/* Quick Permission Capabilities Chips Grid */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
              gap: 1.5,
            }}
          >
            {Array.from(permissions.entries()).slice(0, 8).map(([code, scope]) => {
              const meta = getPermissionMetadata(code);
              const scopeInfo = SCOPE_DESCRIPTIONS[scope] || { label: scope, color: "#334155", bg: "#f1f5f9" };
              return (
                <Box
                  key={code}
                  onClick={() => setPermissionsDrawerOpen(true)}
                  sx={{
                    p: 1.5,
                    bgcolor: "#ffffff",
                    borderRadius: `${tokens.borderRadius.md}px`,
                    border: "1px solid #e2e8f0",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: 1,
                    transition: "all 0.15s ease",
                    "&:hover": {
                      borderColor: tokens.colors.primary[300],
                      boxShadow: tokens.shadows.xs,
                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 0.5 }}>
                    <Typography variant="body2" fontWeight={700} sx={{ fontSize: "0.8rem", color: tokens.colors.secondary[900] }} noWrap>
                      {meta.name}
                    </Typography>
                    <Chip
                      label={scope}
                      size="small"
                      sx={{
                        fontSize: "0.62rem",
                        fontWeight: 800,
                        height: 18,
                        bgcolor: scopeInfo.bg,
                        color: scopeInfo.color,
                      }}
                    />
                  </Box>
                  <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.72rem", lineHeight: 1.2 }} noWrap>
                    {meta.description}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </CardContent>
      </Card>

      {/* Recent Leave Requests History */}
      <Card sx={{ borderRadius: `${tokens.borderRadius.lg}px`, boxShadow: tokens.shadows.sm }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <EventAvailableIcon sx={{ color: tokens.colors.secondary[700] }} />
              <Typography variant="subtitle1" fontWeight={700}>My Leave Applications & Quotas</Typography>
            </Box>
            <Button
              size="small"
              onClick={() => setLeaveDialogOpen(true)}
              variant="outlined"
              sx={{ textTransform: "none", fontWeight: 700 }}
            >
              + Request Leave
            </Button>
          </Box>
          {leaves.length === 0 ? (
            <Typography variant="body2" sx={{ color: "#94a3b8", py: 3, textAlign: "center" }}>
              No leave requests submitted recently. You have all your allotted leave balances available.
            </Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {leaves.slice(0, 5).map((l) => (
                <Box key={l.id} sx={{ p: 1.5, border: "1px solid #e2e8f0", borderRadius: `${tokens.borderRadius.md}px`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                  <Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="body2" fontWeight={700}>{l.leaveType} LEAVE</Typography>
                      <Chip
                        label={l.status}
                        size="small"
                        color={l.status === "APPROVED" ? "success" : l.status === "REJECTED" ? "error" : "warning"}
                        sx={{ fontSize: "0.7rem", fontWeight: 700 }}
                      />
                    </Box>
                    <Typography variant="caption" sx={{ color: "#64748b" }}>
                      From {l.startDate} to {l.endDate} • {l.reason}
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                    Submitted {new Date(l.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Apply Leave Modal */}
      <Dialog open={leaveDialogOpen} onClose={() => setLeaveDialogOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleApplyLeave}>
          <DialogTitle sx={{ fontWeight: 800 }}>Apply for Leave</DialogTitle>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              select
              label="Leave Type"
              value={leaveForm.leaveType}
              onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
              fullWidth
              required
            >
              <MenuItem value="CASUAL">Casual Leave (Casual / Personal)</MenuItem>
              <MenuItem value="SICK">Sick Leave (Medical / Health)</MenuItem>
              <MenuItem value="ANNUAL">Annual Leave (Vacation / Earned)</MenuItem>
              <MenuItem value="UNPAID">Unpaid Leave</MenuItem>
            </TextField>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <TextField
                type="date"
                label="Start Date"
                InputLabelProps={{ shrink: true }}
                value={leaveForm.startDate}
                onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                required
              />
              <TextField
                type="date"
                label="End Date"
                InputLabelProps={{ shrink: true }}
                value={leaveForm.endDate}
                onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                required
              />
            </Box>
            <TextField
              label="Reason for Leave"
              value={leaveForm.reason}
              onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
              multiline
              rows={3}
              required
              placeholder="Please provide a brief reason for your leave request..."
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setLeaveDialogOpen(false)} sx={{ textTransform: "none" }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submittingLeave}
              sx={{ bgcolor: tokens.colors.primary[600], textTransform: "none", fontWeight: 700 }}
            >
              {submittingLeave ? "Submitting..." : "Submit Leave Request"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Permissions Breakdown Drawer */}
      <MyPermissionsDrawer
        open={permissionsDrawerOpen}
        onClose={() => setPermissionsDrawerOpen(false)}
        employeeCode={profile?.employeeCode}
      />
    </Box>
  );
}
