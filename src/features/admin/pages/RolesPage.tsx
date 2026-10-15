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
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import SecurityIcon from "@mui/icons-material/Security";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import { http } from "../../../services/http";
import { tokens } from "../../../theme/tokens";
import { Can } from "../../../components/Can";

export function RolesPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected role & permissions view
  const [selectedRole, setSelectedRole] = useState<any | null>(null);
  const [rolePermissions, setRolePermissions] = useState<any[]>([]);
  const [loadingPerms, setLoadingPerms] = useState(false);

  // Create Role Dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [roleName, setRoleName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [roleDesc, setRoleDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await http.get("/api/v1/admin/roles");
      const list = res.data?.data;
      setRoles(Array.isArray(list) ? list : []);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleSelectRole = async (r: any) => {
    setSelectedRole(r);
    setLoadingPerms(true);
    try {
      const res = await http.get(`/api/v1/admin/roles/${r.id}`);
      const data = res.data?.data;
      setRolePermissions(data?.permissions || []);
    } catch (err: any) {
      alert("Failed to load permissions for role");
    } finally {
      setLoadingPerms(false);
    }
  };

  const handleCreateRole = async () => {
    if (!roleName.trim()) return;
    setSubmitting(true);
    try {
      await http.post("/api/v1/admin/roles", {
        name: roleName.trim().toUpperCase(),
        displayName: displayName.trim() || roleName.trim(),
        description: roleDesc.trim(),
      });
      setCreateOpen(false);
      setRoleName("");
      setDisplayName("");
      setRoleDesc("");
      fetchRoles();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to create role");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} sx={{ color: tokens.colors.secondary[900] }}>
            Roles & Permission Scopes
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b" }}>
            Single source of truth: database-backed RBAC with OWN, DEPARTMENT, and ALL data scoping
          </Typography>
        </Box>
        <Can permission="ROLES_MANAGE">
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateOpen(true)}
            sx={{
              bgcolor: tokens.colors.primary[600],
              textTransform: "none",
              fontWeight: 700,
              borderRadius: `${tokens.borderRadius.md}px`,
              "&:hover": { bgcolor: tokens.colors.primary[700] },
            }}
          >
            Create New Role
          </Button>
        </Can>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1.2fr 1.8fr" }, gap: 3 }}>
        {/* Roles List */}
        <Card sx={{ borderRadius: `${tokens.borderRadius.lg}px`, boxShadow: tokens.shadows.sm }}>
          <Box sx={{ p: 2, borderBottom: "1px solid #e2e8f0" }}>
            <Typography variant="subtitle1" fontWeight={800}>
              Configured Roles
            </Typography>
          </Box>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: "#f8fafc" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Role Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: "right" }}>Inspect</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={3} sx={{ textAlign: "center", py: 4 }}>
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : (
                  roles.map((r) => (
                    <TableRow
                      key={r.id}
                      hover
                      selected={selectedRole?.id === r.id}
                      onClick={() => handleSelectRole(r)}
                      sx={{ cursor: "pointer" }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight={700}>
                          {r.displayName || r.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {r.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {r.isSuperAdmin ? (
                          <Chip label="Super Admin" size="small" color="secondary" sx={{ fontWeight: 700, fontSize: "0.6875rem" }} />
                        ) : r.isSystem ? (
                          <Chip label="System Role" size="small" sx={{ fontWeight: 700, fontSize: "0.6875rem" }} />
                        ) : (
                          <Chip label="Custom" size="small" color="primary" sx={{ fontWeight: 700, fontSize: "0.6875rem" }} />
                        )}
                      </TableCell>
                      <TableCell sx={{ textAlign: "right" }}>
                        <Button size="small" variant="text" sx={{ textTransform: "none", fontWeight: 700 }}>
                          Permissions
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        {/* Selected Role Permissions Matrix */}
        <Card sx={{ borderRadius: `${tokens.borderRadius.lg}px`, boxShadow: tokens.shadows.sm }}>
          <Box sx={{ p: 2, borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography variant="subtitle1" fontWeight={800}>
                {selectedRole ? `Granted Permissions: ${selectedRole.displayName || selectedRole.name}` : "Select a role to inspect permissions"}
              </Typography>
              {selectedRole?.description && (
                <Typography variant="caption" color="text.secondary">
                  {selectedRole.description}
                </Typography>
              )}
            </Box>
            {selectedRole && (
              <Chip
                icon={<SecurityIcon />}
                label={selectedRole.isSuperAdmin ? "BYPASSES ALL CHECKS" : `${rolePermissions.length} Grants`}
                color={selectedRole.isSuperAdmin ? "secondary" : "primary"}
                size="small"
                sx={{ fontWeight: 700 }}
              />
            )}
          </Box>

          <Box sx={{ p: 2, maxHeight: 520, overflowY: "auto" }}>
            {loadingPerms ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                <CircularProgress size={32} />
              </Box>
            ) : !selectedRole ? (
              <Box sx={{ py: 8, textAlign: "center", color: "#94a3b8" }}>
                <SecurityIcon sx={{ fontSize: 48, color: "#cbd5e1", mb: 1 }} />
                <Typography variant="body2">
                  Select a role from the left list to review its effective permissions and data scoping.
                </Typography>
              </Box>
            ) : selectedRole.isSuperAdmin ? (
              <Alert severity="info" sx={{ my: 2 }}>
                <strong>Full Bypass:</strong> This role is designated as Super Administrator and possesses unrestricted system-wide access to all modules, bypasses data scoping filters, and has maker-checker override authority.
              </Alert>
            ) : rolePermissions.length === 0 ? (
              <Box sx={{ py: 6, textAlign: "center", color: "#94a3b8" }}>
                <Typography variant="body2">No permissions currently assigned to this role.</Typography>
              </Box>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {rolePermissions.map((rp, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      p: 1.5,
                      borderRadius: `${tokens.borderRadius.md}px`,
                      bgcolor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box>
                      <Typography variant="body2" fontWeight={700} sx={{ fontFamily: "monospace" }}>
                        {rp.permissionCode || rp.code}
                      </Typography>
                      {rp.description && (
                        <Typography variant="caption" color="text.secondary">
                          {rp.description}
                        </Typography>
                      )}
                    </Box>
                    <Chip
                      label={`SCOPE: ${rp.scope || "OWN"}`}
                      size="small"
                      color={rp.scope === "ALL" ? "success" : rp.scope === "DEPARTMENT" ? "warning" : "default"}
                      sx={{ fontWeight: 800, fontSize: "0.6875rem" }}
                    />
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Card>
      </Box>

      {/* Create Role Modal */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Create Custom Role</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField
            label="Role Code (e.g. ACCOUNTS_SPECIALIST)"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            fullWidth
            required
            helperText="Internal programmatic identifier"
          />
          <TextField
            label="Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            fullWidth
            placeholder="e.g. Accounts Specialist"
          />
          <TextField
            label="Description"
            value={roleDesc}
            onChange={(e) => setRoleDesc(e.target.value)}
            fullWidth
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCreateOpen(false)} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={submitting || !roleName.trim()}
            onClick={handleCreateRole}
            sx={{
              bgcolor: tokens.colors.primary[600],
              textTransform: "none",
              fontWeight: 700,
              "&:hover": { bgcolor: tokens.colors.primary[700] },
            }}
          >
            {submitting ? <CircularProgress size={20} /> : "Create Role"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
