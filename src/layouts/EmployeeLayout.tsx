import { useState, type ReactNode } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import FolderSpecialOutlinedIcon from "@mui/icons-material/FolderSpecialOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import { tokens } from "../theme/tokens";
import { authService } from "../services/authService";

interface Props {
  children: ReactNode;
}

export function EmployeeLayout({ children }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getCurrentUser();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: <DashboardOutlinedIcon fontSize="small" /> },
    { label: "My Projects", path: "/projects", icon: <FolderSpecialOutlinedIcon fontSize="small" /> },
    { label: "Daily Work Log", path: "/work-logs", icon: <AssignmentOutlinedIcon fontSize="small" /> },
    { label: "Assigned Tickets", path: "/tickets", icon: <ConfirmationNumberOutlinedIcon fontSize="small" /> },
    { label: "Payment Submissions", path: "/payments", icon: <PaymentsOutlinedIcon fontSize="small" /> },
    { label: "Notifications", path: "/notifications", icon: <NotificationsNoneOutlinedIcon fontSize="small" /> },
    { label: "My Profile", path: "/profile", icon: <PersonOutlinedIcon fontSize="small" /> },
  ];

  const sidebarContent = (
    <Box sx={{ width: 260, height: "100%", bgcolor: "#0f172a", color: "#ffffff", display: "flex", flexDirection: "column" }}>
      {/* Brand Header */}
      <Box sx={{ p: 2.5, display: "flex", alignItems: "center", gap: 1.5, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <Box
          component="img"
          src="https://res.cloudinary.com/vhth8clt/image/upload/v1788210409/logo.png"
          alt="Webliix Logo"
          sx={{ height: 36, maxHeight: 36, objectFit: "contain" }}
        />
        <Box>
          <Typography variant="subtitle1" fontWeight={800} lineHeight={1.2}>
            Webliix Workspace
          </Typography>
          <Typography variant="caption" sx={{ color: tokens.colors.primary[300], fontSize: "0.6875rem", fontWeight: 700 }}>
            employee.webliix.com
          </Typography>
        </Box>
      </Box>

      {/* Nav List */}
      <Box sx={{ flex: 1, py: 3, px: 2, display: "flex", flexDirection: "column", gap: 0.5 }}>
        {navItems.map((item) => {
          const active = location.pathname.startsWith(item.path);
          return (
            <Button
              key={item.path}
              component={Link}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              startIcon={item.icon}
              sx={{
                justifyContent: "flex-start",
                px: 2,
                py: 1.2,
                borderRadius: `${tokens.borderRadius.md}px`,
                color: active ? "#ffffff" : "#94a3b8",
                bgcolor: active ? tokens.colors.primary[600] : "transparent",
                fontWeight: active ? 700 : 500,
                fontSize: "0.875rem",
                textTransform: "none",
                "&:hover": {
                  bgcolor: active ? tokens.colors.primary[700] : "rgba(255,255,255,0.05)",
                  color: "#ffffff",
                },
              }}
            >
              {item.label}
            </Button>
          );
        })}
      </Box>

      {/* Footer Info */}
      <Box sx={{ p: 2, borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", gap: 1.5 }}>
        <Avatar sx={{ width: 36, height: 36, bgcolor: tokens.colors.primary[500], fontSize: "0.875rem", fontWeight: 700 }}>
          {user?.firstName ? user.firstName[0].toUpperCase() : "E"}
        </Avatar>
        <Box sx={{ overflow: "hidden", flex: 1 }}>
          <Typography variant="body2" fontWeight={600} noWrap>
            {user ? `${user.firstName} ${user.lastName || ""}` : "Employee"}
          </Typography>
          <Typography variant="caption" sx={{ color: "#94a3b8" }} noWrap display="block">
            {user?.email || "employee@webliix.com"}
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f8fafc" }}>
      {/* Desktop Sidebar */}
      <Box sx={{ display: { xs: "none", md: "block" }, width: 260, flexShrink: 0 }}>
        <Box sx={{ position: "fixed", width: 260, height: "100vh" }}>
          {sidebarContent}
        </Box>
      </Box>

      {/* Mobile Drawer */}
      <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)} sx={{ display: { xs: "block", md: "none" } }}>
        {sidebarContent}
      </Drawer>

      {/* Main Content Area */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Navbar */}
        <Box
          sx={{
            height: 64,
            px: 3,
            bgcolor: "#ffffff",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton onClick={() => setMobileOpen(true)} sx={{ display: { xs: "inline-flex", md: "none" } }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" fontWeight={700} sx={{ color: tokens.colors.secondary[900], fontSize: "1.125rem" }}>
              Employee Portal
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Button
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{ textTransform: "none", color: "inherit", p: 0.5 }}
            >
              <Avatar sx={{ width: 34, height: 34, bgcolor: tokens.colors.primary[600], fontSize: "0.875rem" }}>
                {user?.firstName ? user.firstName[0].toUpperCase() : "E"}
              </Avatar>
            </Button>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
              <MenuItem onClick={() => { setAnchorEl(null); navigate("/profile"); }}>
                <PersonOutlinedIcon sx={{ mr: 1, fontSize: 20 }} /> Profile Settings
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => { setAnchorEl(null); handleLogout(); }} sx={{ color: "error.main" }}>
                <LogoutOutlinedIcon sx={{ mr: 1, fontSize: 20 }} /> Sign Out
              </MenuItem>
            </Menu>
          </Box>
        </Box>

        {/* Page Content */}
        <Box sx={{ flex: 1, p: { xs: 2, sm: 3 } }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
