import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
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
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { http } from "../../../services/http";
import { tokens } from "../../../theme/tokens";
import { Can } from "../../../components/Can";

export interface ExpenseItem {
  id: number;
  expenseNumber: string;
  category: string;
  amount: number;
  expenseDate: string;
  status: string;
  paymentMethod?: string;
  description?: string;
  vendorName?: string;
  createdBy?: string;
}

export function ExpensesPage() {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Create Modal
  const [openCreate, setOpenCreate] = useState(false);
  const [createCategory, setCreateCategory] = useState("TRAVEL");
  const [createAmount, setCreateAmount] = useState("");
  const [createDate, setCreateDate] = useState(new Date().toISOString().split("T")[0]);
  const [createVendor, setCreateVendor] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchExpenses = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = { page, size: rowsPerPage };
      if (statusFilter !== "ALL") params.status = statusFilter;
      const res = await http.get("/api/v1/expenses", { params });
      const data = res.data?.data;
      if (data?.content) {
        setExpenses(data.content);
        setTotalElements(data.totalElements || 0);
      } else if (Array.isArray(data)) {
        setExpenses(data);
        setTotalElements(data.length);
      } else {
        setExpenses([]);
        setTotalElements(0);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [page, rowsPerPage, statusFilter]);

  const handleCreate = async () => {
    if (!createAmount || isNaN(Number(createAmount))) return;
    setSubmitting(true);
    try {
      await http.post("/api/v1/expenses", {
        category: createCategory,
        amount: Number(createAmount),
        expenseDate: createDate,
        vendorName: createVendor,
        description: createDesc,
      });
      setOpenCreate(false);
      setCreateAmount("");
      setCreateVendor("");
      setCreateDesc("");
      fetchExpenses();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to record expense");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await http.post(`/api/v1/expenses/${id}/approve`);
      fetchExpenses();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Approval failed");
    }
  };

  const handleReject = async (id: number) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;
    try {
      await http.post(`/api/v1/expenses/${id}/reject`, { reason });
      fetchExpenses();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Rejection failed");
    }
  };

  const handlePay = async (id: number) => {
    try {
      await http.post(`/api/v1/expenses/${id}/pay`, { paymentMethod: "BANK_TRANSFER" });
      fetchExpenses();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Mark as paid failed");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    try {
      await http.delete(`/api/v1/expenses/${id}`);
      fetchExpenses();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Delete failed");
    }
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Chip label="Approved" size="small" color="primary" sx={{ fontWeight: 700 }} />;
      case "PAID":
        return <Chip label="Paid" size="small" color="success" sx={{ fontWeight: 700 }} />;
      case "REJECTED":
        return <Chip label="Rejected" size="small" color="error" sx={{ fontWeight: 700 }} />;
      default:
        return <Chip label={status || "Pending"} size="small" sx={{ fontWeight: 700, bgcolor: "#fef3c7", color: "#b45309" }} />;
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} sx={{ color: tokens.colors.secondary[900] }}>
            Expenses Management
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b" }}>
            Track business expenditure, claim reimbursements, and process approvals
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          <Can permission="EXPENSES_EXPORT">
            <Button
              variant="outlined"
              startIcon={<FileDownloadOutlinedIcon />}
              onClick={() => alert("Expense export initiated")}
              sx={{ textTransform: "none", fontWeight: 700, borderRadius: `${tokens.borderRadius.md}px` }}
            >
              Export Report
            </Button>
          </Can>
          <Can permission="EXPENSES_CREATE">
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenCreate(true)}
              sx={{
                bgcolor: tokens.colors.primary[600],
                textTransform: "none",
                fontWeight: 700,
                borderRadius: `${tokens.borderRadius.md}px`,
                "&:hover": { bgcolor: tokens.colors.primary[700] },
              }}
            >
              Record Expense
            </Button>
          </Can>
        </Box>
      </Box>

      {/* Filter Tabs */}
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        {["ALL", "PENDING", "APPROVED", "PAID", "REJECTED"].map((st) => (
          <Button
            key={st}
            size="small"
            variant={statusFilter === st ? "contained" : "outlined"}
            onClick={() => { setStatusFilter(st); setPage(0); }}
            sx={{
              borderRadius: "20px",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.8125rem",
              px: 2,
            }}
          >
            {st === "ALL" ? "All Expenses" : st.charAt(0) + st.slice(1).toLowerCase()}
          </Button>
        ))}
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {/* Table */}
      <Card sx={{ borderRadius: `${tokens.borderRadius.lg}px`, boxShadow: tokens.shadows.sm, overflow: "hidden" }}>
        <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
          <Table sx={{ minWidth: 700 }}>
            <TableHead sx={{ bgcolor: "#f8fafc" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Code</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Vendor / Description</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569", textAlign: "right" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: "center", py: 4 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              ) : expenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: "center", py: 4, color: "#94a3b8" }}>
                    No expenses recorded
                  </TableCell>
                </TableRow>
              ) : (
                expenses.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell sx={{ fontWeight: 700, color: tokens.colors.primary[700] }}>
                      {row.expenseNumber || `EXP-${row.id}`}
                    </TableCell>
                    <TableCell>{row.expenseDate ? new Date(row.expenseDate).toLocaleDateString() : "-"}</TableCell>
                    <TableCell>
                      <Chip label={row.category} size="small" sx={{ fontWeight: 600, fontSize: "0.75rem" }} />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 260 }}>
                      <Typography variant="body2" fontWeight={600} noWrap>
                        {row.vendorName || "General"}
                      </Typography>
                      {row.description && (
                        <Typography variant="caption" sx={{ color: "#64748b" }} noWrap display="block">
                          {row.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>
                      ${Number(row.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>{getStatusChip(row.status)}</TableCell>
                    <TableCell sx={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      {row.status === "PENDING" && (
                        <Can permission="EXPENSES_APPROVE">
                          <Button
                            size="small"
                            color="success"
                            startIcon={<CheckCircleOutlineIcon />}
                            onClick={() => handleApprove(row.id)}
                            sx={{ textTransform: "none", fontWeight: 700, mr: 1 }}
                          >
                            Approve
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            startIcon={<HighlightOffIcon />}
                            onClick={() => handleReject(row.id)}
                            sx={{ textTransform: "none", fontWeight: 700, mr: 1 }}
                          >
                            Reject
                          </Button>
                        </Can>
                      )}
                      {row.status === "APPROVED" && (
                        <Can permission="EXPENSES_PAY">
                          <Button
                            size="small"
                            color="primary"
                            startIcon={<PaidOutlinedIcon />}
                            onClick={() => handlePay(row.id)}
                            sx={{ textTransform: "none", fontWeight: 700, mr: 1 }}
                          >
                            Pay
                          </Button>
                        </Can>
                      )}
                      <Can permission="EXPENSES_DELETE">
                        <Button
                          size="small"
                          color="error"
                          startIcon={<DeleteOutlineIcon />}
                          onClick={() => handleDelete(row.id)}
                          sx={{ textTransform: "none", fontWeight: 600 }}
                        >
                          Delete
                        </Button>
                      </Can>
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

      {/* Record Expense Dialog */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Record New Expense</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField
            select
            label="Category"
            value={createCategory}
            onChange={(e) => setCreateCategory(e.target.value)}
            fullWidth
            required
          >
            <MenuItem value="TRAVEL">Travel & Transport</MenuItem>
            <MenuItem value="MEALS">Meals & Entertainment</MenuItem>
            <MenuItem value="SOFTWARE">Software & Tools</MenuItem>
            <MenuItem value="OFFICE_SUPPLIES">Office Supplies</MenuItem>
            <MenuItem value="EQUIPMENT">Equipment & Hardware</MenuItem>
            <MenuItem value="OTHER">Other</MenuItem>
          </TextField>

          <TextField
            label="Amount (USD)"
            type="number"
            value={createAmount}
            onChange={(e) => setCreateAmount(e.target.value)}
            fullWidth
            required
          />

          <TextField
            label="Expense Date"
            type="date"
            value={createDate}
            onChange={(e) => setCreateDate(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
            required
          />

          <TextField
            label="Vendor / Payee"
            value={createVendor}
            onChange={(e) => setCreateVendor(e.target.value)}
            fullWidth
            placeholder="e.g. AWS, Uber, Starbucks"
          />

          <TextField
            label="Description / Business Justification"
            value={createDesc}
            onChange={(e) => setCreateDesc(e.target.value)}
            fullWidth
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenCreate(false)} sx={{ textTransform: "none", fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={submitting || !createAmount}
            onClick={handleCreate}
            sx={{
              bgcolor: tokens.colors.primary[600],
              textTransform: "none",
              fontWeight: 700,
              "&:hover": { bgcolor: tokens.colors.primary[700] },
            }}
          >
            {submitting ? <CircularProgress size={20} /> : "Submit Expense"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
