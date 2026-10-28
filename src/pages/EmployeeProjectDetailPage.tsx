import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import Avatar from "@mui/material/Avatar";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Alert from "@mui/material/Alert";
import Checkbox from "@mui/material/Checkbox";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import CircularProgress from "@mui/material/CircularProgress";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Tooltip from "@mui/material/Tooltip";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import TaskOutlinedIcon from "@mui/icons-material/TaskOutlined";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import SendIcon from "@mui/icons-material/Send";
import AddIcon from "@mui/icons-material/Add";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";
import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";

import { tokens } from "../theme/tokens";
import {
  projectApi,
  type Project,
  type ProjectMilestoneItem,
  type ProjectTask,
  type ProjectMemberItem,
  type ProjectWorkLog,
  type ProjectComment,
  type ProjectBillingSummary,
} from "../services/projectApi";

export function EmployeeProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<ProjectMilestoneItem[]>([]);
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [members, setMembers] = useState<ProjectMemberItem[]>([]);
  const [workLogs, setWorkLogs] = useState<ProjectWorkLog[]>([]);
  const [comments, setComments] = useState<ProjectComment[]>([]);
  const [billing, setBilling] = useState<ProjectBillingSummary | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  // Add Task Modal State
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("MEDIUM");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [creatingTask, setCreatingTask] = useState(false);

  // New Comment State
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  const loadProjectData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);

      const [
        projRes,
        msRes,
        tasksRes,
        membersRes,
        logsRes,
        commentsRes,
        billingRes,
      ] = await Promise.allSettled([
        projectApi.getProject(id),
        projectApi.getMilestones(id),
        projectApi.getProjectTasks(id),
        projectApi.getProjectMembers(id),
        projectApi.getProjectWorkLogs(id),
        projectApi.getProjectComments(id),
        projectApi.getProjectBilling(id),
      ]);

      if (projRes.status === "fulfilled" && projRes.value) {
        setProject(projRes.value);
      } else {
        setError("Unable to load project details. It may not exist or access is restricted.");
      }

      if (msRes.status === "fulfilled") setMilestones(msRes.value || []);
      if (tasksRes.status === "fulfilled") setTasks(tasksRes.value || []);
      if (membersRes.status === "fulfilled") setMembers(membersRes.value || []);
      if (logsRes.status === "fulfilled") setWorkLogs(logsRes.value || []);
      if (commentsRes.status === "fulfilled") setComments(commentsRes.value || []);
      if (billingRes.status === "fulfilled") setBilling(billingRes.value);
    } catch (err: any) {
      console.error("Error loading project detail:", err);
      setError(err?.message || "Failed to fetch project details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjectData();
  }, [id]);

  const handleToggleMilestone = async (m: ProjectMilestoneItem) => {
    if (!id) return;
    const nextCompleted = !m.completed;
    try {
      await projectApi.updateMilestone(id, m.id, { completed: nextCompleted });
      setMilestones((prev) =>
        prev.map((item) => (item.id === m.id ? { ...item, completed: nextCompleted } : item))
      );
    } catch (err) {
      console.error("Failed to update milestone:", err);
    }
  };

  const handleUpdateTaskStatus = async (taskId: number, newStatus: string) => {
    if (!id) return;
    try {
      await projectApi.updateTaskStatus(id, taskId, { status: newStatus as any });
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus as any } : t))
      );
    } catch (err) {
      console.error("Failed to update task status:", err);
    }
  };

  const handleCreateTask = async () => {
    if (!id || !newTaskTitle.trim()) return;
    try {
      setCreatingTask(true);
      const created = await projectApi.createProjectTask(id, {
        title: newTaskTitle.trim(),
        description: newTaskDesc.trim() || undefined,
        status: "TODO",
        dueDate: newTaskDueDate || undefined,
      });
      if (created) {
        setTasks((prev) => [...prev, created]);
        setTaskDialogOpen(false);
        setNewTaskTitle("");
        setNewTaskDesc("");
        setNewTaskDueDate("");
      }
    } catch (err) {
      console.error("Failed to create task:", err);
    } finally {
      setCreatingTask(false);
    }
  };

  const handlePostComment = async () => {
    if (!id || !newComment.trim()) return;
    try {
      setSubmittingComment(true);
      const added = await projectApi.addProjectComment(id, newComment.trim());
      if (added) {
        setComments((prev) => [added, ...prev]);
        setNewComment("");
      }
    } catch (err) {
      console.error("Failed to add comment:", err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "COMPLETED":
        return { bg: "#ecfdf5", color: "#047857", border: "#a7f3d0" };
      case "IN_PROGRESS":
        return { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" };
      case "TESTING":
      case "REVIEW":
        return { bg: "#fef3c7", color: "#b45309", border: "#fde68a" };
      case "PLANNING":
        return { bg: "#f3e8ff", color: "#6b21a8", border: "#e9d5ff" };
      default:
        return { bg: "#f1f5f9", color: "#475569", border: "#e2e8f0" };
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority?.toUpperCase()) {
      case "HIGH":
      case "URGENT":
        return { bg: "#fef2f2", color: "#b91c1c", border: "#fecaca" };
      case "MEDIUM":
        return { bg: "#fffbeb", color: "#b45309", border: "#fde68a" };
      case "LOW":
        return { bg: "#ecfdf5", color: "#047857", border: "#a7f3d0" };
      default:
        return { bg: "#f8fafc", color: "#64748b", border: "#e2e8f0" };
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "50vh", gap: 2 }}>
        <CircularProgress size={40} sx={{ color: tokens.colors.primary[600] }} />
        <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 600 }}>
          Loading project workspace...
        </Typography>
      </Box>
    );
  }

  if (error || !project) {
    return (
      <Box sx={{ maxWidth: 700, mx: "auto", mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2, borderRadius: `${tokens.borderRadius.md}px` }}>
          {error || "Project not found."}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          variant="outlined"
          onClick={() => navigate("/projects")}
          sx={{ fontWeight: 700, textTransform: "none" }}
        >
          Return to My Projects
        </Button>
      </Box>
    );
  }

  const statusStyle = getStatusColor(project.status);
  const priorityStyle = getPriorityColor(project.priority);
  const completedMilestones = milestones.filter((m) => m.completed).length;
  const completedTasks = tasks.filter((t) => t.status === "DONE").length;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      {/* Navigation Top Bar */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1.5 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/projects")}
          variant="text"
          sx={{
            fontWeight: 700,
            textTransform: "none",
            color: tokens.colors.secondary[700],
            "&:hover": { color: tokens.colors.primary[600], bgcolor: "rgba(79, 70, 229, 0.04)" },
          }}
        >
          Back to My Projects
        </Button>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Chip
            label={project.projectCode || `PRJ-${project.id}`}
            size="small"
            sx={{
              fontFamily: "monospace",
              fontWeight: 800,
              fontSize: "0.75rem",
              bgcolor: "#f1f5f9",
              color: "#334155",
            }}
          />
          <Chip
            label={project.status ? project.status.replace(/_/g, " ") : "ACTIVE"}
            size="small"
            sx={{
              fontWeight: 800,
              fontSize: "0.72rem",
              bgcolor: statusStyle.bg,
              color: statusStyle.color,
              border: `1px solid ${statusStyle.border}`,
            }}
          />
          {project.priority && (
            <Chip
              label={`${project.priority} PRIORITY`}
              size="small"
              sx={{
                fontWeight: 800,
                fontSize: "0.68rem",
                bgcolor: priorityStyle.bg,
                color: priorityStyle.color,
                border: `1px solid ${priorityStyle.border}`,
              }}
            />
          )}
        </Box>
      </Box>

      {/* Main Project Overview Card */}
      <Card
        sx={{
          borderRadius: `${tokens.borderRadius.lg}px`,
          border: "1px solid #e2e8f0",
          boxShadow: tokens.shadows.sm,
          bgcolor: "#ffffff",
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, justifyContent: "space-between", alignItems: { xs: "flex-start", md: "center" }, gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" fontWeight={800} sx={{ color: tokens.colors.secondary[900], lineHeight: 1.25, mb: 0.75 }}>
                {project.projectName}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
                {(project.customer?.companyName || project.customerCompanyName) && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    <BusinessOutlinedIcon sx={{ fontSize: "1.1rem", color: tokens.colors.primary[600] }} />
                    <Typography variant="body2" fontWeight={700} sx={{ color: "#475569" }}>
                      {project.customer?.companyName || project.customerCompanyName}
                    </Typography>
                  </Box>
                )}
                {project.startDate && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    <CalendarTodayOutlinedIcon sx={{ fontSize: "1rem", color: "#94a3b8" }} />
                    <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
                      Started: {new Date(project.startDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                )}
                {project.expectedEndDate && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    <HourglassEmptyOutlinedIcon sx={{ fontSize: "1rem", color: "#f59e0b" }} />
                    <Typography variant="caption" sx={{ color: "#b45309", fontWeight: 700 }}>
                      Target Delivery: {new Date(project.expectedEndDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Progress KPI Card */}
            <Box
              sx={{
                minWidth: { xs: "100%", md: 240 },
                p: 2,
                borderRadius: `${tokens.borderRadius.md}px`,
                bgcolor: "#f8fafc",
                border: "1px solid #e2e8f0",
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Typography variant="caption" fontWeight={800} sx={{ color: "#64748b", textTransform: "uppercase" }}>
                  Completion Progress
                </Typography>
                <Typography variant="subtitle1" fontWeight={800} sx={{ color: tokens.colors.primary[600] }}>
                  {project.progressPercentage || 0}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={project.progressPercentage || 0}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: "#e2e8f0",
                  "& .MuiLinearProgress-bar": {
                    bgcolor: (project.progressPercentage || 0) >= 100 ? tokens.colors.success[700] : tokens.colors.primary[600],
                    borderRadius: 4,
                  },
                }}
              />
              <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
                <Typography variant="caption" sx={{ color: "#94a3b8", fontSize: "0.7rem" }}>
                  {completedMilestones}/{milestones.length} Phases Done
                </Typography>
                <Typography variant="caption" sx={{ color: "#94a3b8", fontSize: "0.7rem" }}>
                  {completedTasks}/{tasks.length} Tasks Done
                </Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Tabs Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.875rem",
              minHeight: 48,
              py: 1,
            },
            "& .Mui-selected": {
              color: `${tokens.colors.primary[600]} !important`,
            },
            "& .MuiTabs-indicator": {
              backgroundColor: tokens.colors.primary[600],
              height: 3,
              borderRadius: "3px 3px 0 0",
            },
          }}
        >
          <Tab icon={<DescriptionOutlinedIcon />} iconPosition="start" label="Overview & Scope" />
          <Tab icon={<FlagOutlinedIcon />} iconPosition="start" label={`Phases & Milestones (${milestones.length})`} />
          <Tab icon={<TaskOutlinedIcon />} iconPosition="start" label={`Project Tasks (${tasks.length})`} />
          <Tab icon={<PeopleOutlineIcon />} iconPosition="start" label={`Assigned Team (${members.length})`} />
          <Tab icon={<AssignmentTurnedInOutlinedIcon />} iconPosition="start" label={`Daily Logs & Discussions (${workLogs.length + comments.length})`} />
          {billing && (
            <Tab icon={<AccountBalanceWalletOutlinedIcon />} iconPosition="start" label="Financials & Invoices" />
          )}
        </Tabs>
      </Box>

      {/* ========================================================================= */}
      {/* TAB 0: OVERVIEW & SCOPE                                                   */}
      {/* ========================================================================= */}
      {activeTab === 0 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          {/* Project Description Card */}
          <Card sx={{ borderRadius: `${tokens.borderRadius.md}px`, border: "1px solid #e2e8f0", boxShadow: tokens.shadows.xs }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                <DescriptionOutlinedIcon sx={{ color: tokens.colors.primary[600], fontSize: "1.25rem" }} />
                <Typography variant="h6" fontWeight={800} sx={{ color: tokens.colors.secondary[900] }}>
                  Project Description & Requirements Scope
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              {project.description ? (
                <Typography
                  variant="body1"
                  sx={{
                    color: tokens.colors.secondary[800],
                    lineHeight: 1.7,
                    whiteSpace: "pre-wrap",
                    fontSize: "0.9375rem",
                  }}
                >
                  {project.description}
                </Typography>
              ) : (
                <Typography variant="body2" sx={{ color: "#94a3b8", fontStyle: "italic" }}>
                  No written description provided for this project yet. Please check with your project lead.
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Architecture Blueprint & Documentation Specs (if present) */}
          {(project.documentationUrl || project.architectureNotes) && (
            <Card sx={{ borderRadius: `${tokens.borderRadius.md}px`, border: "1px solid #e2e8f0", boxShadow: tokens.shadows.xs }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1, mb: 1.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CodeOutlinedIcon sx={{ color: tokens.colors.primary[600], fontSize: "1.25rem" }} />
                    <Typography variant="h6" fontWeight={800} sx={{ color: tokens.colors.secondary[900] }}>
                      Documentation & Technical Blueprint
                    </Typography>
                  </Box>
                  {project.documentationUrl && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<OpenInNewIcon />}
                      href={project.documentationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ fontWeight: 700, textTransform: "none" }}
                    >
                      Open Live Documentation
                    </Button>
                  )}
                </Box>
                <Divider sx={{ mb: 2 }} />

                {project.architectureNotes && (
                  <Box sx={{ p: 2, borderRadius: `${tokens.borderRadius.sm}px`, bgcolor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                    <Typography variant="caption" fontWeight={800} sx={{ color: "#64748b", textTransform: "uppercase" }}>
                      Architecture Specifications
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#334155", mt: 0.5, whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                      {project.architectureNotes}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}

          {/* Quick Snapshot Metrics Grid */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }, gap: 2 }}>
            <Box sx={{ p: 2, borderRadius: `${tokens.borderRadius.md}px`, bgcolor: "#ffffff", border: "1px solid #e2e8f0" }}>
              <Typography variant="caption" fontWeight={700} sx={{ color: "#64748b", textTransform: "uppercase" }}>
                Lifecycle Phases
              </Typography>
              <Typography variant="h6" fontWeight={800} sx={{ color: tokens.colors.secondary[900], mt: 0.5 }}>
                {completedMilestones} / {milestones.length} Completed
              </Typography>
            </Box>

            <Box sx={{ p: 2, borderRadius: `${tokens.borderRadius.md}px`, bgcolor: "#ffffff", border: "1px solid #e2e8f0" }}>
              <Typography variant="caption" fontWeight={700} sx={{ color: "#64748b", textTransform: "uppercase" }}>
                Project Tasks
              </Typography>
              <Typography variant="h6" fontWeight={800} sx={{ color: tokens.colors.secondary[900], mt: 0.5 }}>
                {completedTasks} / {tasks.length} Resolved
              </Typography>
            </Box>

            <Box sx={{ p: 2, borderRadius: `${tokens.borderRadius.md}px`, bgcolor: "#ffffff", border: "1px solid #e2e8f0" }}>
              <Typography variant="caption" fontWeight={700} sx={{ color: "#64748b", textTransform: "uppercase" }}>
                Assigned Staff
              </Typography>
              <Typography variant="h6" fontWeight={800} sx={{ color: tokens.colors.secondary[900], mt: 0.5 }}>
                {members.length} Team Members
              </Typography>
            </Box>

            <Box sx={{ p: 2, borderRadius: `${tokens.borderRadius.md}px`, bgcolor: "#ffffff", border: "1px solid #e2e8f0" }}>
              <Typography variant="caption" fontWeight={700} sx={{ color: "#64748b", textTransform: "uppercase" }}>
                Daily Logs Logged
              </Typography>
              <Typography variant="h6" fontWeight={800} sx={{ color: tokens.colors.secondary[900], mt: 0.5 }}>
                {workLogs.length} Submissions
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: PHASES & MILESTONES (LIFECYCLE)                                    */}
      {/* ========================================================================= */}
      {activeTab === 1 && (
        <Card sx={{ borderRadius: `${tokens.borderRadius.md}px`, border: "1px solid #e2e8f0", boxShadow: tokens.shadows.xs }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1, mb: 1.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <FlagOutlinedIcon sx={{ color: tokens.colors.primary[600], fontSize: "1.25rem" }} />
                <Box>
                  <Typography variant="h6" fontWeight={800} sx={{ color: tokens.colors.secondary[900] }}>
                    Lifecycle Phases & Milestones ({milestones.length})
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#64748b" }}>
                    Phases defined for project delivery as seen in the admin panel
                  </Typography>
                </Box>
              </Box>
              <Chip
                label={`${completedMilestones} of ${milestones.length} Completed`}
                size="small"
                color={completedMilestones === milestones.length && milestones.length > 0 ? "success" : "default"}
                sx={{ fontWeight: 800 }}
              />
            </Box>
            <Divider sx={{ mb: 2 }} />

            {milestones.length === 0 ? (
              <Box sx={{ p: 4, textAlign: "center", bgcolor: "#f8fafc", borderRadius: 2, border: "1px dashed #cbd5e1" }}>
                <FlagOutlinedIcon sx={{ fontSize: 40, color: "#94a3b8", mb: 1 }} />
                <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 600 }}>
                  No lifecycle milestones or phases registered yet for this project.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {milestones.map((m, index) => {
                  const isDone = Boolean(m.completed);
                  return (
                    <Box
                      key={m.id || index}
                      sx={{
                        p: 2,
                        borderRadius: `${tokens.borderRadius.md}px`,
                        bgcolor: isDone ? "rgba(16, 185, 129, 0.04)" : "#ffffff",
                        border: `1px solid ${isDone ? "#a7f3d0" : "#e2e8f0"}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: 1.5,
                        transition: "all 0.15s ease",
                        "&:hover": {
                          borderColor: isDone ? "#34d399" : tokens.colors.primary[300],
                          boxShadow: tokens.shadows.xs,
                        },
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, flex: 1, minWidth: 260 }}>
                        <Checkbox
                          checked={isDone}
                          onChange={() => handleToggleMilestone(m)}
                          sx={{
                            color: "#cbd5e1",
                            "&.Mui-checked": { color: "#10b981" },
                            p: 0.5,
                            mt: 0.2,
                          }}
                        />
                        <Box>
                          <Typography
                            variant="subtitle2"
                            fontWeight={800}
                            sx={{
                              color: isDone ? "#047857" : tokens.colors.secondary[900],
                              textDecoration: isDone ? "line-through" : "none",
                            }}
                          >
                            {m.title || m.milestoneName || `Phase ${index + 1}`}
                          </Typography>
                          {m.description && (
                            <Typography variant="caption" sx={{ color: "#64748b", display: "block", mt: 0.3 }}>
                              {m.description}
                            </Typography>
                          )}
                        </Box>
                      </Box>

                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        {m.dueDate && (
                          <Chip
                            label={`Due: ${new Date(m.dueDate).toLocaleDateString()}`}
                            size="small"
                            sx={{
                              fontWeight: 700,
                              fontSize: "0.72rem",
                              bgcolor: "#f1f5f9",
                              color: "#475569",
                            }}
                          />
                        )}
                        <Chip
                          label={isDone ? "Completed" : "In Progress"}
                          size="small"
                          color={isDone ? "success" : "default"}
                          sx={{ fontWeight: 800, fontSize: "0.7rem", height: 22 }}
                        />
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: TASKS BREAKDOWN                                                    */}
      {/* ========================================================================= */}
      {activeTab === 2 && (
        <Card sx={{ borderRadius: `${tokens.borderRadius.md}px`, border: "1px solid #e2e8f0", boxShadow: tokens.shadows.xs }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1.5, mb: 1.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <TaskOutlinedIcon sx={{ color: tokens.colors.primary[600], fontSize: "1.25rem" }} />
                <Box>
                  <Typography variant="h6" fontWeight={800} sx={{ color: tokens.colors.secondary[900] }}>
                    Project Tasks Breakdown ({tasks.length})
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#64748b" }}>
                    Manage and update sprint deliverables and assigned technical tasks
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => setTaskDialogOpen(true)}
                sx={{
                  fontWeight: 700,
                  textTransform: "none",
                  borderRadius: `${tokens.borderRadius.sm}px`,
                  bgcolor: tokens.colors.primary[600],
                }}
              >
                Add New Task
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />

            {tasks.length === 0 ? (
              <Box sx={{ p: 4, textAlign: "center", bgcolor: "#f8fafc", borderRadius: 2, border: "1px dashed #cbd5e1" }}>
                <TaskOutlinedIcon sx={{ fontSize: 40, color: "#94a3b8", mb: 1 }} />
                <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 600 }}>
                  No tasks currently recorded under this project.
                </Typography>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => setTaskDialogOpen(true)}
                  sx={{ mt: 1.5, fontWeight: 700, textTransform: "none" }}
                >
                  Create First Task
                </Button>
              </Box>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {tasks.map((task) => {
                  const isDone = task.status === "DONE";
                  return (
                    <Box
                      key={task.id}
                      sx={{
                        p: 2,
                        borderRadius: `${tokens.borderRadius.md}px`,
                        bgcolor: isDone ? "rgba(16, 185, 129, 0.03)" : "#ffffff",
                        border: `1px solid ${isDone ? "#a7f3d0" : "#e2e8f0"}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: 1.5,
                        "&:hover": {
                          borderColor: tokens.colors.primary[300],
                          boxShadow: tokens.shadows.xs,
                        },
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 260 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.3 }}>
                          <Typography
                            variant="subtitle2"
                            fontWeight={800}
                            sx={{
                              color: isDone ? "#047857" : tokens.colors.secondary[900],
                              textDecoration: isDone ? "line-through" : "none",
                            }}
                          >
                            {task.title || task.taskName}
                          </Typography>
                        </Box>
                        {task.description && (
                          <Typography variant="caption" sx={{ color: "#64748b", display: "block" }}>
                            {task.description}
                          </Typography>
                        )}
                        {task.dueDate && (
                          <Typography variant="caption" sx={{ color: "#94a3b8", display: "inline-block", mt: 0.5, mr: 1.5 }}>
                            Target Due: {new Date(task.dueDate).toLocaleDateString()}
                          </Typography>
                        )}
                        {task.assignedTo && (
                          <Typography variant="caption" sx={{ color: tokens.colors.primary[600], fontWeight: 700 }}>
                            Assigned: {task.assignedTo}
                          </Typography>
                        )}
                      </Box>

                      {/* Status Selector */}
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <TextField
                          select
                          size="small"
                          value={task.status || "TODO"}
                          onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value)}
                          sx={{
                            minWidth: 130,
                            "& .MuiSelect-select": {
                              py: 0.75,
                              px: 1.5,
                              fontSize: "0.75rem",
                              fontWeight: 800,
                            },
                          }}
                        >
                          <MenuItem value="TODO">To Do</MenuItem>
                          <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                          <MenuItem value="REVIEW">Under Review</MenuItem>
                          <MenuItem value="DONE">Completed</MenuItem>
                        </TextField>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ASSIGNED TEAM MEMBERS                                              */}
      {/* ========================================================================= */}
      {activeTab === 3 && (
        <Card sx={{ borderRadius: `${tokens.borderRadius.md}px`, border: "1px solid #e2e8f0", boxShadow: tokens.shadows.xs }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
              <PeopleOutlineIcon sx={{ color: tokens.colors.primary[600], fontSize: "1.25rem" }} />
              <Box>
                <Typography variant="h6" fontWeight={800} sx={{ color: tokens.colors.secondary[900] }}>
                  Assigned Project Team ({members.length})
                </Typography>
                <Typography variant="caption" sx={{ color: "#64748b" }}>
                  Staff assigned to collaborate on this deliverable
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ mb: 2 }} />

            {members.length === 0 ? (
              <Box sx={{ p: 4, textAlign: "center", bgcolor: "#f8fafc", borderRadius: 2, border: "1px dashed #cbd5e1" }}>
                <PeopleOutlineIcon sx={{ fontSize: 40, color: "#94a3b8", mb: 1 }} />
                <Typography variant="body2" sx={{ color: "#64748b" }}>
                  No additional staff records registered in the project roster.
                </Typography>
              </Box>
            ) : (
              <TableContainer sx={{ border: "1px solid #e2e8f0", borderRadius: `${tokens.borderRadius.md}px` }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: "#f8fafc" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800 }}>Employee Name</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Project Role</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Department / Designation</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Email Address</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Assigned Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {members.map((m) => (
                      <TableRow key={m.id} hover>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: tokens.colors.primary[600], fontSize: "0.8rem", fontWeight: 700 }}>
                              {m.employeeName ? m.employeeName[0].toUpperCase() : "E"}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={700}>
                                {m.employeeName || "Team Member"}
                              </Typography>
                              {m.employeeCode && (
                                <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                                  {m.employeeCode}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={m.roleInProject || "Contributor"}
                            size="small"
                            sx={{ fontWeight: 700, fontSize: "0.72rem", bgcolor: "#e0e7ff", color: tokens.colors.primary[700] }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: "#475569" }}>
                            {m.designationName || m.departmentName || "Engineering"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" sx={{ color: "#64748b" }}>
                            {m.employeeEmail || "—"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" sx={{ color: "#64748b" }}>
                            {m.assignedDate ? new Date(m.assignedDate).toLocaleDateString() : "—"}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: DAILY LOGS & DISCUSSIONS                                           */}
      {/* ========================================================================= */}
      {activeTab === 4 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          {/* Daily Work Logs Table */}
          <Card sx={{ borderRadius: `${tokens.borderRadius.md}px`, border: "1px solid #e2e8f0", boxShadow: tokens.shadows.xs }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <AssignmentTurnedInOutlinedIcon sx={{ color: tokens.colors.primary[600], fontSize: "1.25rem" }} />
                  <Typography variant="h6" fontWeight={800} sx={{ color: tokens.colors.secondary[900] }}>
                    Daily Work Logs Submitted on this Project ({workLogs.length})
                  </Typography>
                </Box>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => navigate(`/work-logs?projectId=${project.id}`)}
                  sx={{ fontWeight: 700, textTransform: "none" }}
                >
                  Submit Daily Log
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />

              {workLogs.length === 0 ? (
                <Box sx={{ p: 3, textAlign: "center", bgcolor: "#f8fafc", borderRadius: 2 }}>
                  <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                    No daily work submissions logged against this project yet.
                  </Typography>
                </Box>
              ) : (
                <TableContainer sx={{ border: "1px solid #e2e8f0", borderRadius: `${tokens.borderRadius.md}px` }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: "#f8fafc" }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 800 }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Employee</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Work Summary</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Hours/Units</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {workLogs.map((log) => (
                        <TableRow key={log.id} hover>
                          <TableCell sx={{ whiteSpace: "nowrap" }}>
                            {log.logDate ? new Date(log.logDate).toLocaleDateString() : "—"}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>
                            {log.employeeName || "Employee"}
                          </TableCell>
                          <TableCell sx={{ maxWidth: 300 }}>
                            <Typography variant="body2" fontWeight={600}>
                              {log.workSummary}
                            </Typography>
                            {log.tasksCompleted && (
                              <Typography variant="caption" sx={{ color: "#64748b", display: "block" }}>
                                Tasks: {log.tasksCompleted}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell sx={{ whiteSpace: "nowrap" }}>
                            {log.hoursWorked || log.workUnits ? `${log.hoursWorked || log.workUnits} hrs` : "—"}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={log.status}
                              size="small"
                              color={log.status === "APPROVED" ? "success" : log.status === "REJECTED" ? "error" : "warning"}
                              sx={{ fontWeight: 800, fontSize: "0.68rem" }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>

          {/* Project Updates & Comments */}
          <Card sx={{ borderRadius: `${tokens.borderRadius.md}px`, border: "1px solid #e2e8f0", boxShadow: tokens.shadows.xs }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                <ChatBubbleOutlineIcon sx={{ color: tokens.colors.primary[600], fontSize: "1.25rem" }} />
                <Typography variant="h6" fontWeight={800} sx={{ color: tokens.colors.secondary[900] }}>
                  Project Discussion & Instructions ({comments.length})
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: "flex", gap: 1.5, mb: 2.5 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Post an update note or comment regarding this project..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <Button
                  variant="contained"
                  disabled={submittingComment || !newComment.trim()}
                  onClick={handlePostComment}
                  startIcon={<SendIcon />}
                  sx={{
                    fontWeight: 700,
                    textTransform: "none",
                    whiteSpace: "nowrap",
                    bgcolor: tokens.colors.primary[600],
                  }}
                >
                  {submittingComment ? "Posting..." : "Post"}
                </Button>
              </Box>

              {comments.length === 0 ? (
                <Typography variant="body2" sx={{ color: "#94a3b8", textAlign: "center", py: 2 }}>
                  No discussion notes or instructions posted yet.
                </Typography>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {comments.map((c) => (
                    <Box
                      key={c.id}
                      sx={{
                        p: 2,
                        borderRadius: `${tokens.borderRadius.md}px`,
                        bgcolor: "#f8fafc",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                        <Typography variant="subtitle2" fontWeight={800}>
                          {c.authorName || "Team Member"}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                          {c.createdAt ? new Date(c.createdAt).toLocaleString() : ""}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ color: "#334155", lineHeight: 1.5 }}>
                        {c.comment || c.message}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: FINANCIALS & INVOICES (IF PRESENT)                                 */}
      {/* ========================================================================= */}
      {billing && activeTab === 5 && (
        <Card sx={{ borderRadius: `${tokens.borderRadius.md}px`, border: "1px solid #e2e8f0", boxShadow: tokens.shadows.xs }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
              <AccountBalanceWalletOutlinedIcon sx={{ color: tokens.colors.primary[600], fontSize: "1.25rem" }} />
              <Typography variant="h6" fontWeight={800} sx={{ color: tokens.colors.secondary[900] }}>
                Project Financial Health & Invoices
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }, gap: 2, mb: 3 }}>
              <Box sx={{ p: 2, borderRadius: `${tokens.borderRadius.md}px`, bgcolor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                <Typography variant="caption" fontWeight={700} sx={{ color: "#64748b", textTransform: "uppercase" }}>
                  Contract Budget
                </Typography>
                <Typography variant="h6" fontWeight={800} sx={{ mt: 0.5 }}>
                  ₹{(billing.budget || 0).toLocaleString()}
                </Typography>
              </Box>
              <Box sx={{ p: 2, borderRadius: `${tokens.borderRadius.md}px`, bgcolor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                <Typography variant="caption" fontWeight={700} sx={{ color: tokens.colors.primary[600], textTransform: "uppercase" }}>
                  Total Invoiced
                </Typography>
                <Typography variant="h6" fontWeight={800} sx={{ color: tokens.colors.primary[600], mt: 0.5 }}>
                  ₹{(billing.totalBilled || 0).toLocaleString()}
                </Typography>
              </Box>
              <Box sx={{ p: 2, borderRadius: `${tokens.borderRadius.md}px`, bgcolor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                <Typography variant="caption" fontWeight={700} sx={{ color: "#10b981", textTransform: "uppercase" }}>
                  Total Paid
                </Typography>
                <Typography variant="h6" fontWeight={800} sx={{ color: "#047857", mt: 0.5 }}>
                  ₹{(billing.totalPaid || 0).toLocaleString()}
                </Typography>
              </Box>
              <Box sx={{ p: 2, borderRadius: `${tokens.borderRadius.md}px`, bgcolor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                <Typography variant="caption" fontWeight={700} sx={{ color: "#f59e0b", textTransform: "uppercase" }}>
                  Pending Due
                </Typography>
                <Typography variant="h6" fontWeight={800} sx={{ color: "#b45309", mt: 0.5 }}>
                  ₹{(billing.pendingDueOnInvoices || 0).toLocaleString()}
                </Typography>
              </Box>
            </Box>

            {billing.invoices && billing.invoices.length > 0 ? (
              <TableContainer sx={{ border: "1px solid #e2e8f0", borderRadius: `${tokens.borderRadius.md}px` }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: "#f8fafc" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800 }}>Invoice #</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Issue Date</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Due Date</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Total Amount</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Paid</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {billing.invoices.map((inv: any) => (
                      <TableRow key={inv.id} hover>
                        <TableCell sx={{ fontWeight: 800, color: tokens.colors.primary[600] }}>
                          {inv.invoiceNumber}
                        </TableCell>
                        <TableCell>{inv.issueDate ? new Date(inv.issueDate).toLocaleDateString() : "—"}</TableCell>
                        <TableCell>{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "—"}</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>₹{(inv.totalAmount || 0).toLocaleString()}</TableCell>
                        <TableCell sx={{ color: "#047857", fontWeight: 800 }}>₹{(inv.paidAmount || 0).toLocaleString()}</TableCell>
                        <TableCell>
                          <Chip
                            label={inv.status}
                            size="small"
                            color={inv.status === "PAID" ? "success" : "warning"}
                            sx={{ fontWeight: 800 }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" sx={{ color: "#94a3b8", textAlign: "center", py: 2 }}>
                No invoices recorded for this project yet.
              </Typography>
            )}
          </CardContent>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* ADD NEW TASK DIALOG                                                       */}
      {/* ========================================================================= */}
      <Dialog
        open={taskDialogOpen}
        onClose={() => setTaskDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: `${tokens.borderRadius.lg}px` } }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          Create New Project Task
        </DialogTitle>
        <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
          <TextField
            autoFocus
            label="Task Title *"
            fullWidth
            size="small"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="e.g. Implement user dashboard charts and API integration"
          />
          <TextField
            label="Task Description"
            fullWidth
            multiline
            rows={3}
            size="small"
            value={newTaskDesc}
            onChange={(e) => setNewTaskDesc(e.target.value)}
            placeholder="Detailed specifications, ACs, endpoints or notes..."
          />
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <TextField
              select
              label="Priority"
              size="small"
              value={newTaskPriority}
              onChange={(e) => setNewTaskPriority(e.target.value)}
            >
              <MenuItem value="LOW">Low</MenuItem>
              <MenuItem value="MEDIUM">Medium</MenuItem>
              <MenuItem value="HIGH">High</MenuItem>
              <MenuItem value="URGENT">Urgent</MenuItem>
            </TextField>
            <TextField
              label="Due Date"
              type="date"
              size="small"
              InputLabelProps={{ shrink: true }}
              value={newTaskDueDate}
              onChange={(e) => setNewTaskDueDate(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setTaskDialogOpen(false)} sx={{ textTransform: "none", fontWeight: 700 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={creatingTask || !newTaskTitle.trim()}
            onClick={handleCreateTask}
            sx={{
              fontWeight: 700,
              textTransform: "none",
              bgcolor: tokens.colors.primary[600],
            }}
          >
            {creatingTask ? "Creating..." : "Save Task"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default EmployeeProjectDetailPage;
