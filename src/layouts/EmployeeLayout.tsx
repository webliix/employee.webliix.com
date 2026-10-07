import { useState, useEffect, type ReactNode } from "react";
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
import Badge from "@mui/material/Badge";
import Popover from "@mui/material/Popover";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import FolderSpecialOutlinedIcon from "@mui/icons-material/FolderSpecialOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { tokens } from "../theme/tokens";
import { authService } from "../services/authService";
import { notificationApi, type NotificationItem } from "../services/notificationApi";

interface Props {
  children: ReactNode;
}

export function EmployeeLayout({ children }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getCurrentUser();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Notifications State
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);
  const [recentNotifications, setRecentNotifications] = useState<NotificationItem[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  const loadUnreadCount = async () => {
    try {
      const count = await notificationApi.getUnreadCount();
      setUnreadCount(typeof count === "number" ? count : 0);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadUnreadCount();
    const timer = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(timer);
  }, []);

  const handleOpenNotifications = async (e: React.MouseEvent<HTMLElement>) => {
    setNotifAnchorEl(e.currentTarget);
    setLoadingNotifs(true);
    try {
      const list = await notificationApi.getMyNotifications();
      setRecentNotifications(list.slice(0, 8));
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setLoadingNotifs(false);
    }
  };

  const handleNotificationClick = async (item: NotificationItem) => {
    setNotifAnchorEl(null);
    if (item.status !== "READ") {
      try {
        await notificationApi.markAsRead(item.id);
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {
        // ignore
      }
    }

    // Direct routing: if related to project, open project with parameter
    const isProjectRelated =
      item.referenceType === "PROJECT" ||
      item.referenceType === "PROJECT_UPDATE" ||
      item.title?.toLowerCase().includes("project") ||
      item.message?.toLowerCase().includes("project");

    if (isProjectRelated) {
      if (item.referenceId) {
        navigate(`/projects?projectId=${item.referenceId}`);
      } else {
        navigate("/projects");
      }
    } else if (item.referenceType === "TICKET" || item.title?.toLowerCase().includes("ticket")) {
      navigate("/tickets");
    } else if (item.referenceType === "PAYMENT" || item.title?.toLowerCase().includes("payment")) {
      navigate("/payments");
    } else {
      navigate("/notifications");
    }
  };

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

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            {/* Notification Bell with Badge */}
            <IconButton
              onClick={handleOpenNotifications}
              size="medium"
              sx={{
                color: "#64748b",
                "&:hover": { color: tokens.colors.primary[600], bgcolor: "rgba(37,99,235,0.06)" },
              }}
              aria-label="notifications"
            >
              <Badge badgeContent={unreadCount} color="error" max={99}>
                <NotificationsNoneOutlinedIcon />
              </Badge>
            </IconButton>

            {/* Notifications Popover Dropdown */}
            <Popover
              open={Boolean(notifAnchorEl)}
              anchorEl={notifAnchorEl}
              onClose={() => setNotifAnchorEl(null)}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              PaperProps={{
                sx: {
                  width: 380,
                  maxWidth: "92vw",
                  maxHeight: 480,
                  borderRadius: `${tokens.borderRadius.md}px`,
                  boxShadow: tokens.shadows.lg,
                  mt: 1,
                  display: "flex",
                  flexDirection: "column",
                },
              }}
            >
              <Box
                sx={{
                  p: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Notifications
                  </Typography>
                  {unreadCount > 0 && (
                    <Chip
                      label={`${unreadCount} new`}
                      size="small"
                      color="primary"
                      sx={{ height: 20, fontSize: "0.6875rem", fontWeight: 700 }}
                    />
                  )}
                </Box>
                {unreadCount > 0 && (
                  <Button
                    size="small"
                    onClick={async () => {
                      try {
                        await notificationApi.markAllAsRead();
                        setUnreadCount(0);
                        setRecentNotifications((prev) => prev.map((n) => ({ ...n, status: "READ" })));
                      } catch {}
                    }}
                    sx={{ textTransform: "none", fontSize: "0.75rem", p: 0.5 }}
                  >
                    Mark all read
                  </Button>
                )}
              </Box>

              <Box sx={{ flex: 1, overflowY: "auto" }}>
                {loadingNotifs ? (
                  <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : recentNotifications.length === 0 ? (
                  <Box sx={{ p: 4, textAlign: "center" }}>
                    <Typography variant="body2" color="text.secondary">
                      No notifications yet
                    </Typography>
                  </Box>
                ) : (
                  recentNotifications.map((item) => {
                    const isUnread = item.status !== "READ";
                    return (
                      <Box
                        key={item.id}
                        onClick={() => handleNotificationClick(item)}
                        sx={{
                          p: 2,
                          cursor: "pointer",
                          borderBottom: "1px solid #f1f5f9",
                          bgcolor: isUnread ? "rgba(37,99,235,0.04)" : "#ffffff",
                          "&:hover": { bgcolor: "rgba(37,99,235,0.08)" },
                          transition: "background-color 0.2s",
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 1.5,
                        }}
                      >
                        {isUnread && (
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              bgcolor: tokens.colors.primary[600],
                              mt: 0.8,
                              flexShrink: 0,
                            }}
                          />
                        )}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 0.3 }}>
                            <Typography variant="body2" fontWeight={isUnread ? 700 : 600} noWrap>
                              {item.title}
                            </Typography>
                            {item.referenceType && (
                              <Chip
                                label={item.referenceType}
                                size="small"
                                sx={{ height: 18, fontSize: "0.625rem", fontWeight: 700 }}
                              />
                            )}
                          </Box>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#475569",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              lineHeight: 1.35,
                            }}
                          >
                            {item.message}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#94a3b8", display: "block", mt: 0.5, fontSize: "0.6875rem" }}>
                            {new Date(item.createdAt).toLocaleString(undefined, {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </Typography>
                        </Box>
                        <ArrowForwardIosIcon sx={{ fontSize: 12, color: "#94a3b8", mt: 1, flexShrink: 0 }} />
                      </Box>
                    );
                  })
                )}
              </Box>

              <Box sx={{ p: 1.5, borderTop: "1px solid #e2e8f0", textAlign: "center" }}>
                <Button
                  component={Link}
                  to="/notifications"
                  onClick={() => setNotifAnchorEl(null)}
                  size="small"
                  fullWidth
                  sx={{ textTransform: "none", fontWeight: 700, fontSize: "0.8125rem" }}
                >
                  View All Notifications
                </Button>
              </Box>
            </Popover>

            {/* Profile Avatar & Menu */}
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
