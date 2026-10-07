import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import CircularProgress from "@mui/material/CircularProgress";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Divider from "@mui/material/Divider";
import AddIcon from "@mui/icons-material/Add";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";

import { tokens } from "../theme/tokens";
import { workLogApi, type WorkLog } from "../services/workLogApi";
import { projectApi, type Project, type ProjectTask } from "../services/projectApi";

export function EmployeeWorkLogsPage() {
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [logDate, setLogDate] = useState(new Date().toISOString().split("T")[0]);
  const [projectId, setProjectId] = useState<number | "">("");
  const [hoursWorked, setHoursWorked] = useState<number | "">("");
  const [workSummary, setWorkSummary] = useState("");
  const [tasksCompleted, setTasksCompleted] = useState("");
  const [blockers, setBlockers] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Project tasks selection state
  const [projectTasks, setProjectTasks] = useState<ProjectTask[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [newProjectTaskTitle, setNewProjectTaskTitle] = useState("");
  const [creatingTask, setCreatingTask] = useState(false);

  // Details Modal State
  const [selectedLog, setSelectedLog] = useState<WorkLog | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [logsRes, projRes] = await Promise.all([
        workLogApi.getMyWorkLogs(0, 50),
        projectApi.getMyProjects(),
      ]);
      setWorkLogs(logsRes.content || []);
      setProjects(projRes || []);
    } catch (err) {
      console.error("Error fetching work logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // When project changes in form, fetch that project's tasks
  const handleProjectChange = async (newProjId: number | "") => {
    setProjectId(newProjId);
    if (newProjId) {
      setLoadingTasks(true);
      try {
        const tasks = await projectApi.getProjectTasks(Number(newProjId));
        setProjectTasks(tasks);
      } catch (err) {
        console.error("Failed to load project tasks", err);
        setProjectTasks([]);
      } finally {
        setLoadingTasks(false);
      }
    } else {
      setProjectTasks([]);
    }
  };

  const handleToggleTask = (taskTitle: string) => {
    const lines = tasksCompleted ? tasksCompleted.split("\n").filter((l) => l.trim()) : [];
    const itemBullet = `• ${taskTitle}`;
    const exists = lines.some((l) => l.includes(taskTitle));

    let updated: string[];
    if (exists) {
      updated = lines.filter((l) => !l.includes(taskTitle));
    } else {
      updated = [...lines, itemBullet];
    }
    setTasksCompleted(updated.join("\n"));
  };

  const handleAddNewTaskToProject = async () => {
    if (!projectId || !newProjectTaskTitle.trim()) return;
    setCreatingTask(true);
    try {
      const created = await projectApi.createProjectTask(Number(projectId), {
        title: newProjectTaskTitle.trim(),
        status: "DONE",
      });
      setProjectTasks((prev) => [...prev, created]);

      // Automatically add to completed tasks text
      const lines = tasksCompleted ? tasksCompleted.split("\n").filter((l) => l.trim()) : [];
      lines.push(`• ${created.title} (Newly Completed)`);
      setTasksCompleted(lines.join("\n"));

      setNewProjectTaskTitle("");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to create task on project.");
    } finally {
      setCreatingTask(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await workLogApi.submitWorkLog({
        logDate,
        workSummary,
        hoursWorked: hoursWorked ? Number(hoursWorked) : undefined,
        projectId: projectId ? Number(projectId) : undefined,
        tasksCompleted: tasksCompleted || undefined,
        blockers: blockers || undefined,
      });

      setOpenModal(false);
      // Reset form
      setWorkSummary("");
      setTasksCompleted("");
      setBlockers("");
      setHoursWorked("");
      setProjectId("");
      setProjectTasks([]);
      fetchData();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to submit work log.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} sx={{ color: tokens.colors.secondary[900] }}>
            Daily Work Reporting
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b" }}>
            Submit end-of-day progress reports and link completed tasks to your assigned projects. Reports are reviewed by administrators.
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={() => {
            setOpenModal(true);
            setError(null);
          }}
          startIcon={<AssignmentTurnedInIcon />}
          sx={{
            bgcolor: tokens.colors.primary[600],
            textTransform: "none",
            fontWeight: 700,
            borderRadius: `${tokens.borderRadius.md}px`,
          }}
        >
          + New Daily Log
        </Button>
      </Box>

      {/* Work Logs Table */}
      <Card sx={{ borderRadius: `${tokens.borderRadius.lg}px`, boxShadow: tokens.shadows.sm }}>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
              <CircularProgress />
            </Box>
          ) : workLogs.length === 0 ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="body1" sx={{ color: "#94a3b8" }}>
                No daily logs recorded yet. Click above to submit today's work summary.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: "#f8fafc" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Project</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Work Summary</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Tasks Accomplished</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Hours</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Review Notes</TableCell>
                    <TableCell sx={{ fontWeight: 700, textAlign: "right" }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {workLogs.map((log) => (
                    <TableRow key={log.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{log.logDate}</TableCell>
                      <TableCell>
                        <Chip
                          label={log.projectName || "General Activity"}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            bgcolor: log.projectName ? tokens.colors.primary[50] : "#f1f5f9",
                            color: log.projectName ? tokens.colors.primary[700] : "#64748b",
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ maxWidth: 240 }}>
                        <Typography variant="body2" noWrap>{log.workSummary}</Typography>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 220 }}>
                        {log.tasksCompleted ? (
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#334155",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              whiteSpace: "pre-line",
                            }}
                          >
                            {log.tasksCompleted}
                          </Typography>
                        ) : (
                          <Typography variant="caption" color="text.secondary">—</Typography>
                        )}
                      </TableCell>
                      <TableCell>{log.hoursWorked ? `${log.hoursWorked} hrs` : "-"}</TableCell>
                      <TableCell>
                        <Chip
                          label={log.status}
                          size="small"
                          color={log.status === "APPROVED" ? "success" : log.status === "REJECTED" ? "error" : "warning"}
                          sx={{ fontWeight: 700, fontSize: "0.75rem" }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: "#64748b" }}>
                        {log.reviewNotes || "-"}
                      </TableCell>
                      <TableCell sx={{ textAlign: "right" }}>
                        <Button
                          size="small"
                          onClick={() => setSelectedLog(log)}
                          sx={{ textTransform: "none", fontWeight: 700, fontSize: "0.75rem" }}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* View Work Log Detail Modal */}
      <Dialog open={Boolean(selectedLog)} onClose={() => setSelectedLog(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          Work Log — {selectedLog?.logDate}
        </DialogTitle>
        <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: `${tokens.borderRadius.md}px` }}>
            <Typography variant="caption" color="text.secondary" fontWeight={700}>PROJECT</Typography>
            <Typography variant="body1" fontWeight={700}>{selectedLog?.projectName || "General Activity"}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>HOURS LOGGED</Typography>
            <Typography variant="body2">{selectedLog?.hoursWorked ? `${selectedLog.hoursWorked} hours` : "Not specified"}</Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>Work Summary</Typography>
            <Typography variant="body2" sx={{ whiteSpace: "pre-line", bgcolor: "#fff", p: 1.5, border: "1px solid #e2e8f0", borderRadius: 1 }}>
              {selectedLog?.workSummary}
            </Typography>
          </Box>

          {selectedLog?.tasksCompleted && (
            <Box>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>Tasks Completed</Typography>
              <Typography variant="body2" sx={{ whiteSpace: "pre-line", bgcolor: "#f0fdf4", p: 1.5, border: "1px solid #bbf7d0", borderRadius: 1 }}>
                {selectedLog.tasksCompleted}
              </Typography>
            </Box>
          )}

          {selectedLog?.blockers && (
            <Box>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>Blockers & Roadblocks</Typography>
              <Typography variant="body2" sx={{ whiteSpace: "pre-line", bgcolor: "#fef2f2", p: 1.5, border: "1px solid #fecaca", borderRadius: 1 }}>
                {selectedLog.blockers}
              </Typography>
            </Box>
          )}

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pt: 1 }}>
            <Chip
              label={`Status: ${selectedLog?.status}`}
              color={selectedLog?.status === "APPROVED" ? "success" : selectedLog?.status === "REJECTED" ? "error" : "warning"}
              sx={{ fontWeight: 700 }}
            />
            {selectedLog?.reviewedBy && (
              <Typography variant="caption" color="text.secondary">
                Reviewed by {selectedLog.reviewedBy}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSelectedLog(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Submit Work Log Dialog */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Submit Daily Work Log</DialogTitle>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {error && <Alert severity="error">{error}</Alert>}

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              <TextField
                label="Work Date"
                type="date"
                fullWidth
                required
                value={logDate}
                onChange={(e) => setLogDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />

              <FormControl fullWidth>
                <InputLabel id="project-select-label">Associated Project</InputLabel>
                <Select
                  labelId="project-select-label"
                  value={projectId}
                  label="Associated Project"
                  onChange={(e) => handleProjectChange(e.target.value as any)}
                >
                  <MenuItem value=""><em>None / General Activity</em></MenuItem>
                  {projects.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.projectName} ({p.projectCode})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <TextField
              label="Hours Worked"
              type="number"
              inputProps={{ min: 0, max: 24, step: 0.5 }}
              fullWidth
              value={hoursWorked}
              onChange={(e) => setHoursWorked(e.target.value as any)}
            />

            <TextField
              label="Work Summary / Key Accomplishments"
              multiline
              rows={3}
              fullWidth
              required
              placeholder="Detailed summary of your contributions and deliverables today..."
              value={workSummary}
              onChange={(e) => setWorkSummary(e.target.value)}
            />

            {/* Project Tasks Checklist & Quick Add (if project selected) */}
            {Boolean(projectId) && (
              <Box
                sx={{
                  p: 2,
                  bgcolor: "#f8fafc",
                  border: `1px solid ${tokens.colors.primary[200]}`,
                  borderRadius: `${tokens.borderRadius.md}px`,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="subtitle2" fontWeight={700} color={tokens.colors.primary[700]}>
                    Project Tasks Associated with this Report
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Select tasks you worked on to link them automatically
                  </Typography>
                </Box>

                {loadingTasks ? (
                  <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                    <CircularProgress size={20} />
                  </Box>
                ) : projectTasks.length > 0 ? (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, maxHeight: 150, overflowY: "auto" }}>
                    {projectTasks.map((t) => {
                      const isSelected = tasksCompleted.includes(t.title);
                      return (
                        <Chip
                          key={t.id}
                          label={t.title}
                          color={isSelected ? "primary" : "default"}
                          variant={isSelected ? "filled" : "outlined"}
                          onClick={() => handleToggleTask(t.title)}
                          sx={{ fontWeight: 600, cursor: "pointer" }}
                        />
                      );
                    })}
                  </Box>
                ) : (
                  <Typography variant="caption" color="text.secondary">
                    No active tasks currently defined for this project.
                  </Typography>
                )}

                <Divider sx={{ my: 0.5 }} />

                {/* Add new task to project directly from report */}
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  <TextField
                    size="small"
                    placeholder="Add a new task directly to this project..."
                    fullWidth
                    value={newProjectTaskTitle}
                    onChange={(e) => setNewProjectTaskTitle(e.target.value)}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleAddNewTaskToProject}
                    disabled={creatingTask || !newProjectTaskTitle.trim()}
                    startIcon={<AddIcon />}
                    sx={{ textTransform: "none", fontWeight: 700, whiteSpace: "nowrap" }}
                  >
                    {creatingTask ? "Adding..." : "Add to Project"}
                  </Button>
                </Box>
              </Box>
            )}

            <TextField
              label="Tasks Completed Details / Bullets"
              multiline
              rows={3}
              fullWidth
              placeholder="Tasks accomplished (auto-populated by selecting above, or type custom task bullets)..."
              value={tasksCompleted}
              onChange={(e) => setTasksCompleted(e.target.value)}
              helperText="This list is visible to both administrators in the CRM and yourself."
            />

            <TextField
              label="Blockers or Dependencies (Optional)"
              multiline
              rows={2}
              fullWidth
              placeholder="Any roadblocks blocking your next steps or requiring management assistance?"
              value={blockers}
              onChange={(e) => setBlockers(e.target.value)}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setOpenModal(false)} sx={{ textTransform: "none" }}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              sx={{ bgcolor: tokens.colors.primary[600], textTransform: "none", fontWeight: 700 }}
            >
              {submitting ? "Submitting Report..." : "Submit Daily Report"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
