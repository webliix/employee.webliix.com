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
import { tokens } from "../theme/tokens";
import { workLogApi, type WorkLog } from "../services/workLogApi";
import { projectApi, type Project } from "../services/projectApi";

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
            Submit and review your end-of-day progress reports
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={() => setOpenModal(true)}
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
                    <TableCell sx={{ fontWeight: 700 }}>Summary</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Hours</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Review Notes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {workLogs.map((log) => (
                    <TableRow key={log.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{log.logDate}</TableCell>
                      <TableCell>{log.projectName || "General Activity"}</TableCell>
                      <TableCell sx={{ maxWidth: 300 }}>
                        <Typography variant="body2" noWrap>{log.workSummary}</Typography>
                      </TableCell>
                      <TableCell>{log.hoursWorked ? `${log.hoursWorked} hrs` : "-"}</TableCell>
                      <TableCell>
                        <Chip
                          label={log.status}
                          size="small"
                          color={log.status === "APPROVED" ? "success" : log.status === "REJECTED" ? "error" : "default"}
                          sx={{ fontWeight: 700, fontSize: "0.75rem" }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: "#64748b" }}>
                        {log.reviewNotes || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Submit Work Log Dialog */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Submit Daily Work Log</DialogTitle>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {error && <Alert severity="error">{error}</Alert>}

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
              <InputLabel id="project-select-label">Associated Project (Optional)</InputLabel>
              <Select
                labelId="project-select-label"
                value={projectId}
                label="Associated Project (Optional)"
                onChange={(e) => setProjectId(e.target.value as any)}
              >
                <MenuItem value=""><em>None / General Overhead</em></MenuItem>
                {projects.map((p) => (
                  <MenuItem key={p.id} value={p.id}>{p.projectName}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Hours Worked"
              type="number"
              inputProps={{ min: 0, max: 24, step: 0.5 }}
              fullWidth
              value={hoursWorked}
              onChange={(e) => setHoursWorked(e.target.value as any)}
            />

            <TextField
              label="Work Summary / Achievements"
              multiline
              rows={3}
              fullWidth
              required
              placeholder="What did you complete today?"
              value={workSummary}
              onChange={(e) => setWorkSummary(e.target.value)}
            />

            <TextField
              label="Tasks Completed Details (Optional)"
              multiline
              rows={2}
              fullWidth
              value={tasksCompleted}
              onChange={(e) => setTasksCompleted(e.target.value)}
            />

            <TextField
              label="Blockers or Dependencies (Optional)"
              multiline
              rows={2}
              fullWidth
              placeholder="Any roadblocks blocking your next steps?"
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
              {submitting ? "Submitting..." : "Submit Report"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
