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

export function BlogsPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  const fetchBlogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await http.get("/api/v1/blogs", { params: { page, size: rowsPerPage } });
      const data = res.data?.data;
      if (data?.content) {
        setBlogs(data.content);
        setTotalElements(data.totalElements || 0);
      } else if (Array.isArray(data)) {
        setBlogs(data);
        setTotalElements(data.length);
      } else {
        setBlogs([]);
        setTotalElements(0);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load blog posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [page, rowsPerPage]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} sx={{ color: tokens.colors.secondary[900] }}>
            Blog & Content Management
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b" }}>
            Draft, publish, and schedule articles for the public Webliix publication
          </Typography>
        </Box>
        <Can permission="BLOGS_MANAGE">
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => alert("Create blog article")}
            sx={{
              bgcolor: tokens.colors.primary[600],
              textTransform: "none",
              fontWeight: 700,
              borderRadius: `${tokens.borderRadius.md}px`,
              "&:hover": { bgcolor: tokens.colors.primary[700] },
            }}
          >
            Create Article
          </Button>
        </Can>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      <Card sx={{ borderRadius: `${tokens.borderRadius.lg}px`, boxShadow: tokens.shadows.sm, overflow: "hidden" }}>
        <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
          <Table sx={{ minWidth: 700 }}>
            <TableHead sx={{ bgcolor: "#f8fafc" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Author</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Published Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: "center", py: 4 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              ) : blogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: "center", py: 4, color: "#94a3b8" }}>
                    No blog articles published
                  </TableCell>
                </TableRow>
              ) : (
                blogs.map((b) => (
                  <TableRow key={b.id} hover>
                    <TableCell sx={{ fontWeight: 700 }}>{b.title}</TableCell>
                    <TableCell>{b.author || "Webliix Staff"}</TableCell>
                    <TableCell>
                      <Chip label={b.category || "General"} size="small" sx={{ fontWeight: 600, fontSize: "0.75rem" }} />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={b.status || "PUBLISHED"}
                        size="small"
                        color={b.status === "PUBLISHED" ? "success" : "default"}
                        sx={{ fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell>{b.publishedAt ? new Date(b.publishedAt).toLocaleDateString() : "-"}</TableCell>
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
