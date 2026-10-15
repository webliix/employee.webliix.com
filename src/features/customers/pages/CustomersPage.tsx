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
import BusinessIcon from "@mui/icons-material/Business";
import { http } from "../../../services/http";
import { tokens } from "../../../theme/tokens";
import { Can } from "../../../components/Can";

export function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await http.get("/api/v1/customers", { params: { page, size: rowsPerPage } });
      const data = res.data?.data;
      if (data?.content) {
        setCustomers(data.content);
        setTotalElements(data.totalElements || 0);
      } else if (Array.isArray(data)) {
        setCustomers(data);
        setTotalElements(data.length);
      } else {
        setCustomers([]);
        setTotalElements(0);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, rowsPerPage]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} sx={{ color: tokens.colors.secondary[900] }}>
            Clients & Customers Directory
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b" }}>
            Maintain active enterprise accounts, contacts, and billing records
          </Typography>
        </Box>
        <Can permission="CUSTOMERS_CREATE">
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => alert("Create customer")}
            sx={{
              bgcolor: tokens.colors.primary[600],
              textTransform: "none",
              fontWeight: 700,
              borderRadius: `${tokens.borderRadius.md}px`,
              "&:hover": { bgcolor: tokens.colors.primary[700] },
            }}
          >
            Add Customer
          </Button>
        </Can>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      <Card sx={{ borderRadius: `${tokens.borderRadius.lg}px`, boxShadow: tokens.shadows.sm, overflow: "hidden" }}>
        <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
          <Table sx={{ minWidth: 700 }}>
            <TableHead sx={{ bgcolor: "#f8fafc" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Company</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Contact Person</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Email & Phone</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} sx={{ textAlign: "center", py: 4 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              ) : customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} sx={{ textAlign: "center", py: 4, color: "#94a3b8" }}>
                    No customers found
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((c) => (
                  <TableRow key={c.id} hover>
                    <TableCell sx={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
                      <BusinessIcon fontSize="small" sx={{ color: tokens.colors.primary[600] }} />
                      {c.companyName || "Organization"}
                    </TableCell>
                    <TableCell>{c.contactPerson || "-"}</TableCell>
                    <TableCell>
                      <Typography variant="body2">{c.email}</Typography>
                      <Typography variant="caption" color="text.secondary">{c.phone || ""}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={c.status || "ACTIVE"} size="small" color="success" sx={{ fontWeight: 700 }} />
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
