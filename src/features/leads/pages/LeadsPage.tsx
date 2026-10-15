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
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import { http } from "../../../services/http";
import { tokens } from "../../../theme/tokens";
import { Can } from "../../../components/Can";

export function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  const fetchLeads = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await http.get("/api/v1/leads", { params: { page, size: rowsPerPage } });
      const data = res.data?.data;
      if (data?.content) {
        setLeads(data.content);
        setTotalElements(data.totalElements || 0);
      } else if (Array.isArray(data)) {
        setLeads(data);
        setTotalElements(data.length);
      } else {
        setLeads([]);
        setTotalElements(0);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [page, rowsPerPage]);

  const handleConvert = async (id: number) => {
    if (!window.confirm("Convert this lead into a registered customer?")) return;
    try {
      await http.post(`/api/v1/leads/${id}/convert`);
      alert("Lead converted successfully to customer!");
      fetchLeads();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Conversion failed");
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} sx={{ color: tokens.colors.secondary[900] }}>
            Sales Leads & Pipelines
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b" }}>
            Manage client prospects, track inquiry status, and convert to customers
          </Typography>
        </Box>
        <Can permission="LEADS_CREATE">
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => alert("Create Lead")}
            sx={{
              bgcolor: tokens.colors.primary[600],
              textTransform: "none",
              fontWeight: 700,
              borderRadius: `${tokens.borderRadius.md}px`,
              "&:hover": { bgcolor: tokens.colors.primary[700] },
            }}
          >
            Add Lead
          </Button>
        </Can>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      <Card sx={{ borderRadius: `${tokens.borderRadius.lg}px`, boxShadow: tokens.shadows.sm, overflow: "hidden" }}>
        <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
          <Table sx={{ minWidth: 700 }}>
            <TableHead sx={{ bgcolor: "#f8fafc" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Name / Company</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Contact</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Source</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569", textAlign: "right" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: "center", py: 4 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              ) : leads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: "center", py: 4, color: "#94a3b8" }}>
                    No leads found
                  </TableCell>
                </TableRow>
              ) : (
                leads.map((lead) => (
                  <TableRow key={lead.id} hover>
                    <TableCell sx={{ fontWeight: 700 }}>
                      {lead.companyName ? `${lead.companyName} (${lead.contactPerson || lead.name || ""})` : (lead.contactPerson || lead.name || "Lead")}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{lead.email}</Typography>
                      <Typography variant="caption" color="text.secondary">{lead.phone || ""}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={lead.source || "WEBSITE"} size="small" sx={{ fontWeight: 600, fontSize: "0.75rem" }} />
                    </TableCell>
                    <TableCell>
                      <Chip label={lead.status || "NEW"} size="small" color="primary" sx={{ fontWeight: 700 }} />
                    </TableCell>
                    <TableCell sx={{ textAlign: "right" }}>
                      <Can permission="LEADS_CONVERT">
                        {lead.status !== "CONVERTED" && (
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<PersonAddAlt1Icon />}
                            onClick={() => handleConvert(lead.id)}
                            sx={{ textTransform: "none", fontWeight: 700 }}
                          >
                            Convert
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
