import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import LinearProgress from "@mui/material/LinearProgress";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { tokens } from "../theme/tokens";
import {
  projectApi,
  type Project,
  type ProjectBillingSummary,
  type ProjectInvoiceItem,
} from "../services/projectApi";

export function EmployeeProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Bill Project Modal State
  const [billingProject, setBillingProject] = useState<Project | null>(null);
  const [billItems, setBillItems] = useState<ProjectInvoiceItem[]>([
    { itemName: "Development & Engineering Hours", description: "Sprint deliverables", quantity: 1, unitPrice: 0 },
  ]);
  const [taxAmount, setTaxAmount] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [billNotes, setBillNotes] = useState<string>("");
  const [submittingBill, setSubmittingBill] = useState(false);
  const [billSuccessMsg, setBillSuccessMsg] = useState<string | null>(null);
  const [billErrorMsg, setBillErrorMsg] = useState<string | null>(null);

  // Financial Status Modal State
  const [statusProject, setStatusProject] = useState<Project | null>(null);
  const [billingSummary, setBillingSummary] = useState<ProjectBillingSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  useEffect(() => {
    projectApi
      .getMyProjects()
      .then((data) => setProjects(data))
      .catch((err) => console.error("Error fetching projects:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleOpenBillModal = (project: Project) => {
    setBillingProject(project);
    setBillItems([
      { itemName: "Project Deliverables & Services", description: `Billing for ${project.projectName}`, quantity: 1, unitPrice: 0 },
    ]);
    setTaxAmount(0);
    setDiscountAmount(0);
    setBillNotes("");
    setBillSuccessMsg(null);
    setBillErrorMsg(null);
  };

  const handleOpenStatusModal = async (project: Project) => {
    setStatusProject(project);
    setLoadingSummary(true);
    const summary = await projectApi.getProjectBilling(project.id);
    setBillingSummary(summary);
    setLoadingSummary(false);
  };

  const handleAddItem = () => {
    setBillItems((prev) => [...prev, { itemName: "", description: "", quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setBillItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof ProjectInvoiceItem, value: any) => {
    setBillItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const subtotal = billItems.reduce((acc, it) => acc + (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0), 0);
  const totalBill = Math.max(0, subtotal + (Number(taxAmount) || 0) - (Number(discountAmount) || 0));

  const handleSubmitBill = async () => {
    if (!billingProject) return;
    if (billItems.length === 0 || billItems.some((i) => !i.itemName.trim() || Number(i.unitPrice) <= 0)) {
      setBillErrorMsg("Please enter valid item names and positive unit prices for all items.");
      return;
    }

    setSubmittingBill(true);
    setBillErrorMsg(null);
    try {
      await projectApi.billProject(billingProject.id, {
        projectId: billingProject.id,
        customerId: billingProject.customer?.id,
        items: billItems,
        taxAmount: Number(taxAmount) || 0,
        discountAmount: Number(discountAmount) || 0,
        notes: billNotes,
      });
      setBillSuccessMsg("Project invoice generated and submitted to client billing successfully!");
      setTimeout(() => {
        setBillingProject(null);
        setBillSuccessMsg(null);
      }, 1500);
    } catch (err: any) {
      setBillErrorMsg(err?.response?.data?.message || "Failed to generate bill for this project. Check your permissions.");
    } finally {
      setSubmittingBill(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box>
        <Typography variant="h5" fontWeight={800} sx={{ color: tokens.colors.secondary[900] }}>
          My Assigned Projects & Billing
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748b" }}>
          Projects where you have active team membership. Submit milestone bills and inspect project financial status.
        </Typography>
      </Box>

      {projects.length === 0 ? (
        <Card sx={{ p: 4, textAlign: "center", borderRadius: `${tokens.borderRadius.lg}px` }}>
          <Typography variant="body1" sx={{ color: "#94a3b8" }}>
            No projects currently assigned. Please contact your project manager.
          </Typography>
        </Card>
      ) : (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }, gap: 2.5 }}>
          {projects.map((project) => (
            <Card key={project.id} sx={{ borderRadius: `${tokens.borderRadius.lg}px`, boxShadow: tokens.shadows.sm, display: "flex", flexDirection: "column" }}>
              <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Chip label={project.projectCode} size="small" sx={{ fontWeight: 700, bgcolor: tokens.colors.primary[50], color: tokens.colors.primary[700] }} />
                  <Chip label={project.status} size="small" sx={{ fontWeight: 600 }} />
                </Box>

                <Typography variant="h6" fontWeight={700} sx={{ mt: 0.5 }}>
                  {project.projectName}
                </Typography>

                {project.description && (
                  <Typography variant="body2" sx={{ color: "#64748b", flex: 1 }}>
                    {project.description}
                  </Typography>
                )}

                {project.customer && (
                  <Box sx={{ p: 1.5, bgcolor: "#f8fafc", borderRadius: `${tokens.borderRadius.sm}px` }}>
                    <Typography variant="caption" sx={{ color: "#94a3b8", display: "block" }}>Client</Typography>
                    <Typography variant="body2" fontWeight={600}>{project.customer.companyName}</Typography>
                  </Box>
                )}

                {project.progressPercentage !== undefined && (
                  <Box sx={{ mt: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                      <Typography variant="caption" sx={{ color: "#64748b" }}>Progress</Typography>
                      <Typography variant="caption" fontWeight={700}>{project.progressPercentage}%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={project.progressPercentage || 0} sx={{ height: 6, borderRadius: 3 }} />
                  </Box>
                )}

                <Box sx={{ display: "flex", gap: 1, mt: 2, pt: 1.5, borderTop: `1px solid ${tokens.colors.secondary[200]}` }}>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<ReceiptLongIcon />}
                    onClick={() => handleOpenBillModal(project)}
                    sx={{ flex: 1, fontWeight: 700, borderRadius: `${tokens.borderRadius.sm}px` }}
                  >
                    Bill Project
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AccountBalanceWalletIcon />}
                    onClick={() => handleOpenStatusModal(project)}
                    sx={{ fontWeight: 700, borderRadius: `${tokens.borderRadius.sm}px` }}
                  >
                    Financials
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Bill Project Dialog */}
      <Dialog open={Boolean(billingProject)} onClose={() => !submittingBill && setBillingProject(null)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          Generate Bill / Invoice for {billingProject?.projectName}
        </DialogTitle>
        <DialogContent dividers>
          {billSuccessMsg && <Alert severity="success" sx={{ mb: 2 }}>{billSuccessMsg}</Alert>}
          {billErrorMsg && <Alert severity="error" sx={{ mb: 2 }}>{billErrorMsg}</Alert>}

          <Box sx={{ mb: 2.5, p: 2, bgcolor: tokens.colors.secondary[50], borderRadius: `${tokens.borderRadius.sm}px` }}>
            <Typography variant="body2" color="text.secondary">
              Project: <strong>{billingProject?.projectName} ({billingProject?.projectCode})</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Client: <strong>{billingProject?.customer?.companyName || "Client"}</strong>
            </Typography>
          </Box>

          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
            Line Items
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 2.5 }}>
            {billItems.map((item, idx) => (
              <Box key={idx} sx={{ display: "flex", gap: 1, alignItems: "center", bgcolor: "#fff", p: 1.5, border: `1px solid ${tokens.colors.secondary[200]}`, borderRadius: `${tokens.borderRadius.sm}px` }}>
                <TextField
                  label="Item Name / Service"
                  size="small"
                  value={item.itemName}
                  onChange={(e) => handleItemChange(idx, "itemName", e.target.value)}
                  sx={{ flex: 2 }}
                />
                <TextField
                  label="Description"
                  size="small"
                  value={item.description || ""}
                  onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                  sx={{ flex: 2 }}
                />
                <TextField
                  label="Qty / Hrs"
                  type="number"
                  size="small"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(idx, "quantity", Number(e.target.value))}
                  sx={{ width: 100 }}
                />
                <TextField
                  label="Unit Price (₹)"
                  type="number"
                  size="small"
                  value={item.unitPrice}
                  onChange={(e) => handleItemChange(idx, "unitPrice", Number(e.target.value))}
                  sx={{ width: 120 }}
                />
                <Typography variant="body2" fontWeight={700} sx={{ width: 100, textAlign: "right" }}>
                  ₹{((Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)).toLocaleString()}
                </Typography>
                <IconButton size="small" color="error" onClick={() => handleRemoveItem(idx)} disabled={billItems.length === 1}>
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
            <Button startIcon={<AddIcon />} onClick={handleAddItem} sx={{ alignSelf: "flex-start", fontWeight: 700 }}>
              Add Item
            </Button>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 2.5 }}>
            <TextField
              label="Tax Amount (₹)"
              type="number"
              size="small"
              value={taxAmount}
              onChange={(e) => setTaxAmount(Number(e.target.value))}
            />
            <TextField
              label="Discount Amount (₹)"
              type="number"
              size="small"
              value={discountAmount}
              onChange={(e) => setDiscountAmount(Number(e.target.value))}
            />
          </Box>

          <TextField
            label="Billing Notes / Milestones Completed"
            multiline
            rows={2}
            fullWidth
            size="small"
            value={billNotes}
            onChange={(e) => setBillNotes(e.target.value)}
            sx={{ mb: 2.5 }}
          />

          <Box sx={{ p: 2, bgcolor: tokens.colors.primary[50], borderRadius: `${tokens.borderRadius.sm}px`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="subtitle1" fontWeight={700} color={tokens.colors.primary[700]}>
              Total Invoice Amount
            </Typography>
            <Typography variant="h5" fontWeight={800} color={tokens.colors.primary.main}>
              ₹{totalBill.toLocaleString()}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setBillingProject(null)} disabled={submittingBill}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitBill}
            disabled={submittingBill || totalBill <= 0}
            startIcon={submittingBill ? <CircularProgress size={16} /> : <ReceiptLongIcon />}
            sx={{ fontWeight: 700 }}
          >
            {submittingBill ? "Submitting Bill..." : "Create & Submit Bill"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Financial Status Dialog */}
      <Dialog open={Boolean(statusProject)} onClose={() => setStatusProject(null)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          Financial Status — {statusProject?.projectName}
        </DialogTitle>
        <DialogContent dividers>
          {loadingSummary ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <CircularProgress />
            </Box>
          ) : billingSummary ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(4, 1fr)" }, gap: 2 }}>
                <Box sx={{ p: 2, borderRadius: `${tokens.borderRadius.sm}px`, bgcolor: tokens.colors.secondary[50], border: `1px solid ${tokens.colors.secondary[200]}` }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>CONTRACT BUDGET</Typography>
                  <Typography variant="h6" fontWeight={800}>
                    {billingSummary.budget ? `₹${billingSummary.budget.toLocaleString()}` : "Custom"}
                  </Typography>
                </Box>
                <Box sx={{ p: 2, borderRadius: `${tokens.borderRadius.sm}px`, bgcolor: tokens.colors.primary[50], border: `1px solid ${tokens.colors.primary[100]}` }}>
                  <Typography variant="caption" color={tokens.colors.primary[700]} fontWeight={700}>TOTAL BILLED</Typography>
                  <Typography variant="h6" fontWeight={800} color={tokens.colors.primary.main}>
                    ₹{(billingSummary.totalBilled || 0).toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{ p: 2, borderRadius: `${tokens.borderRadius.sm}px`, bgcolor: tokens.colors.success[50], border: `1px solid ${tokens.colors.success[100]}` }}>
                  <Typography variant="caption" color={tokens.colors.success[700]} fontWeight={700}>TOTAL PAID</Typography>
                  <Typography variant="h6" fontWeight={800} color={tokens.colors.success[700]}>
                    ₹{(billingSummary.totalPaid || 0).toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{ p: 2, borderRadius: `${tokens.borderRadius.sm}px`, bgcolor: tokens.colors.warning[50], border: `1px solid ${tokens.colors.warning[100]}` }}>
                  <Typography variant="caption" color={tokens.colors.warning[700]} fontWeight={700}>REMAINING BALANCE</Typography>
                  <Typography variant="h6" fontWeight={800} color={tokens.colors.warning[700]}>
                    ₹{(billingSummary.remainingProjectBalance || 0).toLocaleString()}
                  </Typography>
                </Box>
              </Box>

              <Typography variant="subtitle2" fontWeight={700}>
                Project Invoices ({billingSummary.invoices?.length || 0})
              </Typography>

              {billingSummary.invoices && billingSummary.invoices.length > 0 ? (
                <TableContainer sx={{ border: `1px solid ${tokens.colors.secondary[200]}`, borderRadius: `${tokens.borderRadius.sm}px` }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: tokens.colors.secondary[100] }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Invoice #</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Issue Date</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Paid</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Pending</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {billingSummary.invoices.map((inv: any) => (
                        <TableRow key={inv.id}>
                          <TableCell sx={{ fontWeight: 700 }}>{inv.invoiceNumber}</TableCell>
                          <TableCell>{inv.issueDate || "—"}</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>₹{(inv.totalAmount || 0).toLocaleString()}</TableCell>
                          <TableCell sx={{ color: tokens.colors.success[700] }}>₹{(inv.paidAmount || 0).toLocaleString()}</TableCell>
                          <TableCell sx={{ color: inv.pendingAmount > 0 ? tokens.colors.warning[700] : "text.secondary" }}>
                            ₹{(inv.pendingAmount || 0).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={inv.status}
                              size="small"
                              color={inv.status === "PAID" ? "success" : inv.status === "PARTIALLY_PAID" ? "info" : "warning"}
                              sx={{ fontWeight: 700 }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic", textAlign: "center", py: 2 }}>
                  No invoices generated yet for this project.
                </Typography>
              )}
            </Box>
          ) : (
            <Typography variant="body2" color="error">
              Unable to load project billing details.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setStatusProject(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

