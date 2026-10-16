import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Divider from "@mui/material/Divider";

import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import HistoryIcon from "@mui/icons-material/History";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import PendingActionsIcon from "@mui/icons-material/PendingActions";

import { tokens } from "../theme/tokens";
import {
  employeeSelfApi,
  type AttendanceRecord,
  type LeaveBalance,
  type LeaveRequest,
} from "../services/employeeSelfApi";

export function EmployeeAttendanceLeavePage() {
  const [currentTab, setCurrentTab] = useState<number>(0);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
  const [attendanceStatus, setAttendanceStatus] = useState<string>("NOT_CLOCKED_IN");
  const [recentAttendance, setRecentAttendance] = useState<AttendanceRecord[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);

  const [loading, setLoading] = useState(true);
  const [clockLoading, setClockLoading] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [submittingLeave, setSubmittingLeave] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [currentTime, setCurrentTime] = useState<string>(
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  );

  const [leaveForm, setLeaveForm] = useState({
    leaveType: "CASUAL",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    reason: "",
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [attRes, balRes, leavesRes] = await Promise.allSettled([
        employeeSelfApi.getAttendance(),
        employeeSelfApi.getLeaveBalances(),
        employeeSelfApi.getLeaves(),
      ]);

      if (attRes.status === "fulfilled" && attRes.value) {
        setTodayAttendance(attRes.value.today);
        setAttendanceStatus(attRes.value.status || "NOT_CLOCKED_IN");
        setRecentAttendance(attRes.value.recent || []);
      }

      if (balRes.status === "fulfilled" && Array.isArray(balRes.value)) {
        setLeaveBalances(balRes.value);
      }

      if (leavesRes.status === "fulfilled" && Array.isArray(leavesRes.value)) {
        setLeaves(leavesRes.value);
      }
    } catch (err) {
      console.error("Failed to load attendance & leaves", err);
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
      setFeedback({ type: "success", message: "Clocked in successfully! Have a great working day." });
      loadData();
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
      loadData();
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
      setFeedback({ type: "success", message: "Leave application submitted for approval." });
      loadData();
    } catch (err: any) {
      setFeedback({ type: "error", message: err?.response?.data?.message || "Failed to apply for leave." });
    } finally {
      setSubmittingLeave(false);
    }
  };

  const getAttendanceStatusBadge = (status: string) => {
    switch (status) {
      case "CLOCKED_IN":
      case "PRESENT":
        return <Chip label="Present / Working" color="success" size="small" sx={{ fontWeight: 700 }} />;
      case "CLOCKED_OUT":
        return <Chip label="Day Completed" color="info" size="small" sx={{ fontWeight: 700 }} />;
      case "HALF_DAY":
        return <Chip label="Half Day" color="warning" size="small" sx={{ fontWeight: 700 }} />;
      case "LATE":
        return <Chip label="Late Check-in" color="warning" size="small" sx={{ fontWeight: 700 }} />;
      case "ON_LEAVE":
        return <Chip label="On Approved Leave" color="secondary" size="small" sx={{ fontWeight: 700 }} />;
      case "ABSENT":
        return <Chip label="Absent" color="error" size="small" sx={{ fontWeight: 700 }} />;
      default:
        return <Chip label="Not Clocked In" color="default" size="small" sx={{ fontWeight: 600 }} />;
    }
  };

  const getLeaveStatusChip = (status: string) => {
    switch (status?.toUpperCase()) {
      case "APPROVED":
        return <Chip icon={<CheckCircleOutlineIcon />} label="Approved" color="success" size="small" sx={{ fontWeight: 700 }} />;
      case "REJECTED":
        return <Chip icon={<CancelOutlinedIcon />} label="Rejected" color="error" size="small" sx={{ fontWeight: 700 }} />;
      default:
        return <Chip icon={<PendingActionsIcon />} label="Pending Review" color="warning" size="small" sx={{ fontWeight: 700 }} />;
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, display: "grid", gap: 3 }}>
      {/* Page Header */}
      <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} color={tokens.colors.secondary[900]}>
            Attendance & Leave Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Daily time tracking, clock-in records, personal leave balances, and absence requests
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddCircleOutlineIcon />}
          onClick={() => setLeaveDialogOpen(true)}
          sx={{ fontWeight: 700, borderRadius: tokens.borderRadius.md }}
        >
          Apply for Leave
        </Button>
      </Box>

      {feedback && (
        <Alert severity={feedback.type} onClose={() => setFeedback(null)} sx={{ borderRadius: tokens.borderRadius.md }}>
          {feedback.message}
        </Alert>
      )}

      {/* Top Section: Daily Clock Card + Leave Quotas Card */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.2fr 1.8fr" }, gap: 3 }}>
        {/* Clock In / Out Card */}
        <Card
          sx={{
            borderRadius: tokens.borderRadius.lg,
            border: `1px solid ${tokens.colors.secondary[200]}`,
            boxShadow: tokens.shadows.sm,
            p: 3,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <AccessTimeFilledIcon sx={{ color: tokens.colors.primary.main, fontSize: 28 }} />
                <Typography variant="h6" fontWeight={700}>
                  Work Day Clock
                </Typography>
              </Box>
              {getAttendanceStatusBadge(attendanceStatus)}
            </Box>

            <Typography variant="h3" fontWeight={800} sx={{ fontFamily: "monospace", color: tokens.colors.secondary[900], my: 1 }}>
              {currentTime}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Today: {new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Check In Time
                </Typography>
                <Typography variant="body1" fontWeight={700} color={tokens.colors.secondary[900]}>
                  {todayAttendance?.checkInTime
                    ? new Date(todayAttendance.checkInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : "—"}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Check Out Time
                </Typography>
                <Typography variant="body1" fontWeight={700} color={tokens.colors.secondary[900]}>
                  {todayAttendance?.checkOutTime
                    ? new Date(todayAttendance.checkOutTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : "—"}
                </Typography>
              </Box>
            </Box>

            {todayAttendance?.workingHours != null && (
              <Box sx={{ mt: 1.5, p: 1.5, bgcolor: tokens.colors.primary[50], borderRadius: tokens.borderRadius.md }}>
                <Typography variant="caption" sx={{ color: tokens.colors.primary[900], fontWeight: 700 }}>
                  Working Hours Logged: {todayAttendance.workingHours.toFixed(2)} hrs
                </Typography>
              </Box>
            )}
          </Box>

          <Box sx={{ display: "flex", gap: 1.5, mt: 3 }}>
            <Button
              variant="contained"
              color="success"
              fullWidth
              startIcon={<LoginIcon />}
              onClick={handleClockIn}
              disabled={clockLoading || attendanceStatus === "CLOCKED_IN"}
              sx={{ fontWeight: 700 }}
            >
              {clockLoading ? <CircularProgress size={20} color="inherit" /> : "Clock In"}
            </Button>
            <Button
              variant="outlined"
              color="error"
              fullWidth
              startIcon={<LogoutIcon />}
              onClick={handleClockOut}
              disabled={clockLoading || attendanceStatus !== "CLOCKED_IN"}
              sx={{ fontWeight: 700 }}
            >
              Clock Out
            </Button>
          </Box>
        </Card>

        {/* Leave Balances Grid Card */}
        <Card
          sx={{
            borderRadius: tokens.borderRadius.lg,
            border: `1px solid ${tokens.colors.secondary[200]}`,
            boxShadow: tokens.shadows.sm,
            p: 3,
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <FactCheckIcon sx={{ color: tokens.colors.primary.main, fontSize: 28 }} />
              <Typography variant="h6" fontWeight={700}>
                Leave Quotas & Balances
              </Typography>
            </Box>
            <Button size="small" variant="text" onClick={loadData} sx={{ fontWeight: 600 }}>
              Refresh
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ py: 4, textAlign: "center" }}>
              <CircularProgress size={32} />
            </Box>
          ) : leaveBalances.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              Standard company leave policy applies. Contact HR if your quota balances are not listed.
            </Alert>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
                gap: 2,
                mt: 1,
              }}
            >
              {leaveBalances.map((b) => (
                <Card
                  key={b.id || b.leaveType}
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: tokens.borderRadius.md,
                    bgcolor: "action.hover",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700} color={tokens.colors.secondary[800]}>
                      {b.leaveType} LEAVE
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Allocated: {b.allocationDays} days
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 2, display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                    <Typography variant="h4" fontWeight={800} color={tokens.colors.primary.main}>
                      {b.remainingDays}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      {b.usedDays} used
                    </Typography>
                  </Box>
                </Card>
              ))}
            </Box>
          )}
        </Card>
      </Box>

      {/* Main Tabs: Attendance Records & Leave Applications */}
      <Card
        sx={{
          borderRadius: tokens.borderRadius.lg,
          border: `1px solid ${tokens.colors.secondary[200]}`,
          boxShadow: tokens.shadows.sm,
          overflow: "hidden",
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}>
          <Tabs value={currentTab} onChange={(_, val) => setCurrentTab(val)} textColor="primary" indicatorColor="primary">
            <Tab
              icon={<HistoryIcon />}
              iconPosition="start"
              label={`Attendance History (${recentAttendance.length})`}
              sx={{ fontWeight: 700 }}
            />
            <Tab
              icon={<EventAvailableIcon />}
              iconPosition="start"
              label={`My Leave Requests (${leaves.length})`}
              sx={{ fontWeight: 700 }}
            />
          </Tabs>
        </Box>

        {/* Tab 0: Attendance Records */}
        {currentTab === 0 && (
          <TableContainer sx={{ overflowX: "auto", width: "100%" }}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead sx={{ bgcolor: tokens.colors.secondary[50] }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Check-In Time</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Check-Out Time</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Total Working Hours</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentAttendance.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ textAlign: "center", py: 4, color: "text.secondary" }}>
                      No attendance records found yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  recentAttendance.map((rec) => (
                    <TableRow key={rec.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {rec.attendanceDate ? new Date(rec.attendanceDate).toLocaleDateString() : "—"}
                      </TableCell>
                      <TableCell>
                        {rec.checkInTime ? new Date(rec.checkInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                      </TableCell>
                      <TableCell>
                        {rec.checkOutTime ? new Date(rec.checkOutTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                      </TableCell>
                      <TableCell>
                        {rec.workingHours != null ? `${rec.workingHours.toFixed(2)} hrs` : "—"}
                      </TableCell>
                      <TableCell>{getAttendanceStatusBadge(rec.status)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Tab 1: Leave Requests */}
        {currentTab === 1 && (
          <TableContainer sx={{ overflowX: "auto", width: "100%" }}>
            <Table sx={{ minWidth: 700 }}>
              <TableHead sx={{ bgcolor: tokens.colors.secondary[50] }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Leave Type</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Start Date</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>End Date</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Reason / Purpose</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Review Notes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leaves.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: "center", py: 4, color: "text.secondary" }}>
                      No leave requests submitted yet. Use "Apply for Leave" above to create one.
                    </TableCell>
                  </TableRow>
                ) : (
                  leaves.map((l) => (
                    <TableRow key={l.id} hover>
                      <TableCell sx={{ fontWeight: 700, color: tokens.colors.primary.main }}>
                        {l.leaveType}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {l.startDate ? new Date(l.startDate).toLocaleDateString() : "—"}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {l.endDate ? new Date(l.endDate).toLocaleDateString() : "—"}
                      </TableCell>
                      <TableCell sx={{ maxWidth: 280, wordBreak: "break-word" }}>
                        {l.reason || "—"}
                      </TableCell>
                      <TableCell>{getLeaveStatusChip(l.status)}</TableCell>
                      <TableCell sx={{ color: "text.secondary", fontSize: "0.8125rem" }}>
                        {l.reviewNotes || "—"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Apply Leave Dialog */}
      <Dialog
        open={leaveDialogOpen}
        onClose={() => setLeaveDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: tokens.borderRadius.lg } }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, pb: 1 }}>
          <AddCircleOutlineIcon color="primary" />
          <Typography variant="h6" fontWeight={700}>
            Apply for Leave of Absence
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Box component="form" id="apply-leave-form" onSubmit={handleApplyLeave} sx={{ display: "grid", gap: 2.5, pt: 1 }}>
            <TextField
              select
              label="Leave Type"
              fullWidth
              size="small"
              value={leaveForm.leaveType}
              onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
              required
            >
              <MenuItem value="CASUAL">Casual Leave</MenuItem>
              <MenuItem value="SICK">Sick / Medical Leave</MenuItem>
              <MenuItem value="ANNUAL">Annual Leave / Vacation</MenuItem>
              <MenuItem value="MATERNITY">Maternity Leave</MenuItem>
              <MenuItem value="PATERNITY">Paternity Leave</MenuItem>
              <MenuItem value="UNPAID">Unpaid Leave</MenuItem>
            </TextField>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              <TextField
                type="date"
                label="Start Date"
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                value={leaveForm.startDate}
                onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                required
              />
              <TextField
                type="date"
                label="End Date"
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                value={leaveForm.endDate}
                onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                required
              />
            </Box>

            <TextField
              label="Reason for Absence"
              multiline
              rows={3}
              fullWidth
              size="small"
              placeholder="State the reason for your leave request..."
              value={leaveForm.reason}
              onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setLeaveDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            type="submit"
            form="apply-leave-form"
            variant="contained"
            disabled={submittingLeave}
            sx={{ fontWeight: 700 }}
          >
            {submittingLeave ? <CircularProgress size={20} /> : "Submit Application"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
export default EmployeeAttendanceLeavePage;
