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
import Avatar from "@mui/material/Avatar";
import AddIcon from "@mui/icons-material/Add";
import { http } from "../../../services/http";
import { tokens } from "../../../theme/tokens";
import { Can } from "../../../components/Can";
import { usePermissions } from "../../../auth/usePermissions";

export function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  const { can } = usePermissions();
  const canSeeSalary = can("EMPLOYEES_SALARY_VIEW");

  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await http.get("/api/v1/employees", { params: { page, size: rowsPerPage } });
      const data = res.data?.data;
      if (data?.content) {
        setEmployees(data.content);
        setTotalElements(data.totalElements || 0);
      } else if (Array.isArray(data)) {
        setEmployees(data);
        setTotalElements(data.length);
      } else {
        setEmployees([]);
        setTotalElements(0);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [page, rowsPerPage]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} sx={{ color: tokens.colors.secondary[900] }}>
            Team & Employee Directory
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b" }}>
            Workspace staff directory with departments, designations, and scoped records
          </Typography>
        </Box>
        <Can permission="EMPLOYEES_CREATE">
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => alert("Add employee dialog")}
            sx={{
              bgcolor: tokens.colors.primary[600],
              textTransform: "none",
              fontWeight: 700,
              borderRadius: `${tokens.borderRadius.md}px`,
              "&:hover": { bgcolor: tokens.colors.primary[700] },
            }}
          >
            Add Employee
          </Button>
        </Can>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      <Card sx={{ borderRadius: `${tokens.borderRadius.lg}px`, boxShadow: tokens.shadows.sm, overflow: "hidden" }}>
        <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
          <Table sx={{ minWidth: 700 }}>
            <TableHead sx={{ bgcolor: "#f8fafc" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Code</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Employee</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Department & Role</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Compensation</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: "center", py: 4 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              ) : employees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: "center", py: 4, color: "#94a3b8" }}>
                    No team members found
                  </TableCell>
                </TableRow>
              ) : (
                employees.map((emp) => (
                  <TableRow key={emp.id} hover>
                    <TableCell sx={{ fontWeight: 700, color: tokens.colors.primary[700] }}>
                      {emp.employeeCode || `EMP-${emp.id}`}
                    </TableCell>
                    <TableCell sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: tokens.colors.primary[500], fontSize: "0.8125rem", fontWeight: 700 }}>
                        {emp.firstName ? emp.firstName[0] : "E"}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={700}>
                          {emp.firstName} {emp.lastName || ""}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {emp.email}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{emp.departmentName || "Engineering"}</Typography>
                      <Typography variant="caption" color="text.secondary">{emp.designationName || "Specialist"}</Typography>
                    </TableCell>
                    <TableCell>
                      {canSeeSalary ? (
                        <Typography variant="body2" fontWeight={700}>
                          ${Number(emp.salary || 0).toLocaleString()}
                        </Typography>
                      ) : (
                        <Typography variant="caption" sx={{ color: "#94a3b8", letterSpacing: 2 }}>
                          ••••••
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={emp.active !== false ? "Active" : "Inactive"}
                        size="small"
                        color={emp.active !== false ? "success" : "default"}
                        sx={{ fontWeight: 700 }}
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
