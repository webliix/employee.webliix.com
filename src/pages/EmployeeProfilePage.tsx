import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";

import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import ContactEmergencyOutlinedIcon from "@mui/icons-material/ContactEmergencyOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import KeyOutlinedIcon from "@mui/icons-material/KeyOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";

import { tokens } from "../theme/tokens";
import { authService, type EmployeeProfile } from "../services/authService";
import { useAuth } from "../auth/AuthProvider";
import type { UserPermissionItem } from "../types/auth";

export function EmployeeProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [permissions, setPermissions] = useState<UserPermissionItem[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSalary, setShowSalary] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const [empProfile, authMe] = await Promise.all([
          authService.fetchMyEmployeeProfile(),
          authService.getAuthMe().catch(() => null),
        ]);
        setProfile(empProfile);
        if (authMe) {
          setPermissions(authMe.permissions || []);
          setRoles(authMe.roles || []);
        }
      } catch (err) {
        console.error("Error loading employee profile:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  const formatCurrency = (amt?: number) => {
    if (amt === undefined || amt === null) return "₹0.00";
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amt);
  };

  const fullAddress = [profile?.address, profile?.city, profile?.state, profile?.country]
    .filter(Boolean)
    .join(", ") || "Address not provided";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, maxWidth: 900 }}>
      <Box>
        <Typography variant="h5" fontWeight={800} sx={{ color: tokens.colors.secondary[900] }}>
          My Verified Staff Identity & ID Card
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748b" }}>
          Verified employment profile, compensation breakdown, and assigned operational permissions
        </Typography>
      </Box>

      {/* Verified Employee ID Card */}
      <Card
        sx={{
          borderRadius: `${tokens.borderRadius.lg}px`,
          boxShadow: tokens.shadows.md,
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
          border: `1px solid ${tokens.colors.secondary[200]}`,
          overflow: "hidden",
        }}
      >
        <Box sx={{ bgcolor: tokens.colors.secondary[900], px: 3, py: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <VerifiedUserIcon sx={{ color: tokens.colors.primary[400], fontSize: "1.25rem" }} />
            <Typography variant="caption" sx={{ color: "#ffffff", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
              Webliix Official Employee Identity
            </Typography>
          </Box>
          <Chip
            label={profile?.active ? "VERIFIED ACTIVE" : "INACTIVE"}
            size="small"
            sx={{
              bgcolor: profile?.active ? "#15803d" : "#475569",
              color: "#ffffff",
              fontWeight: 800,
              fontSize: "0.68rem",
            }}
          />
        </Box>

        <CardContent sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Header Row */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2.5, flexWrap: "wrap" }}>
            <Avatar sx={{ width: 72, height: 72, bgcolor: tokens.colors.primary[600], fontSize: "1.75rem", fontWeight: 800 }}>
              {profile?.firstName ? profile.firstName[0].toUpperCase() : "E"}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h5" fontWeight={800} sx={{ color: tokens.colors.secondary[900] }}>
                {profile?.firstName} {profile?.lastName}
              </Typography>
              <Typography variant="body2" sx={{ color: "#475569", fontWeight: 600 }}>
                {profile?.designationName || user?.jobTitle || "Team Member"} • {profile?.departmentName || "Engineering & Product"}
              </Typography>
              <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}>
                <Chip
                  label={`ID: ${profile?.employeeCode || "N/A"}`}
                  size="small"
                  sx={{ fontWeight: 800, bgcolor: tokens.colors.primary[50], color: tokens.colors.primary[700] }}
                />
                <Chip
                  label={profile?.employmentType || "FULL_TIME"}
                  size="small"
                  variant="outlined"
                  sx={{ fontWeight: 700 }}
                />
                {roles.map((r) => (
                  <Chip
                    key={r}
                    label={`ROLE: ${r.replace("ROLE_", "")}`}
                    size="small"
                    sx={{ bgcolor: "#f1f5f9", fontWeight: 700 }}
                  />
                ))}
              </Box>
            </Box>
          </Box>

          <Divider />

          {/* Details Grid */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }, gap: 2.5 }}>
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
              <EmailOutlinedIcon sx={{ color: "#94a3b8", mt: 0.25 }} />
              <Box>
                <Typography variant="caption" sx={{ color: "#94a3b8", display: "block", fontWeight: 600 }}>Company Email</Typography>
                <Typography variant="body2" fontWeight={700}>{profile?.email || user?.email}</Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
              <PhoneOutlinedIcon sx={{ color: "#94a3b8", mt: 0.25 }} />
              <Box>
                <Typography variant="caption" sx={{ color: "#94a3b8", display: "block", fontWeight: 600 }}>Contact Phone</Typography>
                <Typography variant="body2" fontWeight={700}>{profile?.phone || user?.phone || "Not provided"}</Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
              <BusinessOutlinedIcon sx={{ color: "#94a3b8", mt: 0.25 }} />
              <Box>
                <Typography variant="caption" sx={{ color: "#94a3b8", display: "block", fontWeight: 600 }}>Department</Typography>
                <Typography variant="body2" fontWeight={700}>{profile?.departmentName || "Engineering & Product"}</Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
              <WorkOutlineOutlinedIcon sx={{ color: "#94a3b8", mt: 0.25 }} />
              <Box>
                <Typography variant="caption" sx={{ color: "#94a3b8", display: "block", fontWeight: 600 }}>Designation</Typography>
                <Typography variant="body2" fontWeight={700}>{profile?.designationName || user?.jobTitle || "Specialist"}</Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
              <CalendarTodayOutlinedIcon sx={{ color: "#94a3b8", mt: 0.25 }} />
              <Box>
                <Typography variant="caption" sx={{ color: "#94a3b8", display: "block", fontWeight: 600 }}>Joining Date</Typography>
                <Typography variant="body2" fontWeight={700}>{profile?.joiningDate || "N/A"}</Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
              <PaymentsOutlinedIcon sx={{ color: "#16a34a", mt: 0.25 }} />
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 600 }}>Basic Compensation</Typography>
                  <Tooltip title={showSalary ? "Hide salary" : "Reveal salary"}>
                    <IconButton size="small" onClick={() => setShowSalary(!showSalary)} sx={{ p: 0.25 }}>
                      {showSalary ? <VisibilityOffIcon sx={{ fontSize: "0.85rem" }} /> : <VisibilityIcon sx={{ fontSize: "0.85rem" }} />}
                    </IconButton>
                  </Tooltip>
                </Box>
                <Typography variant="body2" fontWeight={800} sx={{ color: "#16a34a" }}>
                  {showSalary ? `${formatCurrency(profile?.salary)} / month` : "••••••••"}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
              <LocationOnOutlinedIcon sx={{ color: "#94a3b8", mt: 0.25 }} />
              <Box>
                <Typography variant="caption" sx={{ color: "#94a3b8", display: "block", fontWeight: 600 }}>Location / Address</Typography>
                <Typography variant="body2" fontWeight={600}>{fullAddress}</Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
              <ContactEmergencyOutlinedIcon sx={{ color: "#ef4444", mt: 0.25 }} />
              <Box>
                <Typography variant="caption" sx={{ color: "#94a3b8", display: "block", fontWeight: 600 }}>Emergency Contact</Typography>
                <Typography variant="body2" fontWeight={700}>{profile?.emergencyContact || "Not on file"}</Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Granted Roles & Permissions Section */}
      <Card sx={{ borderRadius: `${tokens.borderRadius.lg}px`, boxShadow: tokens.shadows.sm }}>
        <CardContent sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <SecurityOutlinedIcon sx={{ color: tokens.colors.primary[600] }} />
              <Box>
                <Typography variant="subtitle1" fontWeight={800}>
                  Assigned Operational Permissions ({permissions.length})
                </Typography>
                <Typography variant="caption" sx={{ color: "#64748b" }}>
                  These permissions determine what actions you can perform and what modules you can access.
                </Typography>
              </Box>
            </Box>
            <Chip
              label={`${permissions.length} Active Grants`}
              size="small"
              color="primary"
              sx={{ fontWeight: 800 }}
            />
          </Box>

          <Divider />

          {permissions.length === 0 ? (
            <Typography variant="body2" sx={{ color: "#94a3b8", py: 2, textAlign: "center" }}>
              No custom permissions granted. You have standard workspace member access.
            </Typography>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
                gap: 1.5,
              }}
            >
              {permissions.map((p) => (
                <Box
                  key={p.code}
                  sx={{
                    p: 1.5,
                    border: "1px solid #e2e8f0",
                    borderRadius: `${tokens.borderRadius.md}px`,
                    bgcolor: "#fafafa",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <KeyOutlinedIcon sx={{ fontSize: "1rem", color: tokens.colors.primary[600] }} />
                    <Typography variant="body2" fontWeight={700} sx={{ fontSize: "0.82rem" }}>
                      {p.code}
                    </Typography>
                  </Box>
                  <Chip
                    label={p.scope}
                    size="small"
                    sx={{
                      fontSize: "0.65rem",
                      fontWeight: 800,
                      bgcolor:
                        p.scope === "ALL"
                          ? "#fee2e2"
                          : p.scope === "DEPARTMENT"
                          ? "#fef3c7"
                          : "#e0f2fe",
                      color:
                        p.scope === "ALL"
                          ? "#991b1b"
                          : p.scope === "DEPARTMENT"
                          ? "#92400e"
                          : "#075985",
                    }}
                  />
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
