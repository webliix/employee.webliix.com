import React, { useState, useEffect } from "react";
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
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import AddIcon from "@mui/icons-material/Add";
import { http } from "../../../services/http";
import { tokens } from "../../../theme/tokens";
import { Can } from "../../../components/Can";

export interface InvoiceItem {
  id: number;
  invoiceNumber: string;
  customerName?: string;
  projectName?: string;
  issueDate?: string;
  dueDate?: string;
  totalAmount?: number;
  paidAmount?: number;
  status: string;
}

export function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchInvoices = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = { page, size: rowsPerPage };
      if (statusFilter !== "ALL") params.status = statusFilter;
      const res = await http.get("/api/v1/invoices", { params });
      const data = res.data?.data;
      if (data?.content) {
        setInvoices(data.content);
        setTotalElements(data.totalElements || 0);
      } else if (Array.isArray(data)) {
        setInvoices(data);
        setTotalElements(data.length);
      } else {
        setInvoices([]);
        setTotalElements(0);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [page, rowsPerPage, statusFilter]);

  const handleSendInvoice = async (id: number) => {
    try {
      await http.post(`/api/v1/invoices/${id}/send`);
      alert("Invoice sent successfully to customer");
      fetchInvoices();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to send invoice");
    }
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case "PAID":
        return <Chip label="Paid" size="small" color="success" sx={{ fontWeight: 700 }} />;
      case "SENT":
        return <Chip label="Sent" size="small" color="primary" sx={{ fontWeight: 700 }} />;
      case "OVERDUE":
        return <Chip label="Overdue" size="small" color="error" sx={{ fontWeight: 700 }} />;
      default:
        return <Chip label={status || "Draft"} size="small" sx={{ fontWeight: 700 }} />;
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} sx={{ color: tokens.colors.secondary[900] }}>
            Invoices & Client Billing
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b" }}>
            Generate deliverables-based invoices, monitor collection status, and send statements
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          <Can permission="INVOICES_EXPORT">
            <Button
              variant="outlined"
              startIcon={<FileDownloadOutlinedIcon />}
              onClick={() => alert("Invoice export started")}
              sx={{ textTransform: "none", fontWeight: 700, borderRadius: `${tokens.borderRadius.md}px` }}
            >
              Export
            </Button>
          </Can>
          <Can permission="INVOICES_CREATE">
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => alert("Invoice creation is managed through Project deliverables and billing tabs")}
              sx={{
                bgcolor: tokens.colors.primary[600],
                textTransform: "none",
                fontWeight: 700,
                borderRadius: `${tokens.borderRadius.md}px`,
                "&:hover": { bgcolor: tokens.colors.primary[700] },
              }}
            >
              New Invoice
            </Button>
          </Can>
        </Box>
      </Box>

      {/* Filter Tabs */}
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        {["ALL", "DRAFT", "SENT", "PAID", "OVERDUE"].map((st) => (
          <Button
            key={st}
            size="small"
            variant={statusFilter === st ? "contained" : "outlined"}
            onClick={() => { setStatusFilter(st); setPage(0); }}
            sx={{ borderRadius: "20px", textTransform: "none", fontWeight: 600, fontSize: "0.8125rem", px: 2 }}
          >
            {st === "ALL" ? "All Invoices" : st.charAt(0) + st.slice(1).toLowerCase()}
          </Button>
        ))}
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      <Card sx={{ borderRadius: `${tokens.borderRadius.lg}px`, boxShadow: tokens.shadows.sm, overflow: "hidden" }}>
        <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
          <Table sx={{ minWidth: 700 }}>
            <TableHead sx={{ bgcolor: "#f8fafc" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Invoice #</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Client</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Issue Date</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Due Date</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Total</TableCell>
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
              ) : invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: "center", py: 4, color: "#94a3b8" }}>
                    No invoices found
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((inv) => (
                  <TableRow key={inv.id} hover>
                    <TableCell sx={{ fontWeight: 700, color: tokens.colors.primary[700] }}>
                      {inv.invoiceNumber || `INV-${inv.id}`}
                    </TableCell>
                    <TableCell>{inv.customerName || "Enterprise Client"}</TableCell>
                    <TableCell>{inv.issueDate ? new Date(inv.issueDate).toLocaleDateString() : "-"}</TableCell>
                    <TableCell>{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "-"}</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>
                      ${Number(inv.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>{getStatusChip(inv.status)}</TableCell>
                    <TableCell sx={{ textAlign: "right" }}>
                      <Can permission="INVOICES_SEND">
                        {inv.status !== "PAID" && (
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<SendOutlinedIcon />}
                            onClick={() => handleSendInvoice(inv.id)}
                            sx={{ textTransform: "none", fontWeight: 700 }}
                          >
                            Send
                          </Button>
                        )}
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
    </Box>
  );
}
