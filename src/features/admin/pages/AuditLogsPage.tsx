import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import HistoryIcon from "@mui/icons-material/History";
import { http } from "../../../services/http";
import { tokens } from "../../../theme/tokens";

export function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [totalElements, setTotalElements] = useState(0);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await http.get("/api/v1/audit/logs", { params: { page, size: rowsPerPage } });
      const data = res.data?.data;
      if (data?.content) {
        setLogs(data.content);
        setTotalElements(data.totalElements || 0);
      } else if (Array.isArray(data)) {
        setLogs(data);
        setTotalElements(data.length);
      } else {
        setLogs([]);
        setTotalElements(0);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, rowsPerPage]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} sx={{ color: tokens.colors.secondary[900] }}>
            System Audit Trail
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b" }}>
            Immutable security log of authentication events, resource modifications, and RBAC policy evaluations
          </Typography>
        </Box>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      <Card sx={{ borderRadius: `${tokens.borderRadius.lg}px`, boxShadow: tokens.shadows.sm, overflow: "hidden" }}>
        <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
          <Table sx={{ minWidth: 750 }}>
            <TableHead sx={{ bgcolor: "#f8fafc" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Timestamp</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>User</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Action</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Module</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Entity</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>IP Address</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: "center", py: 4 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: "center", py: 4, color: "#94a3b8" }}>
                    No audit records logged
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell sx={{ fontSize: "0.8125rem", whiteSpace: "nowrap" }}>
                      {log.createdAt ? new Date(log.createdAt).toLocaleString() : "-"}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{log.username || log.userId || "System"}</TableCell>
                    <TableCell>
                      <Chip label={log.action} size="small" sx={{ fontWeight: 700, fontSize: "0.6875rem" }} />
                    </TableCell>
                    <TableCell>
                      <Chip label={log.module || "AUTH"} size="small" color="primary" sx={{ fontWeight: 700, fontSize: "0.6875rem" }} />
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.8125rem" }}>
                      {log.entityType ? `${log.entityType} #${log.entityId || ""}` : "-"}
                    </TableCell>
                    <TableCell sx={{ fontFamily: "monospace", fontSize: "0.75rem", color: "#64748b" }}>
                      {log.ipAddress || "-"}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={log.status || "SUCCESS"}
                        size="small"
                        color={log.status === "FAILURE" ? "error" : "success"}
                        sx={{ fontWeight: 700, fontSize: "0.6875rem" }}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={totalElements}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Card>
    </Box>
  );
}
