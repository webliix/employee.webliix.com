import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import CircularProgress from "@mui/material/CircularProgress";
import { tokens } from "../theme/tokens";
import { paymentSubmissionApi, type PaymentSubmission } from "../services/paymentSubmissionApi";
import { projectApi, type Project } from "../services/projectApi";

export function EmployeePaymentsPage() {
  const [submissions, setSubmissions] = useState<PaymentSubmission[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [projectId, setProjectId] = useState<number | "">("");
  const [amount, setAmount] = useState<number | "">("");
  const [currency, setCurrency] = useState("USD");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState("BANK_TRANSFER");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [payerName, setPayerName] = useState("");
  const [receiverDetails, setReceiverDetails] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subsRes, projRes] = await Promise.all([
        paymentSubmissionApi.getMySubmissions(0, 50),
        projectApi.getMyProjects(),
      ]);
      setSubmissions(subsRes.content || []);
      setProjects(projRes || []);
    } catch (err) {
      console.error("Error loading payment submissions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!amount || Number(amount) <= 0) {
      setError("Please specify a valid payment amount greater than zero.");
      return;
    }

    setSubmitting(true);
    try {
      await paymentSubmissionApi.submitPayment({
        projectId: projectId ? Number(projectId) : undefined,
        amount: Number(amount),
        currency,
        paymentDate,
        paymentMethod,
        referenceNumber: referenceNumber || undefined,
        payerName: payerName || undefined,
        receiverDetails: receiverDetails || undefined,
        notes: notes || undefined,
      });

      setOpenModal(false);
      setAmount("");
      setReferenceNumber("");
      setPayerName("");
      setNotes("");
      fetchData();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to submit collection record.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} sx={{ color: tokens.colors.secondary[900] }}>
            Payment & Collection Submissions
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b" }}>
            Submit client collection details for finance review and verification
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={() => setOpenModal(true)}
          sx={{
            bgcolor: tokens.colors.primary[600],
            textTransform: "none",
            fontWeight: 700,
            borderRadius: `${tokens.borderRadius.md}px`,
          }}
        >
          + Submit Collection Record
        </Button>
      </Box>

      {/* Info notice */}
      <Alert severity="info" sx={{ borderRadius: `${tokens.borderRadius.md}px` }}>
        Submitted records are sent directly to the finance team for reconciliation. Records do not mark invoices as paid until verified and approved by administrators.
      </Alert>

      {/* Submissions Table */}
      <Card sx={{ borderRadius: `${tokens.borderRadius.lg}px`, boxShadow: tokens.shadows.sm }}>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
              <CircularProgress />
            </Box>
          ) : submissions.length === 0 ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="body1" sx={{ color: "#94a3b8" }}>
                No payment or collection records submitted yet.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: "#f8fafc" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Project / Client</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Method</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Reference</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Review Notes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {submissions.map((sub) => (
                    <TableRow key={sub.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{sub.paymentDate}</TableCell>
                      <TableCell>{sub.projectName || sub.customerName || "General Collection"}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{sub.currency} {sub.amount.toLocaleString()}</TableCell>
                      <TableCell>{sub.paymentMethod || "N/A"}</TableCell>
                      <TableCell>{sub.referenceNumber || "-"}</TableCell>
                      <TableCell>
                        <Chip
                          label={sub.status}
                          size="small"
                          color={sub.status === "APPROVED" ? "success" : sub.status === "REJECTED" ? "error" : "warning"}
                          sx={{ fontWeight: 700, fontSize: "0.75rem" }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: "#64748b" }}>
                        {sub.reviewNotes || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Submit Payment Dialog */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Submit Client Collection Record</DialogTitle>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {error && <Alert severity="error">{error}</Alert>}

            <FormControl fullWidth>
              <InputLabel id="pay-project-select-label">Associated Project</InputLabel>
              <Select
                labelId="pay-project-select-label"
                value={projectId}
                label="Associated Project"
                onChange={(e) => setProjectId(e.target.value as any)}
              >
                <MenuItem value=""><em>None / Unassigned</em></MenuItem>
                {projects.map((p) => (
                  <MenuItem key={p.id} value={p.id}>{p.projectName}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Amount"
                type="number"
                inputProps={{ min: 1, step: 0.01 }}
                fullWidth
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value as any)}
              />
              <FormControl sx={{ minWidth: 100 }}>
                <InputLabel id="currency-select-label">Currency</InputLabel>
                <Select
                  labelId="currency-select-label"
                  value={currency}
                  label="Currency"
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <MenuItem value="USD">USD</MenuItem>
                  <MenuItem value="INR">INR</MenuItem>
                  <MenuItem value="EUR">EUR</MenuItem>
                  <MenuItem value="GBP">GBP</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <TextField
              label="Transaction / Payment Date"
              type="date"
              fullWidth
              required
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />

            <FormControl fullWidth>
              <InputLabel id="payment-method-select-label">Payment Method</InputLabel>
              <Select
                labelId="payment-method-select-label"
                value={paymentMethod}
                label="Payment Method"
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <MenuItem value="BANK_TRANSFER">Bank Wire / NEFT / IMPS</MenuItem>
                <MenuItem value="UPI">UPI / Digital Wallet</MenuItem>
                <MenuItem value="CREDIT_CARD">Credit / Debit Card</MenuItem>
                <MenuItem value="STRIPE">Stripe Online</MenuItem>
                <MenuItem value="CHEQUE">Cheque / Demand Draft</MenuItem>
                <MenuItem value="CASH">Cash Deposit</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Reference ID / Transaction UTR"
              fullWidth
              placeholder="e.g. UTR123456789"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
            />

            <TextField
              label="Payer Company / Person Name (Optional)"
              fullWidth
              value={payerName}
              onChange={(e) => setPayerName(e.target.value)}
            />

            <TextField
              label="Notes / Supporting Remarks"
              multiline
              rows={2}
              fullWidth
              placeholder="Deposit branch or verification notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setOpenModal(false)} sx={{ textTransform: "none" }}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              sx={{ bgcolor: tokens.colors.primary[600], textTransform: "none", fontWeight: 700 }}
            >
              {submitting ? "Submitting..." : "Submit for Verification"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
