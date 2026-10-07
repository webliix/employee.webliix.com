import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import LinearProgress from "@mui/material/LinearProgress";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Slider from "@mui/material/Slider";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";

import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AddIcon from "@mui/icons-material/Add";
import EditCalendarIcon from "@mui/icons-material/EditCalendar";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AddTaskIcon from "@mui/icons-material/AddTask";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import SendIcon from "@mui/icons-material/Send";

import { tokens } from "../theme/tokens";
import {
  projectApi,
  type Project,
  type ProjectBillingSummary,
  type ProjectTask,
  type ProjectComment,
} from "../services/projectApi";

export function EmployeeProjectsPage() {
  const [searchParams] = useSearchParams();
  const highlightedProjectId = searchParams.get("projectId") || searchParams.get("highlight");

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Financial Status Modal State
  const [statusProject, setStatusProject] = useState<Project | null>(null);
  const [billingSummary, setBillingSummary] = useState<ProjectBillingSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  // Update Project & Tasks Modal State
  const [updateProject, setUpdateProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [progressVal, setProgressVal] = useState<number>(0);
  const [projectStatus, setProjectStatus] = useState<string>("IN_PROGRESS");
  const [updateNote, setUpdateNote] = useState<string>("");
  const [savingProgress, setSavingProgress] = useState(false);
  const [progressSuccess, setProgressSuccess] = useState<string | null>(null);
  const [progressError, setProgressError] = useState<string | null>(null);

  // Tasks sub-state
  const [projectTasks, setProjectTasks] = useState<ProjectTask[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [newTaskStatus, setNewTaskStatus] = useState("TODO");
  const [creatingTask, setCreatingTask] = useState(false);

  // Comments / Updates sub-state
  const [projectComments, setProjectComments] = useState<ProjectComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await projectApi.getMyProjects();
      setProjects(data);

      if (highlightedProjectId) {
        const found = data.find((p) => String(p.id) === String(highlightedProjectId));
        if (found) {
          handleOpenUpdateModal(found);
        }
      }
    } catch (err) {
      console.error("Error fetching projects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [highlightedProjectId]);

  // Open Update Modal and load its tasks & comments
  const handleOpenUpdateModal = async (project: Project) => {
    setUpdateProject(project);
    setActiveTab(0);
    setProgressVal(project.progressPercentage || 0);
    setProjectStatus(project.status || "IN_PROGRESS");
    setUpdateNote("");
    setProgressSuccess(null);
    setProgressError(null);

    // Fetch tasks & comments for this project
    setLoadingTasks(true);
    setLoadingComments(true);
    try {
      const [tasks, comments] = await Promise.all([
        projectApi.getProjectTasks(project.id),
        projectApi.getProjectComments(project.id),
      ]);
      setProjectTasks(tasks);
      setProjectComments(comments);
    } catch (err) {
      console.error("Error loading project details:", err);
    } finally {
      setLoadingTasks(false);
      setLoadingComments(false);
    }
  };

  const handleSaveProgress = async () => {
    if (!updateProject) return;
    setSavingProgress(true);
    setProgressSuccess(null);
    setProgressError(null);

    try {
      await projectApi.updateProjectProgress(
        updateProject.id,
        progressVal,
        projectStatus,
        updateNote.trim() || undefined
      );

      setProgressSuccess("Project progress & status updated successfully!");
      // Update state in project list
      setProjects((prev) =>
        prev.map((p) =>
          p.id === updateProject.id
            ? { ...p, progressPercentage: progressVal, status: projectStatus }
            : p
        )
      );
      setUpdateProject((prev) =>
        prev ? { ...prev, progressPercentage: progressVal, status: projectStatus } : null
      );
      setUpdateNote("");

      // Refresh comments to see logged progress event
      const updatedComments = await projectApi.getProjectComments(updateProject.id);
      setProjectComments(updatedComments);
    } catch (err: any) {
      setProgressError(err?.response?.data?.message || "Failed to update project progress.");
    } finally {
      setSavingProgress(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateProject || !newTaskTitle.trim()) return;
    setCreatingTask(true);
    try {
      const created = await projectApi.createProjectTask(updateProject.id, {
        title: newTaskTitle.trim(),
        description: newTaskDesc.trim() || undefined,
        status: newTaskStatus,
        dueDate: newTaskDueDate || undefined,
      });
      setProjectTasks((prev) => [created, ...prev]);
      setNewTaskTitle("");
      setNewTaskDesc("");
      setNewTaskDueDate("");
      setNewTaskStatus("TODO");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to create task.");
    } finally {
      setCreatingTask(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId: number, newStatus: any) => {
    if (!updateProject) return;
    try {
      await projectApi.updateTaskStatus(updateProject.id, taskId, { status: newStatus });
      setProjectTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
    } catch (err) {
      console.error("Failed to update task status:", err);
    }
  };

  const handlePostComment = async () => {
    if (!updateProject || !newComment.trim()) return;
    setSubmittingComment(true);
    try {
      const comment = await projectApi.addProjectComment(updateProject.id, newComment.trim());
      setProjectComments((prev) => [comment, ...prev]);
      setNewComment("");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to post update comment.");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleOpenStatusModal = async (project: Project) => {
    setStatusProject(project);
    setLoadingSummary(true);
    const summary = await projectApi.getProjectBilling(project.id);
    setBillingSummary(summary);
    setLoadingSummary(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box>
        <Typography variant="h5" fontWeight={800} sx={{ color: tokens.colors.secondary[900] }}>
          My Assigned Projects & Updates
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748b" }}>
          View your assigned projects, update deliverables and progress, manage project tasks, and generate invoices.
        </Typography>
      </Box>

      {projects.length === 0 ? (
        <Card sx={{ p: 4, textAlign: "center", borderRadius: `${tokens.borderRadius.lg}px` }}>
          <Typography variant="body1" sx={{ color: "#94a3b8" }}>
            No projects currently assigned. Please contact your project manager.
          </Typography>
        </Card>
      ) : (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }, gap: 2.5 }}>
          {projects.map((project) => {
            const isHighlighted = highlightedProjectId && String(project.id) === String(highlightedProjectId);
            return (
              <Card
                key={project.id}
                sx={{
                  borderRadius: `${tokens.borderRadius.lg}px`,
                  boxShadow: tokens.shadows.sm,
                  display: "flex",
                  flexDirection: "column",
                  border: isHighlighted ? `2px solid ${tokens.colors.primary[600]}` : "1px solid #e2e8f0",
                  transition: "box-shadow 0.2s, border-color 0.2s",
                  "&:hover": { boxShadow: tokens.shadows.md },
                }}
              >
                <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 1.5 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Chip label={project.projectCode} size="small" sx={{ fontWeight: 700, bgcolor: tokens.colors.primary[50], color: tokens.colors.primary[700] }} />
                    <Chip
                      label={project.status}
                      size="small"
                      color={
                        project.status === "COMPLETED"
                          ? "success"
                          : project.status === "IN_PROGRESS"
                          ? "primary"
                          : "default"
                      }
                      sx={{ fontWeight: 700 }}
                    />
                  </Box>

                  <Typography variant="h6" fontWeight={700} sx={{ mt: 0.5 }}>
                    {project.projectName}
                  </Typography>

                  {project.description && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#64748b",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {project.description}
                    </Typography>
                  )}

                  {project.customer && (
                    <Box sx={{ p: 1.5, bgcolor: "#f8fafc", borderRadius: `${tokens.borderRadius.sm}px` }}>
                      <Typography variant="caption" sx={{ color: "#94a3b8", display: "block" }}>Client</Typography>
                      <Typography variant="body2" fontWeight={600}>{project.customer.companyName}</Typography>
                    </Box>
                  )}

                  {project.progressPercentage !== undefined && (
                    <Box sx={{ mt: "auto", pt: 1 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                        <Typography variant="caption" sx={{ color: "#64748b" }}>Progress</Typography>
                        <Typography variant="caption" fontWeight={700}>{project.progressPercentage}%</Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={project.progressPercentage || 0}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: "#e2e8f0",
                          "& .MuiLinearProgress-bar": { bgcolor: tokens.colors.primary[600] },
                        }}
                      />
                    </Box>
                  )}

                  {/* Action Buttons */}
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<EditCalendarIcon />}
                    onClick={() => handleOpenUpdateModal(project)}
                    sx={{
                      mt: 1.5,
                      fontWeight: 700,
                      borderRadius: `${tokens.borderRadius.sm}px`,
                      bgcolor: tokens.colors.primary[600],
                      textTransform: "none",
                    }}
                  >
                    Update Progress & Tasks
                  </Button>

                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AccountBalanceWalletIcon />}
                    onClick={() => handleOpenStatusModal(project)}
                    sx={{ fontWeight: 700, borderRadius: `${tokens.borderRadius.sm}px`, textTransform: "none" }}
                  >
                    View Financials
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      {/* ========================================================================= */}
      {/* UPDATE PROJECT & TASKS DIALOG                                             */}
      {/* ========================================================================= */}
      <Dialog
        open={Boolean(updateProject)}
        onClose={() => setUpdateProject(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: `${tokens.borderRadius.lg}px` } }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography variant="h6" fontWeight={800}>
              {updateProject?.projectName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Project Code: <strong>{updateProject?.projectCode}</strong> | Client: <strong>{updateProject?.customer?.companyName || "N/A"}</strong>
            </Typography>
          </Box>
          <Chip
            label={projectStatus}
            color={projectStatus === "COMPLETED" ? "success" : "primary"}
            size="small"
            sx={{ fontWeight: 700 }}
          />
        </DialogTitle>

        <Box sx={{ borderBottom: 1, borderColor: "divider", px: 3 }}>
          <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)}>
            <Tab label="Progress & Status" icon={<EditCalendarIcon />} iconPosition="start" sx={{ fontWeight: 700 }} />
            <Tab label={`Project Tasks (${projectTasks.length})`} icon={<AddTaskIcon />} iconPosition="start" sx={{ fontWeight: 700 }} />
            <Tab label={`Updates & Activity (${projectComments.length})`} icon={<ChatBubbleOutlineIcon />} iconPosition="start" sx={{ fontWeight: 700 }} />
          </Tabs>
        </Box>

        <DialogContent dividers sx={{ minHeight: 340 }}>
          {/* TAB 0: Progress & Status */}
          {activeTab === 0 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3, py: 1 }}>
              {progressSuccess && <Alert severity="success">{progressSuccess}</Alert>}
              {progressError && <Alert severity="error">{progressError}</Alert>}

              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Milestone Progress Completion
                  </Typography>
                  <Typography variant="h6" fontWeight={800} color={tokens.colors.primary.main}>
                    {progressVal}%
                  </Typography>
                </Box>
                <Slider
                  value={progressVal}
                  onChange={(_, val) => setProgressVal(val as number)}
                  min={0}
                  max={100}
                  step={5}
                  valueLabelDisplay="auto"
                  sx={{ color: tokens.colors.primary[600] }}
                />
              </Box>

              <FormControl fullWidth size="small">
                <InputLabel id="status-select-label">Current Project Status</InputLabel>
                <Select
                  labelId="status-select-label"
                  value={projectStatus}
                  label="Current Project Status"
                  onChange={(e) => setProjectStatus(e.target.value)}
                >
                  <MenuItem value="NOT_STARTED">Not Started</MenuItem>
                  <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                  <MenuItem value="TESTING">Testing / QA</MenuItem>
                  <MenuItem value="UNDER_REVIEW">Under Client Review</MenuItem>
                  <MenuItem value="COMPLETED">Completed</MenuItem>
                  <MenuItem value="ON_HOLD">On Hold</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Progress Update Note / Sprint Summary"
                multiline
                rows={3}
                fullWidth
                placeholder="Describe what deliverables or features were accomplished in this update..."
                value={updateNote}
                onChange={(e) => setUpdateNote(e.target.value)}
              />

              <Button
                variant="contained"
                onClick={handleSaveProgress}
                disabled={savingProgress}
                startIcon={savingProgress ? <CircularProgress size={16} /> : <CheckCircleOutlineIcon />}
                sx={{
                  alignSelf: "flex-start",
                  fontWeight: 700,
                  bgcolor: tokens.colors.primary[600],
                  textTransform: "none",
                  borderRadius: `${tokens.borderRadius.md}px`,
                }}
              >
                {savingProgress ? "Saving Update..." : "Save Progress & Status"}
              </Button>
            </Box>
          )}

          {/* TAB 1: Project Tasks */}
          {activeTab === 1 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3, py: 1 }}>
              {/* Quick Add Task */}
              <Box
                component="form"
                onSubmit={handleCreateTask}
                sx={{
                  p: 2,
                  bgcolor: "#f8fafc",
                  borderRadius: `${tokens.borderRadius.md}px`,
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                }}
              >
                <Typography variant="subtitle2" fontWeight={700}>
                  Add New Task to this Project
                </Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "2fr 1fr 1fr" }, gap: 1.5 }}>
                  <TextField
                    label="Task Title"
                    size="small"
                    required
                    placeholder="e.g. Implement dashboard authentication"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                  />
                  <FormControl size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={newTaskStatus}
                      label="Status"
                      onChange={(e) => setNewTaskStatus(e.target.value)}
                    >
                      <MenuItem value="TODO">To Do</MenuItem>
                      <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                      <MenuItem value="REVIEW">Review</MenuItem>
                      <MenuItem value="DONE">Done</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    label="Due Date"
                    type="date"
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                  />
                </Box>
                <TextField
                  label="Description / Technical Notes (Optional)"
                  size="small"
                  multiline
                  rows={2}
                  placeholder="Task specifications or acceptance criteria..."
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={creatingTask || !newTaskTitle.trim()}
                  startIcon={<AddTaskIcon />}
                  sx={{
                    alignSelf: "flex-start",
                    fontWeight: 700,
                    textTransform: "none",
                    borderRadius: `${tokens.borderRadius.sm}px`,
                  }}
                >
                  {creatingTask ? "Adding Task..." : "Add Task"}
                </Button>
              </Box>

              <Divider />

              {/* Tasks List */}
              <Typography variant="subtitle2" fontWeight={700}>
                Existing Project Tasks
              </Typography>

              {loadingTasks ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : projectTasks.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 2 }}>
                  No tasks recorded for this project yet. Add one above!
                </Typography>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {projectTasks.map((task) => (
                    <Box
                      key={task.id}
                      sx={{
                        p: 1.5,
                        borderRadius: `${tokens.borderRadius.sm}px`,
                        bgcolor: "#ffffff",
                        border: "1px solid #e2e8f0",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight={700}>
                          {task.title}
                        </Typography>
                        {task.description && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            {task.description}
                          </Typography>
                        )}
                        {task.dueDate && (
                          <Typography variant="caption" sx={{ color: "#64748b" }}>
                            Due: {task.dueDate}
                          </Typography>
                        )}
                      </Box>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                          value={task.status || "TODO"}
                          onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value)}
                          sx={{ height: 32, fontSize: "0.75rem", fontWeight: 700 }}
                        >
                          <MenuItem value="TODO">To Do</MenuItem>
                          <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                          <MenuItem value="REVIEW">Review</MenuItem>
                          <MenuItem value="DONE">Done</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          )}

          {/* TAB 2: Activity & Updates Log */}
          {activeTab === 2 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, py: 1 }}>
              {/* Add Comment Input */}
              <Box sx={{ display: "flex", gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Add an update note or comment to this project thread..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handlePostComment();
                    }
                  }}
                />
                <Button
                  variant="contained"
                  disabled={submittingComment || !newComment.trim()}
                  onClick={handlePostComment}
                  startIcon={<SendIcon />}
                  sx={{ fontWeight: 700, textTransform: "none" }}
                >
                  Send
                </Button>
              </Box>

              <Divider />

              {/* Comments Feed */}
              {loadingComments ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : projectComments.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 2 }}>
                  No updates or comments posted yet for this project.
                </Typography>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, maxHeight: 320, overflowY: "auto" }}>
                  {projectComments.map((comment) => (
                    <Box
                      key={comment.id}
                      sx={{
                        p: 1.5,
                        borderRadius: `${tokens.borderRadius.sm}px`,
                        bgcolor: "#f8fafc",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                        <Typography variant="caption" fontWeight={700} color={tokens.colors.primary[700]}>
                          {comment.authorName || "Team Member"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(comment.createdAt).toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
                        {comment.comment}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setUpdateProject(null)} sx={{ textTransform: "none", fontWeight: 700 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========================================================================= */}
      {/* FINANCIAL STATUS DIALOG                                                   */}
      {/* ========================================================================= */}
      <Dialog open={Boolean(statusProject)} onClose={() => setStatusProject(null)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          Financial Status — {statusProject?.projectName}
        </DialogTitle>
        <DialogContent dividers>
          {loadingSummary ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <CircularProgress />
            </Box>
          ) : billingSummary ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(4, 1fr)" }, gap: 2 }}>
                <Box sx={{ p: 2, borderRadius: `${tokens.borderRadius.sm}px`, bgcolor: tokens.colors.secondary[50], border: `1px solid ${tokens.colors.secondary[200]}` }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>CONTRACT BUDGET</Typography>
                  <Typography variant="h6" fontWeight={800}>
                    {billingSummary.budget ? `₹${billingSummary.budget.toLocaleString()}` : "Custom"}
                  </Typography>
                </Box>
                <Box sx={{ p: 2, borderRadius: `${tokens.borderRadius.sm}px`, bgcolor: tokens.colors.primary[50], border: `1px solid ${tokens.colors.primary[100]}` }}>
                  <Typography variant="caption" color={tokens.colors.primary[700]} fontWeight={700}>TOTAL BILLED</Typography>
                  <Typography variant="h6" fontWeight={800} color={tokens.colors.primary.main}>
                    ₹{(billingSummary.totalBilled || 0).toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{ p: 2, borderRadius: `${tokens.borderRadius.sm}px`, bgcolor: tokens.colors.success[50], border: `1px solid ${tokens.colors.success[100]}` }}>
                  <Typography variant="caption" color={tokens.colors.success[700]} fontWeight={700}>TOTAL PAID</Typography>
                  <Typography variant="h6" fontWeight={800} color={tokens.colors.success[700]}>
                    ₹{(billingSummary.totalPaid || 0).toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{ p: 2, borderRadius: `${tokens.borderRadius.sm}px`, bgcolor: tokens.colors.warning[50], border: `1px solid ${tokens.colors.warning[100]}` }}>
                  <Typography variant="caption" color={tokens.colors.warning[700]} fontWeight={700}>REMAINING BALANCE</Typography>
                  <Typography variant="h6" fontWeight={800} color={tokens.colors.warning[700]}>
                    ₹{(billingSummary.remainingProjectBalance || 0).toLocaleString()}
                  </Typography>
                </Box>
              </Box>

              <Typography variant="subtitle2" fontWeight={700}>
                Project Invoices ({billingSummary.invoices?.length || 0})
              </Typography>

              {billingSummary.invoices && billingSummary.invoices.length > 0 ? (
                <TableContainer sx={{ border: `1px solid ${tokens.colors.secondary[200]}`, borderRadius: `${tokens.borderRadius.sm}px` }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: tokens.colors.secondary[100] }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Invoice #</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Issue Date</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Paid</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Pending</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {billingSummary.invoices.map((inv: any) => (
                        <TableRow key={inv.id}>
                          <TableCell sx={{ fontWeight: 700 }}>{inv.invoiceNumber}</TableCell>
                          <TableCell>{inv.issueDate || "—"}</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>₹{(inv.totalAmount || 0).toLocaleString()}</TableCell>
                          <TableCell sx={{ color: tokens.colors.success[700] }}>₹{(inv.paidAmount || 0).toLocaleString()}</TableCell>
                          <TableCell sx={{ color: inv.pendingAmount > 0 ? tokens.colors.warning[700] : "text.secondary" }}>
                            ₹{(inv.pendingAmount || 0).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={inv.status}
                              size="small"
                              color={inv.status === "PAID" ? "success" : inv.status === "PARTIALLY_PAID" ? "info" : "warning"}
                              sx={{ fontWeight: 700 }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic", textAlign: "center", py: 2 }}>
                  No invoices generated yet for this project.
                </Typography>
              )}
            </Box>
          ) : (
            <Typography variant="body2" color="error">
              Unable to load project billing details.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setStatusProject(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
