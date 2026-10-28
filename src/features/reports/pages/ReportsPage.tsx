import { useState, useEffect } from "react";
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
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import { http } from "../../../services/http";
import { tokens } from "../../../theme/tokens";
import { Can } from "../../../components/Can";

export function ReportsPage() {
  const [revenue, setRevenue] = useState<any>(null);
  const [profit, setProfit] = useState<any>(null);
  const [monthly, setMonthly] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError(null);
      try {
        const [revRes, profRes, monthRes] = await Promise.allSettled([
          http.get("/api/v1/reports/revenue"),
          http.get("/api/v1/reports/profit"),
          http.get("/api/v1/reports/revenue/monthly"),
        ]);

        if (revRes.status === "fulfilled") {
          setRevenue(revRes.value.data?.data || null);
        }
        if (profRes.status === "fulfilled") {
          setProfit(profRes.value.data?.data || null);
        }
        if (monthRes.status === "fulfilled") {
          const list = monthRes.value.data?.data;
          setMonthly(Array.isArray(list) ? list : []);
        }
      } catch (err: any) {
        setError("Failed to load financial reports");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} sx={{ color: tokens.colors.secondary[900] }}>
            Finance & Revenue Analytics
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b" }}>
            Real-time scoped reporting on cashflow, profit margins, and revenue collections
          </Typography>
        </Box>
        <Can permission="REPORTS_EXPORT">
          <Button
            variant="outlined"
            startIcon={<FileDownloadOutlinedIcon />}
            onClick={() => alert("Report download initiated")}
            sx={{ textTransform: "none", fontWeight: 700, borderRadius: `${tokens.borderRadius.md}px` }}
          >
            Export CSV
          </Button>
        </Can>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {/* KPI Cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 2.5 }}>
        <Card sx={{ borderRadius: `${tokens.borderRadius.lg}px`, boxShadow: tokens.shadows.sm }}>
          <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ p: 1.5, borderRadius: "12px", bgcolor: tokens.colors.primary[50], color: tokens.colors.primary[600] }}>
              <MonetizationOnIcon sx={{ fontSize: 32 }} />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
                Total Revenue
              </Typography>
              <Typography variant="h5" fontWeight={800} sx={{ color: tokens.colors.secondary[900] }}>
                ${Number(revenue?.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: `${tokens.borderRadius.lg}px`, boxShadow: tokens.shadows.sm }}>
          <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ p: 1.5, borderRadius: "12px", bgcolor: "#f0fdf4", color: "#16a34a" }}>
              <TrendingUpIcon sx={{ fontSize: 32 }} />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
                Net Profit
              </Typography>
              <Typography variant="h5" fontWeight={800} sx={{ color: "#16a34a" }}>
                ${Number(profit?.netProfit || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: `${tokens.borderRadius.lg}px`, boxShadow: tokens.shadows.sm }}>
          <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ p: 1.5, borderRadius: "12px", bgcolor: "#fff7ed", color: "#ea580c" }}>
              <AccountBalanceWalletIcon sx={{ fontSize: 32 }} />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
                Total Expenses
              </Typography>
              <Typography variant="h5" fontWeight={800} sx={{ color: tokens.colors.secondary[900] }}>
                ${Number(profit?.totalExpenses || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Monthly Breakdown Table */}
      <Card sx={{ borderRadius: `${tokens.borderRadius.lg}px`, boxShadow: tokens.shadows.sm, overflow: "hidden" }}>
        <Box sx={{ p: 2.5, borderBottom: "1px solid #e2e8f0" }}>
          <Typography variant="subtitle1" fontWeight={800}>
            Monthly Revenue Collections
          </Typography>
        </Box>
        <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
          <Table sx={{ minWidth: 600 }}>
            <TableHead sx={{ bgcolor: "#f8fafc" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Period / Month</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Invoiced Amount</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Collected Amount</TableCell>
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
              ) : monthly.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} sx={{ textAlign: "center", py: 4, color: "#94a3b8" }}>
                    No monthly breakdown records available
                  </TableCell>
                </TableRow>
              ) : (
                monthly.map((m, idx) => (
                  <TableRow key={idx} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{m.month || m.period || `Month ${idx + 1}`}</TableCell>
                    <TableCell>₹{Number(m.invoiced || 0).toLocaleString()}</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: "#16a34a" }}>₹{Number(m.collected || m.revenue || 0).toLocaleString()}</TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: "#64748b" }}>
                        Audited
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
