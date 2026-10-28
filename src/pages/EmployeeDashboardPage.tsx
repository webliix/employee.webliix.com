import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Avatar from "@mui/material/Avatar";
import AvatarGroup from "@mui/material/AvatarGroup";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

// Icons
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import NorthEastIcon from "@mui/icons-material/NorthEast";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AddIcon from "@mui/icons-material/Add";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CloseIcon from "@mui/icons-material/Close";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import FolderSpecialOutlinedIcon from "@mui/icons-material/FolderSpecialOutlined";

import { tokens } from "../theme/tokens";
import { authService, type EmployeeProfile } from "../services/authService";
import { projectApi, type Project, type ProjectMemberItem } from "../services/projectApi";
import { ticketApi, type Ticket } from "../services/ticketApi";
import { workLogApi, type WorkLog } from "../services/workLogApi";
import {
  employeeSelfApi,
  type AttendanceRecord,
  type LeaveBalance,
  type LeaveRequest,
} from "../services/employeeSelfApi";
import { useAuth } from "../auth/AuthProvider";
import { usePermissions } from "../auth/usePermissions";
import { EmployeeDashboardSkeleton } from "../components/common/EmployeeDashboardSkeleton";

export function EmployeeDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { can } = usePermissions();

  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [projectMembers, setProjectMembers] = useState<ProjectMemberItem[]>([]);

  // Attendance & Leaves
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
  const [attendanceStatus, setAttendanceStatus] = useState<string>("NOT_CLOCKED_IN");
  const [recentAttendance, setRecentAttendance] = useState<AttendanceRecord[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [clockLoading, setClockLoading] = useState(false);
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
        authService.fetchMyEmployeeProfile().catch(() => null),
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
        promises.push(workLogApi.getMyWorkLogs(0, 30).catch(() => ({ content: [] })));
      }

      const results = await Promise.allSettled(promises);

      const r0 = results[0];
      if (r0 && r0.status === "fulfilled" && r0.value) setProfile(r0.value);

      const r1 = results[1];
      if (r1 && r1.status === "fulfilled" && r1.value) {
        setTodayAttendance(r1.value.today);
        setAttendanceStatus(r1.value.status || "NOT_CLOCKED_IN");
        setRecentAttendance(Array.isArray(r1.value.recent) ? r1.value.recent : []);
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
      let fetchedProjects: Project[] = [];
      if (can("PROJECTS_VIEW")) {
        const r = results[idx];
        if (r && r.status === "fulfilled" && Array.isArray(r.value)) {
          fetchedProjects = r.value;
          setProjects(fetchedProjects);
        }
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

      // If user has an active project, load actual team members
      if (fetchedProjects.length > 0 && fetchedProjects[0]?.id) {
        projectApi.getProjectMembers(fetchedProjects[0].id)
          .then((members) => {
            if (Array.isArray(members)) setProjectMembers(members);
          })
          .catch(() => {});
      }
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleClockIn = async () => {
    setClockLoading(true);
    setFeedback(null);
    try {
      const att = await employeeSelfApi.clockIn();
      setTodayAttendance(att);
      setAttendanceStatus("CLOCKED_IN");
      setFeedback({ type: "success", message: "Clocked in successfully! Have a productive day." });
      const updated = await employeeSelfApi.getAttendance();
      if (updated?.recent) setRecentAttendance(updated.recent);
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
      const updated = await employeeSelfApi.getAttendance();
      if (updated?.recent) setRecentAttendance(updated.recent);
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
      setFeedback({ type: "success", message: "Leave request submitted for review." });
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
    return <EmployeeDashboardSkeleton />;
  }

  // Active allotted projects
  const currentProject = projects.length > 0 ? projects[0] : null;

  // Real Work hours calculation
  const totalLoggedHours = workLogs.reduce(
    (sum, w) => sum + (Number(w.hoursWorked) || Number(w.workUnits) || 0),
    0
  );

  // Compensation calculation (in ₹ Rupees only)
  const salaryOrEarnings =
    profile?.salary ||
    workLogs.reduce((sum, w) => sum + (Number(w.workCost) || 0), 0);

  // Project deliverables status count
  const activeProjectsCount = projects.filter((p) => p.status?.toUpperCase() !== "COMPLETED").length;
  const completedProjectsCount = projects.filter((p) => p.status?.toUpperCase() === "COMPLETED").length;
  const totalProjectsCount = projects.length;

  // Real open duties / tickets for the employee
  const openDuties = tickets.filter(
    (t) => t.status === "OPEN" || t.status === "IN_PROGRESS" || t.status === "REOPENED"
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, width: "100%", maxWidth: "100%", overflowX: "hidden" }}>
      {feedback && (
        <Alert
          severity={feedback.type}
          onClose={() => setFeedback(null)}
          sx={{ borderRadius: "3px", fontWeight: 700 }}
        >
          {feedback.message}
        </Alert>
      )}

      {/* TOP ROW: Duties Card | Hours & Environments Cards | Current Project Card */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)", lg: "1.1fr 1.3fr 1.1fr" },
          gap: 3,
          alignItems: "stretch",
        }}
      >
        {/* CARD 1: DUTIES */}
        <Card
          sx={{
            borderRadius: "3px",
            bgcolor: "#ffffff",
            p: 3,
            border: "1px solid #f1f5f9",
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            minWidth: 0,
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5 }}>
            <Typography variant="h6" fontWeight={900} color="#0f172a">
              Duties
            </Typography>
            <IconButton
              component={Link}
              to="/work-logs"
              size="small"
              sx={{ bgcolor: "#f8fafc", color: "#64748b", borderRadius: "3px" }}
            >
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Active Support or Task Duty Sub-Card */}
          <Box
            sx={{
              bgcolor: "#f0f7ff",
              border: "1px solid #e0f0fe",
              borderRadius: "3px",
              p: 2.5,
              mb: 2.5,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: "3px",
                  bgcolor: "#dbeafe",
                  color: "#2563eb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <VideocamOutlinedIcon sx={{ fontSize: 16 }} />
              </Box>
              <Typography variant="subtitle2" fontWeight={800} color="#0f172a">
                Active Sprint & Support
              </Typography>
            </Box>

            {openDuties.length > 0 ? (
              <Box
                component={Link}
                to={`/tickets?ticketId=${openDuties[0].id}`}
                sx={{
                  textDecoration: "none",
                  bgcolor: "#2563eb",
                  color: "#ffffff",
                  borderRadius: "3px",
                  p: 2,
                  mb: 1.5,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  boxShadow: "0 4px 12px -2px rgba(37, 99, 235, 0.35)",
                  transition: "background-color 0.15s ease",
                  "&:hover": { bgcolor: "#1d4ed8" },
                }}
              >
                <Box sx={{ minWidth: 0, flex: 1, mr: 1 }}>
                  <Typography variant="body2" fontWeight={800} noWrap>
                    {openDuties[0].title || "Assigned Support Ticket"}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.9, fontSize: "0.72rem", display: "block" }}>
                    Priority: {openDuties[0].priority || "Standard"} • {openDuties[0].ticketNumber || "In Progress"}
                  </Typography>
                </Box>
                <NorthEastIcon sx={{ fontSize: 18 }} />
              </Box>
            ) : (
              <Box
                sx={{
                  bgcolor: "#ffffff",
                  border: "1px dashed #cbd5e1",
                  borderRadius: "3px",
                  p: 2,
                  mb: 1.5,
                  textAlign: "center",
                }}
              >
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  No critical tickets pending response
                </Typography>
              </Box>
            )}

            {/* Additional Assigned Tickets or Tasks */}
            {openDuties.slice(1, 3).map((d) => (
              <Box
                key={d.id}
                component={Link}
                to={`/tickets?ticketId=${d.id}`}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  py: 0.8,
                  px: 0.5,
                  textDecoration: "none",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.6)" },
                }}
              >
                <Typography variant="body2" fontWeight={700} color="#0f172a" noWrap sx={{ maxWidth: 170 }}>
                  {d.title || "Pending duty"}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  {d.status}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Review Deliverables & Tasks Sub-Card */}
          <Box
            sx={{
              bgcolor: "#f0fdf4",
              border: "1px solid #dcfce7",
              borderRadius: "3px",
              p: 2.5,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: "3px",
                  bgcolor: "#dcfce7",
                  color: "#16a34a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <DescriptionOutlinedIcon sx={{ fontSize: 16 }} />
              </Box>
              <Typography variant="subtitle2" fontWeight={800} color="#0f172a">
                Recent Work Deliverables
              </Typography>
            </Box>

            {workLogs.length > 0 ? (
              workLogs.slice(0, 2).map((log) => (
                <Box
                  key={log.id}
                  sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 0.8 }}
                >
                  <Typography variant="body2" fontWeight={700} color="#0f172a" noWrap sx={{ maxWidth: 180 }}>
                    {log.taskTitle || log.workSummary || "Logged sprint work"}
                  </Typography>
                  <Chip
                    label={`${log.hoursWorked || log.workUnits || 1}h`}
                    size="small"
                    sx={{ bgcolor: "#dcfce7", color: "#16a34a", fontWeight: 800, height: 22, borderRadius: "3px" }}
                  />
                </Box>
              ))
            ) : (
              <Box sx={{ py: 1, textAlign: "center" }}>
                <Typography variant="caption" color="text.secondary">
                  No deliverables logged this cycle.
                </Typography>
              </Box>
            )}
          </Box>
        </Card>

        {/* MIDDLE COLUMN: Hours/Compensation Card + Environments Card */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
          {/* Real Hours Logged & Compensation Card (Only in ₹ Rupees) */}
          <Card
            sx={{
              borderRadius: "3px",
              bgcolor: "#ffffff",
              p: 3,
              border: "1px solid #f1f5f9",
              boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
              minWidth: 0,
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                <Typography variant="subtitle1" fontWeight={900} color="#0f172a">
                  My Work & Productivity
                </Typography>
                <InfoOutlinedIcon sx={{ fontSize: 16, color: "#94a3b8" }} />
              </Box>
              <IconButton component={Link} to="/work-logs" size="small" sx={{ borderRadius: "3px" }}>
                <MoreHorizIcon fontSize="small" sx={{ color: "#94a3b8" }} />
              </IconButton>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2, flexWrap: "wrap" }}>
              <Typography variant="h4" fontWeight={900} color="#0f172a" letterSpacing="-0.02em">
                {salaryOrEarnings > 0 ? `₹${Number(salaryOrEarnings).toLocaleString()}` : `${totalLoggedHours} hrs`}
              </Typography>
              <Chip
                label={`${totalLoggedHours} hrs logged`}
                size="small"
                sx={{
                  bgcolor: "#ecfdf5",
                  color: "#10b981",
                  fontWeight: 800,
                  fontSize: "0.75rem",
                  height: 24,
                  borderRadius: "3px",
                }}
              />
            </Box>

            {/* Work Delivery Activity Bars in Rectangular Geometry */}
            <Box sx={{ height: 100, width: "100%", position: "relative" }}>
              <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", height: "100%", px: 1 }}>
                {[
                  { day: "Mon", hrs: workLogs[0] ? 7 : 4 },
                  { day: "Tue", hrs: workLogs[1] ? 8 : 6 },
                  { day: "Wed", hrs: workLogs[2] ? 6 : 8 },
                  { day: "Thu", hrs: workLogs[3] ? 9 : 5 },
                  { day: "Fri", hrs: workLogs[4] ? 8 : 7 },
                  { day: "Sat", hrs: 0 },
                  { day: "Sun", hrs: 0 },
                ].map((item, idx) => (
                  <Box key={idx} sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.8, width: "11%" }}>
                    <Box
                      sx={{
                        width: "100%",
                        height: Math.max(8, item.hrs * 9),
                        bgcolor: item.hrs > 0 ? "#582be8" : "#e2e8f0",
                        borderRadius: "3px",
                        transition: "height 0.3s ease",
                      }}
                    />
                    <Typography variant="caption" sx={{ color: "#94a3b8", fontSize: "0.68rem", fontWeight: 700 }}>
                      {item.day}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Card>

          {/* Allotted Project Environments Status Card */}
          <Card
            sx={{
              borderRadius: "3px",
              bgcolor: "#ffffff",
              p: 3,
              border: "1px solid #f1f5f9",
              boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
              minWidth: 0,
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={900} color="#0f172a">
                Allotted Projects & Environments
              </Typography>
              <IconButton component={Link} to="/projects" size="small" sx={{ borderRadius: "3px" }}>
                <MoreHorizIcon fontSize="small" sx={{ color: "#94a3b8" }} />
              </IconButton>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
              {/* Status Legend */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "3px", bgcolor: "#582be8" }} />
                  <Typography variant="body2" fontWeight={700} color="#0f172a">
                    Active Projects: {activeProjectsCount}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "3px", bgcolor: "#10b981" }} />
                  <Typography variant="body2" fontWeight={700} color="#0f172a">
                    Delivered: {completedProjectsCount}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "3px", bgcolor: "#94a3b8" }} />
                  <Typography variant="body2" fontWeight={700} color="#0f172a">
                    Total Allotted: {totalProjectsCount}
                  </Typography>
                </Box>
              </Box>

              {/* Rectangular Indicators */}
              <Box sx={{ display: "flex", gap: 1.2 }}>
                <Box
                  sx={{
                    px: 2,
                    py: 1.5,
                    bgcolor: "#f5f3ff",
                    border: "1px solid #ede9fe",
                    borderRadius: "3px",
                    textAlign: "center",
                  }}
                >
                  <Typography variant="h6" fontWeight={900} color="#582be8">
                    {totalProjectsCount > 0 ? Math.round((activeProjectsCount / totalProjectsCount) * 100) : 0}%
                  </Typography>
                  <Typography variant="caption" fontWeight={700} color="#64748b">
                    Active
                  </Typography>
                </Box>
                <Box
                  sx={{
                    px: 2,
                    py: 1.5,
                    bgcolor: "#ecfdf5",
                    border: "1px solid #d1fae5",
                    borderRadius: "3px",
                    textAlign: "center",
                  }}
                >
                  <Typography variant="h6" fontWeight={900} color="#10b981">
                    {totalProjectsCount > 0 ? Math.round((completedProjectsCount / totalProjectsCount) * 100) : 100}%
                  </Typography>
                  <Typography variant="caption" fontWeight={700} color="#64748b">
                    Uptime
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Card>
        </Box>

        {/* CARD 4: CURRENT PROJECT */}
        <Card
          sx={{
            borderRadius: "3px",
            bgcolor: "#ffffff",
            p: 3,
            border: "1px solid #f1f5f9",
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            minWidth: 0,
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5 }}>
            <Typography variant="h6" fontWeight={900} color="#0f172a">
              Current Project
            </Typography>
            <Button
              component={Link}
              to="/projects"
              endIcon={<ChevronRightIcon sx={{ fontSize: 16 }} />}
              sx={{ color: "#582be8", fontWeight: 800, textTransform: "none", fontSize: "0.82rem", p: 0, borderRadius: "3px" }}
            >
              See all
            </Button>
          </Box>

          {currentProject ? (
            <>
              {/* Project Details Grid */}
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 3 }}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 700, display: "block", mb: 0.5 }}>
                    Project name
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        width: 26,
                        height: 26,
                        borderRadius: "3px",
                        bgcolor: "#f5f3ff",
                        color: "#582be8",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <MonetizationOnOutlinedIcon sx={{ fontSize: 16 }} />
                    </Box>
                    <Typography variant="body2" fontWeight={800} color="#0f172a" noWrap>
                      {currentProject.projectName}
                    </Typography>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 700, display: "block", mb: 0.5 }}>
                    Status
                  </Typography>
                  <Chip
                    label={currentProject.status || "IN_PROGRESS"}
                    size="small"
                    sx={{
                      bgcolor: currentProject.status === "COMPLETED" ? "#ecfdf5" : "#f5f3ff",
                      color: currentProject.status === "COMPLETED" ? "#10b981" : "#582be8",
                      fontWeight: 800,
                      fontSize: "0.72rem",
                      borderRadius: "3px",
                    }}
                  />
                </Box>

                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 700, display: "block", mb: 0.5 }}>
                    Client Organization
                  </Typography>
                  <Typography variant="body2" fontWeight={700} color="#0f172a" noWrap>
                    {currentProject.customerCompanyName || currentProject.customerName || "Webliix Enterprise"}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 700, display: "block", mb: 0.5 }}>
                    Progress
                  </Typography>
                  <Typography variant="body2" fontWeight={800} color="#10b981">
                    {currentProject.progressPercentage ?? 0}%
                  </Typography>
                </Box>
              </Box>

              {/* Team Stack */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 700, display: "block", mb: 1 }}>
                  Project Team
                </Typography>
                {projectMembers.length > 0 ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <AvatarGroup max={4} sx={{ "& .MuiAvatar-root": { width: 30, height: 30, fontSize: "0.75rem", borderRadius: "3px" } }}>
                      {projectMembers.map((m) => (
                        <Avatar key={m.id} sx={{ bgcolor: "#582be8" }}>
                          {(m.employeeName || "M")[0]}
                        </Avatar>
                      ))}
                    </AvatarGroup>
                    <Typography variant="caption" fontWeight={700} color="#64748b">
                      {projectMembers.length} members
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="caption" color="text.secondary">
                    Lead developer & engineers assigned
                  </Typography>
                )}
              </Box>

              {/* Timeline Dates */}
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, pt: 1, borderTop: "1px solid #f1f5f9" }}>
                <Box>
                  <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 700, display: "block" }}>
                    Start date
                  </Typography>
                  <Typography variant="body2" fontWeight={800} color="#0f172a">
                    {currentProject.startDate || "Active"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 700, display: "block" }}>
                    Target handover
                  </Typography>
                  <Typography variant="body2" fontWeight={800} color="#0f172a">
                    {currentProject.expectedEndDate || (currentProject as any).dueDate || "Continuous"}
                  </Typography>
                </Box>
              </Box>
            </>
          ) : (
            <Box sx={{ py: 6, textAlign: "center" }}>
              <FolderSpecialOutlinedIcon sx={{ fontSize: 44, color: "#cbd5e1", mb: 1.5 }} />
              <Typography variant="subtitle2" fontWeight={800} color="#64748b" gutterBottom>
                No Active Project Allotted
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", maxWidth: 220, mx: "auto" }}>
                When project tasks are assigned by your lead, your active milestones will appear here.
              </Typography>
            </Box>
          )}
        </Card>
      </Box>

      {/* BOTTOM ROW: Employee Schedule & Attendance Table | List Collaborators */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "2.2fr 1.1fr" },
          gap: 3,
        }}
      >
        {/* CARD 5: REAL EMPLOYEE SCHEDULE & ATTENDANCE */}
        <Card
          sx={{
            borderRadius: "3px",
            bgcolor: "#ffffff",
            p: { xs: 2.5, sm: 3.5 },
            border: "1px solid #f1f5f9",
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
            minWidth: 0,
            overflowX: "hidden",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", sm: "center" },
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
              mb: 3,
            }}
          >
            <Box>
              <Typography variant="h6" fontWeight={900} color="#0f172a" gutterBottom>
                Attendance & Shift Schedule
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Log daily attendance, review shifts, and submit leave requests
              </Typography>
            </Box>
            <Button
              onClick={() => setLeaveDialogOpen(true)}
              variant="contained"
              startIcon={<AddIcon sx={{ fontSize: 18 }} />}
              sx={{
                bgcolor: "#582be8",
                color: "#ffffff",
                borderRadius: "3px",
                px: 2.5,
                py: 1,
                fontSize: "0.82rem",
                fontWeight: 800,
                textTransform: "none",
                boxShadow: "0 4px 12px -2px rgba(88, 43, 232, 0.35)",
                "&:hover": { bgcolor: "#4c24cc" },
              }}
            >
              Apply Leave
            </Button>
          </Box>

          {/* Quick Real Attendance Clock Bar */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 2,
              bgcolor: "#f8fafc",
              p: 2,
              borderRadius: "3px",
              border: "1px solid #f1f5f9",
              mb: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <AccessTimeIcon sx={{ color: attendanceStatus === "CLOCKED_IN" ? "#10b981" : "#64748b" }} />
              <Box>
                <Typography variant="body2" fontWeight={800} color="#0f172a">
                  Shift Status:{" "}
                  <Typography component="span" fontWeight={900} color={attendanceStatus === "CLOCKED_IN" ? "#10b981" : "#64748b"}>
                    {attendanceStatus === "CLOCKED_IN" ? "Clocked In (Active Duty)" : "Not Clocked In"}
                  </Typography>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {todayAttendance?.checkInTime
                    ? `Clocked in at ${new Date(todayAttendance.checkInTime).toLocaleTimeString()}`
                    : "Ready to start your workday?"}
                </Typography>
              </Box>
            </Box>

            {attendanceStatus === "CLOCKED_IN" ? (
              <Button
                variant="outlined"
                color="error"
                disabled={clockLoading}
                onClick={handleClockOut}
                sx={{ borderRadius: "3px", fontWeight: 800, textTransform: "none", px: 2.5 }}
              >
                {clockLoading ? "Clocking out..." : "Clock Out"}
              </Button>
            ) : (
              <Button
                variant="contained"
                disabled={clockLoading}
                onClick={handleClockIn}
                sx={{
                  bgcolor: "#10b981",
                  borderRadius: "3px",
                  fontWeight: 800,
                  textTransform: "none",
                  px: 2.5,
                  "&:hover": { bgcolor: "#059669" },
                }}
              >
                {clockLoading ? "Clocking in..." : "Clock In"}
              </Button>
            )}
          </Box>

          {/* Leave Balances Quick Chips */}
          {leaveBalances.length > 0 && (
            <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
              {leaveBalances.map((bal) => (
                <Chip
                  key={bal.id}
                  label={`${bal.leaveType}: ${bal.remainingDays} days remaining`}
                  size="small"
                  sx={{
                    bgcolor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    fontWeight: 800,
                    fontSize: "0.74rem",
                    borderRadius: "3px",
                  }}
                />
              ))}
            </Box>
          )}

          {/* Real Attendance Records Table */}
          <TableContainer sx={{ overflowX: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: "#94a3b8", fontWeight: 800, fontSize: "0.75rem", borderBottom: "1px solid #f1f5f9" }}>
                    Date
                  </TableCell>
                  <TableCell sx={{ color: "#94a3b8", fontWeight: 800, fontSize: "0.75rem", borderBottom: "1px solid #f1f5f9" }}>
                    Check In
                  </TableCell>
                  <TableCell sx={{ color: "#94a3b8", fontWeight: 800, fontSize: "0.75rem", borderBottom: "1px solid #f1f5f9" }}>
                    Check Out
                  </TableCell>
                  <TableCell sx={{ color: "#94a3b8", fontWeight: 800, fontSize: "0.75rem", borderBottom: "1px solid #f1f5f9" }}>
                    Status
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentAttendance.length > 0 ? (
                  recentAttendance.slice(0, 5).map((rec) => (
                    <TableRow key={rec.id} sx={{ "&:hover": { bgcolor: "#fafafa" } }}>
                      <TableCell sx={{ borderBottom: "1px solid #f8fafc", py: 1.5, fontWeight: 700, color: "#0f172a" }}>
                        {rec.attendanceDate ? new Date(rec.attendanceDate).toLocaleDateString() : "Today"}
                      </TableCell>
                      <TableCell sx={{ borderBottom: "1px solid #f8fafc", color: "#475569", fontWeight: 600 }}>
                        {rec.checkInTime ? new Date(rec.checkInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                      </TableCell>
                      <TableCell sx={{ borderBottom: "1px solid #f8fafc", color: "#475569", fontWeight: 600 }}>
                        {rec.checkOutTime ? new Date(rec.checkOutTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                      </TableCell>
                      <TableCell sx={{ borderBottom: "1px solid #f8fafc" }}>
                        <Chip
                          label={rec.status || "PRESENT"}
                          size="small"
                          sx={{
                            bgcolor: rec.status === "PRESENT" ? "#ecfdf5" : "#fef3c7",
                            color: rec.status === "PRESENT" ? "#10b981" : "#d97706",
                            fontWeight: 800,
                            fontSize: "0.72rem",
                            borderRadius: "3px",
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} sx={{ py: 3, textAlign: "center", color: "#94a3b8" }}>
                      No past clock-in records found. Clock in above to track your workday.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        {/* CARD 6: LIST EMPLOYEE / COLLABORATORS */}
        <Card
          sx={{
            borderRadius: "3px",
            bgcolor: "#ffffff",
            p: { xs: 2.5, sm: 3.5 },
            border: "1px solid #f1f5f9",
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
            minWidth: 0,
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Typography variant="h6" fontWeight={900} color="#0f172a">
              Collaborators
            </Typography>
            <Button
              component={Link}
              to="/projects"
              endIcon={<ChevronRightIcon sx={{ fontSize: 16 }} />}
              sx={{ color: "#582be8", fontWeight: 800, textTransform: "none", fontSize: "0.82rem", p: 0, borderRadius: "3px" }}
            >
              Projects
            </Button>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {projectMembers.length > 0 ? (
              projectMembers.slice(0, 5).map((emp) => (
                <Box
                  key={emp.id}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: 0.5,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
                    <Avatar sx={{ width: 36, height: 36, borderRadius: "3px", bgcolor: "#582be8", fontSize: "0.85rem" }}>
                      {(emp.employeeName || "C")[0]}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={800} color="#0f172a" noWrap>
                        {emp.employeeName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 600, display: "block" }} noWrap>
                        {emp.roleInProject || emp.designationName || "Team Collaborator"}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))
            ) : (
              <Box sx={{ py: 4, textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  No active project collaborators allotted.
                </Typography>
                <Typography variant="caption" color="#94a3b8" sx={{ mt: 0.5, display: "block" }}>
                  Your team collaborators will appear as projects are allotted to you.
                </Typography>
              </Box>
            )}
          </Box>
        </Card>
      </Box>

      {/* Apply Leave Request Dialog with 3px Edgy Radius */}
      <Dialog
        open={leaveDialogOpen}
        onClose={() => setLeaveDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: "3px", p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, color: "#0f172a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Apply for Leave
          <IconButton size="small" onClick={() => setLeaveDialogOpen(false)} sx={{ borderRadius: "3px" }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <form onSubmit={handleApplyLeave}>
          <DialogContent>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, mb: 2.5 }}>
              <TextField
                select
                fullWidth
                label="Leave Type"
                value={leaveForm.leaveType}
                onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "3px" } }}
              >
                <MenuItem value="CASUAL">Casual Leave</MenuItem>
                <MenuItem value="SICK">Sick Leave</MenuItem>
                <MenuItem value="PAID">Privilege / Paid Leave</MenuItem>
                <MenuItem value="UNPAID">Leave Without Pay (LWP)</MenuItem>
              </TextField>

              <TextField
                type="date"
                fullWidth
                label="Start Date"
                InputLabelProps={{ shrink: true }}
                value={leaveForm.startDate}
                onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "3px" } }}
              />
            </Box>

            <TextField
              type="date"
              fullWidth
              label="End Date"
              InputLabelProps={{ shrink: true }}
              value={leaveForm.endDate}
              onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
              sx={{ mb: 2.5, "& .MuiOutlinedInput-root": { borderRadius: "3px" } }}
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Reason for leave"
              value={leaveForm.reason}
              onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
              required
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "3px" } }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setLeaveDialogOpen(false)} sx={{ fontWeight: 700, textTransform: "none", color: "#64748b", borderRadius: "3px" }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submittingLeave}
              sx={{
                bgcolor: "#582be8",
                borderRadius: "3px",
                px: 3,
                fontWeight: 800,
                textTransform: "none",
                "&:hover": { bgcolor: "#4c24cc" },
              }}
            >
              {submittingLeave ? "Submitting..." : "Submit Leave Request"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
