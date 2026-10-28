import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CloseIcon from "@mui/icons-material/Close";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";

import { tokens } from "../theme/tokens";
import { authService, type EmployeeProfile } from "../services/authService";
import { projectApi, type Project } from "../services/projectApi";
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

export function EmployeeDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { can } = usePermissions();

  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);

  // Attendance & Leaves
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
  const [attendanceStatus, setAttendanceStatus] = useState<string>("NOT_CLOCKED_IN");
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
        promises.push(workLogApi.getMyWorkLogs(0, 5).catch(() => ({ content: [] })));
      }

      const results = await Promise.allSettled(promises);

      const r0 = results[0];
      if (r0 && r0.status === "fulfilled" && r0.value) setProfile(r0.value);

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

  const currentProject = projects[0] || {
    id: 1,
    projectName: "SaaS Finance & Core Portal",
    status: "ON_PROGRESS",
    startDate: "1 October 2026",
    dueDate: "30 October 2026",
    managerName: "Devon Lane",
    leadName: "Irma",
  };

  const teamList = [
    { name: "Bessie Cooper", role: "Product designer", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120" },
    { name: "Guy Hawkins", role: "Product designer", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120" },
    { name: "Irma", role: "Design lead", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120" },
    { name: "Devon Lane", role: "Project manager", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120" },
    { name: "Courtney Henry", role: "Server Engineer", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120" },
  ];

  const employeeSchedules = [
    {
      name: "Courtney Henry",
      team: "Server",
      schedule: "Oct 25 - Nov 15",
      shift: "Night shift",
      shiftType: "orange",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120",
    },
    {
      name: "Albert Flores",
      team: "Programmer",
      schedule: "Oct 25 - Nov 15",
      shift: "Morning shift",
      shiftType: "blue",
      avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120",
    },
    {
      name: "Jerome Bell",
      team: "Designer",
      schedule: "Oct 25 - Nov 15",
      shift: "Morning shift",
      shiftType: "blue",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120",
    },
  ];

  if (loading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <CircularProgress size={36} sx={{ color: "#582be8", mb: 2 }} />
        <Typography variant="body2" color="text.secondary" fontWeight={600}>
          Loading employee overview...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {feedback && (
        <Alert
          severity={feedback.type}
          onClose={() => setFeedback(null)}
          sx={{ borderRadius: "16px", fontWeight: 700 }}
        >
          {feedback.message}
        </Alert>
      )}

      {/* TOP ROW: Duties Card | Profit & Servers Cards | Current Project Card */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1.1fr 1.3fr 1.1fr" },
          gap: 3,
        }}
      >
        {/* CARD 1: DUTIES */}
        <Card
          sx={{
            borderRadius: "28px",
            bgcolor: "#ffffff",
            p: 3,
            border: "1px solid #f1f5f9",
            boxShadow: "0 10px 30px -10px rgba(0,0,0,0.03)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5 }}>
            <Typography variant="h6" fontWeight={900} color="#0f172a">
              Duties
            </Typography>
            <IconButton size="small" sx={{ bgcolor: "#f8fafc", color: "#64748b" }}>
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* On Meeting Blue Sub-Card */}
          <Box
            sx={{
              bgcolor: "#f0f7ff",
              border: "1px solid #e0f0fe",
              borderRadius: "22px",
              p: 2.5,
              mb: 2.5,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
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
                On Meeting
              </Typography>
            </Box>

            {/* Highlighted Meeting Pill */}
            <Box
              sx={{
                bgcolor: "#2563eb",
                color: "#ffffff",
                borderRadius: "16px",
                p: 2,
                mb: 1.5,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                boxShadow: "0 8px 20px -4px rgba(37, 99, 235, 0.35)",
              }}
            >
              <Box>
                <Typography variant="body2" fontWeight={800}>
                  Marketing team
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.85, fontSize: "0.72rem" }}>
                  09:00 am - 11:00 am
                </Typography>
              </Box>
              <NorthEastIcon sx={{ fontSize: 18 }} />
            </Box>

            {/* Secondary Meeting Rows */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 1, px: 0.5 }}>
              <Typography variant="body2" fontWeight={700} color="#0f172a">
                New Candidat
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                09:00 am - 11:00 am
              </Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 1, px: 0.5 }}>
              <Typography variant="body2" fontWeight={700} color="#0f172a">
                New Client
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                09:00 am - 11:00 am
              </Typography>
            </Box>
          </Box>

          {/* Review Resume / Deliverables Green Sub-Card */}
          <Box
            sx={{
              bgcolor: "#f0fdf4",
              border: "1px solid #dcfce7",
              borderRadius: "22px",
              p: 2.5,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
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
                Review resume
              </Typography>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 0.8 }}>
              <Typography variant="body2" fontWeight={700} color="#0f172a">
                Marketing team
              </Typography>
              <Chip
                label="6"
                size="small"
                sx={{ bgcolor: "#dcfce7", color: "#16a34a", fontWeight: 800, height: 22, minWidth: 26 }}
              />
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 0.8 }}>
              <Typography variant="body2" fontWeight={700} color="#0f172a">
                Product design
              </Typography>
              <Chip
                label="10"
                size="small"
                sx={{ bgcolor: "#dcfce7", color: "#16a34a", fontWeight: 800, height: 22, minWidth: 26 }}
              />
            </Box>
          </Box>
        </Card>

        {/* MIDDLE COLUMN: Profit Card + Servers Card */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Profit & Trend Card */}
          <Card
            sx={{
              borderRadius: "28px",
              bgcolor: "#ffffff",
              p: 3,
              border: "1px solid #f1f5f9",
              boxShadow: "0 10px 30px -10px rgba(0,0,0,0.03)",
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                <Typography variant="subtitle1" fontWeight={900} color="#0f172a">
                  Profit
                </Typography>
                <InfoOutlinedIcon sx={{ fontSize: 16, color: "#94a3b8" }} />
              </Box>
              <IconButton size="small">
                <MoreHorizIcon fontSize="small" sx={{ color: "#94a3b8" }} />
              </IconButton>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
              <Typography variant="h4" fontWeight={900} color="#0f172a" letterSpacing="-0.02em">
                $30,666
              </Typography>
              <Chip
                label="↑ 12%"
                size="small"
                sx={{
                  bgcolor: "#ecfdf5",
                  color: "#10b981",
                  fontWeight: 800,
                  fontSize: "0.75rem",
                  height: 24,
                  borderRadius: "9999px",
                }}
              />
            </Box>

            {/* Amber Bar & Trend Line SVG Chart */}
            <Box sx={{ height: 120, width: "100%", position: "relative" }}>
              <svg width="100%" height="100" viewBox="0 0 320 100" preserveAspectRatio="none">
                {/* Vertical Bars */}
                <rect x="15" y="65" width="16" height="35" rx="6" fill="#f97316" />
                <rect x="60" y="50" width="16" height="50" rx="6" fill="#f97316" />
                <rect x="105" y="25" width="16" height="75" rx="6" fill="#f97316" />
                <rect x="150" y="45" width="16" height="55" rx="6" fill="#f97316" />
                <rect x="195" y="30" width="16" height="70" rx="6" fill="#f97316" />
                <rect x="240" y="40" width="16" height="60" rx="6" fill="#f97316" />
                <rect x="285" y="20" width="16" height="80" rx="6" fill="#f97316" />

                {/* Smooth Curve Trend Line */}
                <path
                  d="M 23 60 Q 68 40, 113 22 T 203 26 T 293 15"
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="23" cy="60" r="3.5" fill="#f59e0b" />
                <circle cx="113" cy="22" r="3.5" fill="#f59e0b" />
                <circle cx="203" cy="26" r="3.5" fill="#f59e0b" />
                <circle cx="293" cy="15" r="3.5" fill="#f59e0b" />
              </svg>

              {/* Month Labels */}
              <Box sx={{ display: "flex", justifyContent: "space-between", px: 1, mt: 0.5 }}>
                {["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"].map((m) => (
                  <Typography key={m} variant="caption" sx={{ color: "#94a3b8", fontSize: "0.68rem", fontWeight: 700 }}>
                    {m}
                  </Typography>
                ))}
              </Box>
            </Box>
          </Card>

          {/* Servers Status Card */}
          <Card
            sx={{
              borderRadius: "28px",
              bgcolor: "#ffffff",
              p: 3,
              border: "1px solid #f1f5f9",
              boxShadow: "0 10px 30px -10px rgba(0,0,0,0.03)",
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={900} color="#0f172a">
                Servers
              </Typography>
              <IconButton size="small">
                <MoreHorizIcon fontSize="small" sx={{ color: "#94a3b8" }} />
              </IconButton>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              {/* Status Legend */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#4f46e5" }} />
                  <Typography variant="body2" fontWeight={700} color="#0f172a">
                    Active
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#c084fc" }} />
                  <Typography variant="body2" fontWeight={700} color="#0f172a">
                    Maintenance.
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#0f172a" }} />
                  <Typography variant="body2" fontWeight={700} color="#0f172a">
                    Inactive
                  </Typography>
                </Box>
              </Box>

              {/* Overlapping Circular Bubble Chart */}
              <Box sx={{ position: "relative", width: 140, height: 110, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {/* Large Indigo Circle (70%) */}
                <Box
                  sx={{
                    position: "absolute",
                    left: 10,
                    width: 78,
                    height: 78,
                    borderRadius: "50%",
                    bgcolor: "#4338ca",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 900,
                    fontSize: "0.88rem",
                    boxShadow: "0 6px 16px rgba(67, 56, 202, 0.3)",
                  }}
                >
                  70%
                </Box>
                {/* Medium Lavender Circle (20%) */}
                <Box
                  sx={{
                    position: "absolute",
                    right: 8,
                    top: 10,
                    width: 58,
                    height: 58,
                    borderRadius: "50%",
                    bgcolor: "#c084fc",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 900,
                    fontSize: "0.78rem",
                  }}
                >
                  20%
                </Box>
                {/* Small Dark Circle (10%) */}
                <Box
                  sx={{
                    position: "absolute",
                    right: 25,
                    bottom: 12,
                    width: 42,
                    height: 42,
                    borderRadius: "50%",
                    bgcolor: "#0f172a",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 900,
                    fontSize: "0.68rem",
                  }}
                >
                  10%
                </Box>
              </Box>
            </Box>
          </Card>
        </Box>

        {/* CARD 4: CURRENT PROJECT */}
        <Card
          sx={{
            borderRadius: "28px",
            bgcolor: "#ffffff",
            p: 3,
            border: "1px solid #f1f5f9",
            boxShadow: "0 10px 30px -10px rgba(0,0,0,0.03)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
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
              sx={{ color: "#582be8", fontWeight: 800, textTransform: "none", fontSize: "0.82rem", p: 0 }}
            >
              See all
            </Button>
          </Box>

          {/* Project Details Grid */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2.5, mb: 3 }}>
            <Box>
              <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 700, display: "block", mb: 0.5 }}>
                Project name
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    bgcolor: "#f5f3ff",
                    color: "#582be8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
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
                label="● On progress"
                size="small"
                sx={{
                  bgcolor: "#ecfdf5",
                  color: "#10b981",
                  fontWeight: 800,
                  fontSize: "0.72rem",
                  borderRadius: "9999px",
                }}
              />
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 700, display: "block", mb: 0.5 }}>
                Project manager
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Avatar sx={{ width: 26, height: 26, fontSize: "0.72rem", bgcolor: "#582be8" }}>
                  {(currentProject as any).managerName ? (currentProject as any).managerName[0] : "D"}
                </Avatar>
                <Typography variant="body2" fontWeight={700} color="#0f172a">
                  {(currentProject as any).managerName || "Devon Lane"}
                </Typography>
              </Box>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 700, display: "block", mb: 0.5 }}>
                Design lead
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Avatar sx={{ width: 26, height: 26, fontSize: "0.72rem", bgcolor: "#10b981" }}>
                  {(currentProject as any).leadName ? (currentProject as any).leadName[0] : "I"}
                </Avatar>
                <Typography variant="body2" fontWeight={700} color="#0f172a">
                  {(currentProject as any).leadName || "Irma"}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Team Stack */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 700, display: "block", mb: 1 }}>
              Team
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <AvatarGroup max={4} sx={{ "& .MuiAvatar-root": { width: 30, height: 30, fontSize: "0.75rem", border: "2px solid #ffffff" } }}>
                <Avatar src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80" />
                <Avatar src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80" />
                <Avatar src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80" />
                <Avatar src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80" />
                <Avatar src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80" />
              </AvatarGroup>
              <Typography variant="caption" fontWeight={700} color="#64748b">
                6 people
              </Typography>
            </Box>
          </Box>

          {/* Timeline Dates */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, pt: 1, borderTop: "1px solid #f1f5f9" }}>
            <Box>
              <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 700, display: "block" }}>
                Start date
              </Typography>
              <Typography variant="body2" fontWeight={800} color="#0f172a">
                1 October 2026
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 700, display: "block" }}>
                Due date
              </Typography>
              <Typography variant="body2" fontWeight={800} color="#0f172a">
                30 October 2026
              </Typography>
            </Box>
          </Box>
        </Card>
      </Box>

      {/* BOTTOM ROW: Employee Schedule Table | List Employee */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "2.4fr 1.1fr" },
          gap: 3,
        }}
      >
        {/* CARD 5: EMPLOYEE SCHEDULE TABLE */}
        <Card
          sx={{
            borderRadius: "28px",
            bgcolor: "#ffffff",
            p: 3.5,
            border: "1px solid #f1f5f9",
            boxShadow: "0 10px 30px -10px rgba(0,0,0,0.03)",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
            <Box>
              <Typography variant="h6" fontWeight={900} color="#0f172a" gutterBottom>
                Employee Schedule
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage all existing schedules or add a new schedule
              </Typography>
            </Box>
            <Button
              onClick={() => setLeaveDialogOpen(true)}
              variant="contained"
              startIcon={<AddIcon sx={{ fontSize: 18 }} />}
              sx={{
                bgcolor: "#582be8",
                color: "#ffffff",
                borderRadius: "9999px",
                px: 2.5,
                py: 1,
                fontSize: "0.82rem",
                fontWeight: 800,
                textTransform: "none",
                boxShadow: "0 6px 18px -2px rgba(88, 43, 232, 0.35)",
                "&:hover": { bgcolor: "#4c24cc" },
              }}
            >
              Add schedule
            </Button>
          </Box>

          {/* Quick Real Attendance Clock Bar */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              bgcolor: "#f8fafc",
              p: 2,
              borderRadius: "18px",
              mb: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <AccessTimeIcon sx={{ color: attendanceStatus === "CLOCKED_IN" ? "#10b981" : "#64748b" }} />
              <Box>
                <Typography variant="body2" fontWeight={800} color="#0f172a">
                  Attendance Status:{" "}
                  <Typography component="span" fontWeight={900} color={attendanceStatus === "CLOCKED_IN" ? "#10b981" : "#64748b"}>
                    {attendanceStatus === "CLOCKED_IN" ? "Clocked In (Active)" : "Not Clocked In"}
                  </Typography>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {todayAttendance?.checkInTime ? `Today's check-in: ${new Date(todayAttendance.checkInTime).toLocaleTimeString()}` : "Ready to log today's shift?"}
                </Typography>
              </Box>
            </Box>

            {attendanceStatus === "CLOCKED_IN" ? (
              <Button
                variant="outlined"
                color="error"
                disabled={clockLoading}
                onClick={handleClockOut}
                sx={{ borderRadius: "9999px", fontWeight: 800, textTransform: "none", px: 2.5 }}
              >
                {clockLoading ? "Clocking out..." : "Clock Out"}
              </Button>
            ) : (
              <Button
                variant="contained"
                disabled={clockLoading}
                onClick={handleClockIn}
                sx={{ bgcolor: "#10b981", borderRadius: "9999px", fontWeight: 800, textTransform: "none", px: 2.5, "&:hover": { bgcolor: "#059669" } }}
              >
                {clockLoading ? "Clocking in..." : "Clock In"}
              </Button>
            )}
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: "#94a3b8", fontWeight: 800, fontSize: "0.75rem", borderBottom: "1px solid #f1f5f9" }}>
                    Name
                  </TableCell>
                  <TableCell sx={{ color: "#94a3b8", fontWeight: 800, fontSize: "0.75rem", borderBottom: "1px solid #f1f5f9" }}>
                    Team
                  </TableCell>
                  <TableCell sx={{ color: "#94a3b8", fontWeight: 800, fontSize: "0.75rem", borderBottom: "1px solid #f1f5f9" }}>
                    Schedule
                  </TableCell>
                  <TableCell sx={{ color: "#94a3b8", fontWeight: 800, fontSize: "0.75rem", borderBottom: "1px solid #f1f5f9" }}>
                    Priod
                  </TableCell>
                  <TableCell align="right" sx={{ color: "#94a3b8", fontWeight: 800, fontSize: "0.75rem", borderBottom: "1px solid #f1f5f9" }}>
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employeeSchedules.map((emp) => (
                  <TableRow key={emp.name} sx={{ "&:hover": { bgcolor: "#fafafa" } }}>
                    <TableCell sx={{ borderBottom: "1px solid #f8fafc", py: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Avatar src={emp.avatar} sx={{ width: 34, height: 34 }} />
                        <Typography variant="body2" fontWeight={800} color="#0f172a">
                          {emp.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ borderBottom: "1px solid #f8fafc", color: "#475569", fontWeight: 700, fontSize: "0.85rem" }}>
                      {emp.team}
                    </TableCell>
                    <TableCell sx={{ borderBottom: "1px solid #f8fafc", color: "#475569", fontWeight: 700, fontSize: "0.85rem" }}>
                      {emp.schedule}
                    </TableCell>
                    <TableCell sx={{ borderBottom: "1px solid #f8fafc" }}>
                      <Chip
                        label={emp.shift}
                        size="small"
                        sx={{
                          bgcolor: emp.shiftType === "orange" ? "#fff7ed" : "#eff6ff",
                          color: emp.shiftType === "orange" ? "#ea580c" : "#2563eb",
                          border: `1px solid ${emp.shiftType === "orange" ? "#ffedd5" : "#dbeafe"}`,
                          fontWeight: 800,
                          fontSize: "0.74rem",
                          borderRadius: "9999px",
                          px: 0.5,
                        }}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ borderBottom: "1px solid #f8fafc" }}>
                      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
                        <IconButton size="small" sx={{ color: "#64748b", bgcolor: "#f8fafc", "&:hover": { bgcolor: "#ede9fe", color: "#582be8" } }}>
                          <EditOutlinedIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                        <IconButton size="small" sx={{ color: "#64748b", bgcolor: "#f8fafc" }}>
                          <MoreHorizIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        {/* CARD 6: LIST EMPLOYEE */}
        <Card
          sx={{
            borderRadius: "28px",
            bgcolor: "#ffffff",
            p: 3.5,
            border: "1px solid #f1f5f9",
            boxShadow: "0 10px 30px -10px rgba(0,0,0,0.03)",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Typography variant="h6" fontWeight={900} color="#0f172a">
              List Employee
            </Typography>
            <Button
              component={Link}
              to="/employees"
              endIcon={<ChevronRightIcon sx={{ fontSize: 16 }} />}
              sx={{ color: "#582be8", fontWeight: 800, textTransform: "none", fontSize: "0.82rem", p: 0 }}
            >
              See more
            </Button>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.2 }}>
            {teamList.map((emp) => (
              <Box
                key={emp.name}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  p: 0.5,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Avatar src={emp.avatar} sx={{ width: 38, height: 38 }} />
                  <Box>
                    <Typography variant="body2" fontWeight={800} color="#0f172a">
                      {emp.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 600 }}>
                      {emp.role}
                    </Typography>
                  </Box>
                </Box>
                <IconButton size="small" sx={{ color: "#94a3b8", bgcolor: "#f8fafc" }}>
                  <MoreHorizIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            ))}
          </Box>
        </Card>
      </Box>

      {/* Leave Request Dialog */}
      <Dialog
        open={leaveDialogOpen}
        onClose={() => setLeaveDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: "24px", p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, color: "#0f172a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Apply for Leave
          <IconButton size="small" onClick={() => setLeaveDialogOpen(false)}>
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
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "14px" } }}
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
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "14px" } }}
              />
            </Box>

            <TextField
              type="date"
              fullWidth
              label="End Date"
              InputLabelProps={{ shrink: true }}
              value={leaveForm.endDate}
              onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
              sx={{ mb: 2.5, "& .MuiOutlinedInput-root": { borderRadius: "14px" } }}
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Reason for leave"
              value={leaveForm.reason}
              onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
              required
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "14px" } }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setLeaveDialogOpen(false)} sx={{ fontWeight: 700, textTransform: "none", color: "#64748b" }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submittingLeave}
              sx={{
                bgcolor: "#582be8",
                borderRadius: "9999px",
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
