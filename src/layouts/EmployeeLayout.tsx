import { useState, useEffect, useMemo, type ReactNode } from "react";
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
import Collapse from "@mui/material/Collapse";
import CircularProgress from "@mui/material/CircularProgress";
import Tooltip from "@mui/material/Tooltip";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import KeyOutlinedIcon from "@mui/icons-material/KeyOutlined";
import { tokens } from "../theme/tokens";
import { useAuth } from "../auth/AuthProvider";
import { usePermissions } from "../auth/usePermissions";
import { getMenuIcon } from "../utils/iconRegistry";
import { notificationApi, type NotificationItem } from "../services/notificationApi";
import { http } from "../services/http";
import { MyPermissionsDrawer } from "../components/MyPermissionsDrawer";
import type { NavigationItem } from "../types/auth";

interface Props {
  children: ReactNode;
}

export function EmployeeLayout({ children }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, permissions, navigation, logout } = useAuth();
  const { can } = usePermissions();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [permissionsDrawerOpen, setPermissionsDrawerOpen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  // Notifications State
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);
  const [recentNotifications, setRecentNotifications] = useState<NotificationItem[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  // Pending Approvals Badges
  const [pendingExpensesCount, setPendingExpensesCount] = useState<number>(0);
  const [pendingPaymentsCount, setPendingPaymentsCount] = useState<number>(0);

  const loadUnreadCount = async () => {
    try {
      const count = await notificationApi.getUnreadCount();
      setUnreadCount(typeof count === "number" ? count : 0);
    } catch {
      // ignore
    }
  };

  const loadPendingCounts = async () => {
    if (can("EXPENSES_APPROVE")) {
      try {
        const res = await http.get("/api/v1/expenses", { params: { status: "PENDING", page: 0, size: 1 } });
        const total = res.data?.data?.totalElements || 0;
        setPendingExpensesCount(total);
      } catch {
        // ignore
      }
    }
    if (can("PAYMENT_SUBMISSIONS_REVIEW")) {
      try {
        const res = await http.get("/api/v1/payment-submissions", { params: { status: "PENDING_REVIEW", page: 0, size: 1 } });
        const total = res.data?.data?.totalElements || 0;
        setPendingPaymentsCount(total);
      } catch {
        // ignore
      }
    }
  };

  useEffect(() => {
    loadUnreadCount();
    loadPendingCounts();
    const timer = setInterval(() => {
      loadUnreadCount();
      loadPendingCounts();
    }, 45000);
    return () => clearInterval(timer);
  }, [can]);

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

  const toggleSection = (moduleName: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [moduleName]: !prev[moduleName],
    }));
  };

  // Compile active navigation list: server-driven navigation + self-service employee essentials
  const computedNavItems = useMemo<NavigationItem[]>(() => {
    const list: NavigationItem[] = [];

    // If server sent navigation, use it as the source of truth
    if (navigation && navigation.length > 0) {
      navigation.forEach((item) => list.push(item));
    } else {
      // Permission-based client fallback during initial transition
      if (can("DASHBOARD_VIEW") || can("EMPLOYEE_PORTAL_ACCESS")) {
        list.push({ key: "dashboard", label: "Dashboard", path: "/dashboard", icon: "DashboardOutlined", module: "Overview" });
      }
      if (can("PROJECTS_VIEW")) {
        list.push({ key: "projects", label: "My Projects", path: "/projects", icon: "FolderSpecialOutlined", module: "Delivery" });
      }
      if (can("WORKLOGS_VIEW") || can("WORKLOGS_SUBMIT")) {
        list.push({ key: "worklogs", label: "Daily Work Log", path: "/work-logs", icon: "AssignmentOutlined", module: "Delivery" });
      }
      if (can("TICKETS_VIEW")) {
        list.push({ key: "tickets", label: "Assigned Tickets", path: "/tickets", icon: "ConfirmationNumberOutlined", module: "Delivery" });
      }
      if (can("PAYMENT_SUBMISSIONS_VIEW") || can("PAYMENT_SUBMISSIONS_SUBMIT")) {
        list.push({ key: "payments", label: "Payment Submissions", path: "/payments", icon: "PaymentsOutlined", module: "Finance" });
      }
      if (can("EXPENSES_VIEW")) {
        list.push({ key: "expenses", label: "Expenses", path: "/expenses", icon: "AccountBalanceWalletOutlined", module: "Finance" });
      }
    }

    // Always append self-service utilities if not already present in navigation
    const hasWorkLogs = list.some((i) => i.path === "/work-logs");
    if (!hasWorkLogs && (can("WORKLOGS_VIEW") || can("WORKLOGS_SUBMIT"))) {
      list.push({ key: "worklogs", label: "Daily Work Log", path: "/work-logs", icon: "AssignmentOutlined", module: "Delivery" });
    }
    const hasNotifications = list.some((i) => i.path === "/notifications");
    if (!hasNotifications) {
      list.push({ key: "notifications", label: "Notifications", path: "/notifications", icon: "NotificationsNoneOutlined", module: "Preferences" });
    }
    const hasProfile = list.some((i) => i.path === "/profile");
    if (!hasProfile) {
      list.push({ key: "profile", label: "My Profile", path: "/profile", icon: "PersonOutlined", module: "Preferences" });
    }

    return list;
  }, [navigation, can]);

  // Group items by module for structured collapsible sidebar
  const groupedModules = useMemo(() => {
    const groups: Record<string, NavigationItem[]> = {};
    computedNavItems.forEach((item) => {
      const mod = item.module || "General";
      if (!groups[mod]) {
        groups[mod] = [];
      }
      groups[mod].push(item);
    });
    return groups;
  }, [computedNavItems]);

  const getBadgeCount = (item: NavigationItem): number => {
    if (item.path === "/expenses" || item.key === "expenses") {
      return pendingExpensesCount;
    }
    if (item.path === "/payments" || item.path === "/payment-submissions" || item.key === "payments") {
      return pendingPaymentsCount;
    }
    return 0;
  };

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

      {/* Nav List Grouped by Module */}
      <Box sx={{ flex: 1, py: 2, px: 1.5, overflowY: "auto", display: "flex", flexDirection: "column", gap: 1 }}>
        {Object.entries(groupedModules).map(([moduleName, items]) => {
          const isCollapsed = !!collapsedSections[moduleName];
          return (
            <Box key={moduleName} sx={{ mb: 0.5 }}>
              <Box
                onClick={() => toggleSection(moduleName)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  px: 1.5,
                  py: 0.5,
                  cursor: "pointer",
                  borderRadius: "4px",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.04)" },
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: "#64748b",
                    fontWeight: 800,
                    fontSize: "0.6875rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  {moduleName}
                </Typography>
                {isCollapsed ? (
                  <ExpandMoreIcon sx={{ fontSize: 16, color: "#64748b" }} />
                ) : (
                  <ExpandLessIcon sx={{ fontSize: 16, color: "#64748b" }} />
                )}
              </Box>

              <Collapse in={!isCollapsed} timeout="auto" unmountOnExit>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.4, mt: 0.5 }}>
                  {items.map((item) => {
                    const active = location.pathname === item.path || (item.path !== "/" && item.path !== "/dashboard" && location.pathname.startsWith(item.path));
                    const badge = getBadgeCount(item);

                    return (
                      <Button
                        key={item.key || item.path}
                        component={Link}
                        to={item.path}
                        onClick={() => setMobileOpen(false)}
                        startIcon={getMenuIcon(item.icon || item.key)}
                        sx={{
                          justifyContent: "flex-start",
                          px: 1.5,
                          py: 1,
                          borderRadius: `${tokens.borderRadius.md}px`,
                          color: active ? "#ffffff" : "#94a3b8",
                          bgcolor: active ? tokens.colors.primary[600] : "transparent",
                          fontWeight: active ? 700 : 500,
                          fontSize: "0.84rem",
                          textTransform: "none",
                          position: "relative",
                          "&:hover": {
                            bgcolor: active ? tokens.colors.primary[700] : "rgba(255,255,255,0.06)",
                            color: "#ffffff",
                          },
                        }}
                      >
                        <Box sx={{ flex: 1, textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {item.label}
                        </Box>
                        {badge > 0 && (
                          <Chip
                            label={badge}
                            size="small"
                            color="error"
                            sx={{ height: 18, fontSize: "0.65rem", fontWeight: 800, ml: 1 }}
                          />
                        )}
                      </Button>
                    );
                  })}
                </Box>
              </Collapse>
            </Box>
          );
        })}
      </Box>

      {/* Footer Info */}
      <Box sx={{ p: 2, borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", gap: 1.5 }}>
        <Avatar sx={{ width: 36, height: 36, bgcolor: tokens.colors.primary[500], fontSize: "0.875rem", fontWeight: 700 }}>
          {user?.firstName ? user.firstName[0].toUpperCase() : "U"}
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
      <Drawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{ display: { xs: "block", md: "none" } }}
      >
        {sidebarContent}
      </Drawer>

      {/* Main Content Area */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Navbar */}
        <Box
          sx={{
            height: 64,
            px: { xs: 2, sm: 3 },
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
            {/* My Permissions Button */}
            <Tooltip title="View all granted permissions, access scopes and authorities">
              <Button
                onClick={() => setPermissionsDrawerOpen(true)}
                size="small"
                variant="outlined"
                startIcon={<SecurityOutlinedIcon sx={{ color: tokens.colors.primary[600], fontSize: "1.1rem" }} />}
                sx={{
                  display: { xs: "none", sm: "inline-flex" },
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  py: 0.5,
                  px: 1.25,
                  borderRadius: `${tokens.borderRadius.md}px`,
                  borderColor: "#e2e8f0",
                  color: tokens.colors.secondary[800],
                  bgcolor: "#ffffff",
                  "&:hover": {
                    bgcolor: "rgba(37,99,235,0.04)",
                    borderColor: tokens.colors.primary[300],
                  },
                }}
              >
                My Permissions ({permissions.size})
              </Button>
            </Tooltip>
            <Tooltip title="My Permissions">
              <IconButton
                onClick={() => setPermissionsDrawerOpen(true)}
                size="medium"
                sx={{
                  display: { xs: "inline-flex", sm: "none" },
                  color: tokens.colors.primary[600],
                }}
              >
                <SecurityOutlinedIcon />
              </IconButton>
            </Tooltip>

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
                {user?.firstName ? user.firstName[0].toUpperCase() : "U"}
              </Avatar>
            </Button>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
              <MenuItem
                onClick={() => {
                  setAnchorEl(null);
                  setPermissionsDrawerOpen(true);
                }}
              >
                <KeyOutlinedIcon sx={{ mr: 1, fontSize: 20, color: tokens.colors.primary[600] }} /> My Permissions & Access
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setAnchorEl(null);
                  navigate("/profile");
                }}
              >
                <PersonOutlinedIcon sx={{ mr: 1, fontSize: 20 }} /> Employee ID & Profile
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => { setAnchorEl(null); logout(); }} sx={{ color: "error.main" }}>
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

      {/* Permissions Slide-out Drawer */}
      <MyPermissionsDrawer
        open={permissionsDrawerOpen}
        onClose={() => setPermissionsDrawerOpen(false)}
      />
    </Box>
  );
}
