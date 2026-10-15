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
import TransformIcon from "@mui/icons-material/Transform";
import AddIcon from "@mui/icons-material/Add";
import { http } from "../../../services/http";
import { tokens } from "../../../theme/tokens";
import { Can } from "../../../components/Can";

export function QuotationsPage() {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  const fetchQuotations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await http.get("/api/v1/quotations", { params: { page, size: rowsPerPage } });
      const data = res.data?.data;
      if (data?.content) {
        setQuotations(data.content);
        setTotalElements(data.totalElements || 0);
      } else if (Array.isArray(data)) {
        setQuotations(data);
        setTotalElements(data.length);
      } else {
        setQuotations([]);
        setTotalElements(0);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load quotations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, [page, rowsPerPage]);

  const handleConvert = async (id: number) => {
    if (!window.confirm("Convert this quotation into an active invoice?")) return;
    try {
      await http.post(`/api/v1/quotations/${id}/convert`);
      alert("Quotation converted to invoice successfully!");
      fetchQuotations();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to convert quotation");
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} sx={{ color: tokens.colors.secondary[900] }}>
            Quotations & Estimates
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b" }}>
            Create client proposals and convert approved estimates directly into invoices
          </Typography>
        </Box>
        <Can permission="QUOTATIONS_CREATE">
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => alert("Create quotation")}
            sx={{
              bgcolor: tokens.colors.primary[600],
              textTransform: "none",
              fontWeight: 700,
              borderRadius: `${tokens.borderRadius.md}px`,
              "&:hover": { bgcolor: tokens.colors.primary[700] },
            }}
          >
            New Quotation
          </Button>
        </Can>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      <Card sx={{ borderRadius: `${tokens.borderRadius.lg}px`, boxShadow: tokens.shadows.sm, overflow: "hidden" }}>
        <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
          <Table sx={{ minWidth: 700 }}>
            <TableHead sx={{ bgcolor: "#f8fafc" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Quotation #</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Client</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Total Amount</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Valid Until</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569", textAlign: "right" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: "center", py: 4 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              ) : quotations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: "center", py: 4, color: "#94a3b8" }}>
                    No quotations found
                  </TableCell>
                </TableRow>
              ) : (
                quotations.map((q) => (
                  <TableRow key={q.id} hover>
                    <TableCell sx={{ fontWeight: 700, color: tokens.colors.primary[700] }}>
                      {q.quotationNumber || `QT-${q.id}`}
                    </TableCell>
                    <TableCell>{q.customer?.companyName || q.customerName || "Prospective Client"}</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>
                      ${Number(q.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>{q.validUntil ? new Date(q.validUntil).toLocaleDateString() : "-"}</TableCell>
                    <TableCell>
                      <Chip label={q.status || "DRAFT"} size="small" sx={{ fontWeight: 700 }} />
                    </TableCell>
                    <TableCell sx={{ textAlign: "right" }}>
                      <Can permission="QUOTATIONS_CONVERT">
                        {q.status !== "CONVERTED" && (
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<TransformIcon />}
                            onClick={() => handleConvert(q.id)}
                            sx={{ textTransform: "none", fontWeight: 700 }}
                          >
                            Convert to Invoice
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
