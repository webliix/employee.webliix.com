import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import { tokens } from "../theme/tokens";
import { authService, type EmployeeProfile, type UserProfile } from "../services/authService";

export function EmployeeProfilePage() {
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(authService.getCurrentUser());
    authService
      .fetchMyEmployeeProfile()
      .then((data) => setProfile(data))
      .catch((err) => console.error("Error loading employee profile:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, maxWidth: 800 }}>
      <Box>
        <Typography variant="h5" fontWeight={800} sx={{ color: tokens.colors.secondary[900] }}>
          My Profile & Employment Details
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748b" }}>
          Your verified staff identity and department information
        </Typography>
      </Box>

      <Card sx={{ borderRadius: `${tokens.borderRadius.lg}px`, boxShadow: tokens.shadows.sm }}>
        <CardContent sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Header */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
            <Avatar sx={{ width: 64, height: 64, bgcolor: tokens.colors.primary[600], fontSize: "1.5rem", fontWeight: 700 }}>
              {profile?.firstName ? profile.firstName[0].toUpperCase() : "E"}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={800}>
                {profile?.firstName} {profile?.lastName}
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748b" }}>
                {profile?.designationName || user?.jobTitle || "Team Member"}
              </Typography>
              <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
                <Chip label={`Code: ${profile?.employeeCode || "N/A"}`} size="small" sx={{ fontWeight: 700 }} />
                <Chip label={profile?.active ? "Active Status" : "Inactive"} size="small" color={profile?.active ? "success" : "default"} />
              </Box>
            </Box>
          </Box>

          <Divider />

          {/* Details Grid via Box */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" }, gap: 2.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <EmailOutlinedIcon sx={{ color: "#94a3b8" }} />
              <Box>
                <Typography variant="caption" sx={{ color: "#94a3b8", display: "block" }}>Company Email</Typography>
                <Typography variant="body2" fontWeight={600}>{profile?.email || user?.email}</Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <BusinessOutlinedIcon sx={{ color: "#94a3b8" }} />
              <Box>
                <Typography variant="caption" sx={{ color: "#94a3b8", display: "block" }}>Department</Typography>
                <Typography variant="body2" fontWeight={600}>{profile?.departmentName || "Engineering & Product"}</Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <WorkOutlineOutlinedIcon sx={{ color: "#94a3b8" }} />
              <Box>
                <Typography variant="caption" sx={{ color: "#94a3b8", display: "block" }}>Employment Type</Typography>
                <Typography variant="body2" fontWeight={600}>{profile?.employmentType || "FULL_TIME"}</Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <CalendarTodayOutlinedIcon sx={{ color: "#94a3b8" }} />
              <Box>
                <Typography variant="caption" sx={{ color: "#94a3b8", display: "block" }}>Joining Date</Typography>
                <Typography variant="body2" fontWeight={600}>{profile?.joiningDate || "N/A"}</Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
