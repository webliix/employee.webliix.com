import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
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
import AddIcon from "@mui/icons-material/Add";
import { http } from "../../../services/http";
import { tokens } from "../../../theme/tokens";
import { Can } from "../../../components/Can";

export function PayrollPage() {
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  const fetchPayrolls = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await http.get("/api/v1/payrolls", { params: { page, size: rowsPerPage } });
      const data = res.data?.data;
      if (data?.content) {
        setPayrolls(data.content);
        setTotalElements(data.totalElements || 0);
      } else if (Array.isArray(data)) {
        setPayrolls(data);
        setTotalElements(data.length);
      } else {
        setPayrolls([]);
        setTotalElements(0);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load payroll records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrolls();
  }, [page, rowsPerPage]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} sx={{ color: tokens.colors.secondary[900] }}>
            Payroll & Disbursements
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b" }}>
            Monthly salary distribution, deductions, and payslip management
          </Typography>
        </Box>
        <Can permission="PAYROLL_MANAGE">
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => alert("Generate payroll batch")}
            sx={{
              bgcolor: tokens.colors.primary[600],
              textTransform: "none",
              fontWeight: 700,
              borderRadius: `${tokens.borderRadius.md}px`,
              "&:hover": { bgcolor: tokens.colors.primary[700] },
            }}
          >
            Generate Payroll Batch
          </Button>
        </Can>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      <Card sx={{ borderRadius: `${tokens.borderRadius.lg}px`, boxShadow: tokens.shadows.sm, overflow: "hidden" }}>
        <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
          <Table sx={{ minWidth: 700 }}>
            <TableHead sx={{ bgcolor: "#f8fafc" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Employee</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Period</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Basic Salary</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Allowances</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Deductions</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Net Payout</TableCell>
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
              ) : payrolls.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: "center", py: 4, color: "#94a3b8" }}>
                    No payroll disbursements recorded
                  </TableCell>
                </TableRow>
              ) : (
                payrolls.map((p) => (
                  <TableRow key={p.id} hover>
                    <TableCell sx={{ fontWeight: 700 }}>
                      {p.employeeName || p.employeeCode || `EMP-${p.employeeId}`}
                    </TableCell>
                    <TableCell>{p.month ? `${p.month} ${p.year || ""}` : "-"}</TableCell>
                    <TableCell>${Number(p.basicSalary || 0).toLocaleString()}</TableCell>
                    <TableCell sx={{ color: "#16a34a" }}>+${Number(p.allowances || 0).toLocaleString()}</TableCell>
                    <TableCell sx={{ color: "#dc2626" }}>-${Number(p.deductions || 0).toLocaleString()}</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>${Number(p.netSalary || 0).toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip label={p.status || "PAID"} size="small" color={p.status === "PAID" ? "success" : "default"} sx={{ fontWeight: 700 }} />
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
