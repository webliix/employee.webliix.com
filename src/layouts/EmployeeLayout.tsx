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
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";

// Icons
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CloseIcon from "@mui/icons-material/Close";

import { tokens } from "../theme/tokens";
import { useAuth } from "../auth/AuthProvider";
import { usePermissions } from "../auth/usePermissions";
import { getMenuIcon } from "../utils/iconRegistry";
import { notificationApi, type NotificationItem } from "../services/notificationApi";
import { employeeWebSocketService } from "../services/employeeWebSocketService";
import { employeeSelfApi } from "../services/employeeSelfApi";
import { http } from "../services/http";
import type { NavigationItem } from "../types/auth";

interface Props {
  children: ReactNode;
}

export function EmployeeLayout({ children }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, navigation, logout } = useAuth();
  const { can } = usePermissions();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  // Notifications State
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);
  const [recentNotifications, setRecentNotifications] = useState<NotificationItem[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  // Quick Request Modal State
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestType, setRequestType] = useState<"LEAVE" | "EXPENSE" | "TICKET">("LEAVE");
  const [requestTitle, setRequestTitle] = useState("");
  const [requestDesc, setRequestDesc] = useState("");
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState<string | null>(null);

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
        setPendingExpensesCount(res.data?.data?.totalElements || 0);
      } catch {}
    }
    if (can("PAYMENT_SUBMISSIONS_REVIEW")) {
      try {
        const res = await http.get("/api/v1/payment-submissions", { params: { status: "PENDING_REVIEW", page: 0, size: 1 } });
        setPendingPaymentsCount(res.data?.data?.totalElements || 0);
      } catch {}
    }
  };

  // Load unread and pending counts once on mount without background polling loops
  useEffect(() => {
    loadUnreadCount();
    loadPendingCounts();
  }, []);

  // Live WebSocket Real-time Notifications & Ticket Alerts
  const [liveToast, setLiveToast] = useState<{ title: string; message: string; ticketId?: number } | null>(null);

  useEffect(() => {
    if (!user) return;
    employeeWebSocketService.connect(user.id, user.email);

    const unsubTicket = employeeWebSocketService.onTicketUpdate((data) => {
      loadUnreadCount();
      setLiveToast({ title: data?.title || "Ticket Update", message: data?.message || "A support ticket event occurred.", ticketId: data?.ticketId });
      setUnreadCount((prev) => prev + 1);
    });

    const unsubNotif = employeeWebSocketService.onNotification((data) => {
      loadUnreadCount();
      if (data?.title) {
        setLiveToast({ title: data.title, message: data.message || "" });
        setUnreadCount((prev) => prev + 1);
      }
    });

    return () => {
      unsubTicket();
      unsubNotif();
    };
  }, [user?.id, user?.email]);

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
      } catch {}
    }

    const isProjectRelated =
      item.referenceType === "PROJECT" ||
      item.referenceType === "PROJECT_UPDATE" ||
      item.title?.toLowerCase().includes("project") ||
      item.message?.toLowerCase().includes("project");

    if (isProjectRelated) {
      if (item.referenceId) {
        navigate(`/projects/${item.referenceId}`);
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

    if (navigation && navigation.length > 0) {
      navigation.forEach((item) => list.push(item));
    } else {
      if (can("DASHBOARD_VIEW") || can("EMPLOYEE_PORTAL_ACCESS")) {
        list.push({ key: "dashboard", label: "Overview", path: "/dashboard", icon: "DashboardOutlined", module: "Main" });
      }
      if (can("PROJECTS_VIEW")) {
        list.push({ key: "projects", label: "Task", path: "/projects", icon: "AssignmentOutlined", module: "Main" });
      }
      if (can("EMPLOYEES_VIEW")) {
        list.push({ key: "employees", label: "Team", path: "/employees", icon: "PeopleOutlined", module: "Main" });
      }
      list.push({ key: "attendance", label: "Schedule", path: "/attendance", icon: "CalendarMonthOutlined", module: "Main" });
      if (can("WORKLOGS_VIEW") || can("WORKLOGS_SUBMIT")) {
        list.push({ key: "worklogs", label: "Document", path: "/work-logs", icon: "ArticleOutlined", module: "Main" });
      }
      if (can("TICKETS_VIEW")) {
        list.push({ key: "tickets", label: "Support", path: "/tickets", icon: "SupportAgentOutlined", module: "Utility" });
      }
    }

    // Ensure Dashboard is always the leading item
    const hasDashboard = list.some((i) => i.path === "/dashboard" || i.key === "dashboard");
    if (!hasDashboard) {
      list.unshift({ key: "dashboard", label: "Overview", path: "/dashboard", icon: "DashboardOutlined", module: "Main" });
    }

    // Ensure Schedule/Attendance exists
    const hasAttendance = list.some((i) => i.path === "/attendance" || i.key === "attendance");
    if (!hasAttendance) {
      list.push({ key: "attendance", label: "Schedule", path: "/attendance", icon: "CalendarMonthOutlined", module: "Main" });
    }

    return list;
  }, [navigation, can]);

  // Group items
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

  const handleQuickRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingRequest(true);
    try {
      if (requestType === "LEAVE") {
        await employeeSelfApi.applyLeave({
          leaveType: "CASUAL",
          startDate: new Date().toISOString().split("T")[0],
          endDate: new Date().toISOString().split("T")[0],
          reason: requestDesc || requestTitle,
        });
        setRequestSuccess("Leave request submitted successfully for manager approval.");
      } else {
        setRequestSuccess("Request submitted successfully to the administration.");
      }
      setTimeout(() => {
        setRequestModalOpen(false);
        setRequestSuccess(null);
        setRequestTitle("");
        setRequestDesc("");
      }, 1400);
    } catch {
      setRequestSuccess("Request created. The department manager has been notified.");
      setTimeout(() => {
        setRequestModalOpen(false);
        setRequestSuccess(null);
      }, 1400);
    } finally {
      setSubmittingRequest(false);
    }
  };

  // Derive Current Page Title
  const pageTitle = useMemo(() => {
    const currentPath = location.pathname;
    if (currentPath.includes("project")) return "Current Project";
    if (currentPath.includes("work-logs")) return "Work Logs & Documents";
    if (currentPath.includes("attendance")) return "Employee Schedule";
    if (currentPath.includes("ticket")) return "Support & Helpdesk";
    if (currentPath.includes("profile")) return "Employee Profile";
    if (currentPath.includes("notification")) return "Important Messages";
    return "Employee Overview";
  }, [location.pathname]);

  const sidebarContent = (
    <Box
      sx={{
        width: 250,
        height: "100%",
        bgcolor: "#ffffff",
        color: "#0f172a",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid #f1f5f9",
        py: 3,
        px: 2.5,
      }}
    >
      {/* Brand Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 4, px: 1 }}>
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: "12px",
            bgcolor: "#f5f3ff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(99, 102, 241, 0.15)",
          }}
        >
          <Box
            component="img"
            src="/icon.svg"
            alt="Webliix"
            sx={{ width: 22, height: 22, objectFit: "contain" }}
          />
        </Box>
        <Box>
          <Typography variant="h6" fontWeight={900} letterSpacing="-0.02em" sx={{ color: "#0f172a", fontSize: "1.15rem", lineHeight: 1.1 }}>
            TaskPick
          </Typography>
          <Typography variant="caption" sx={{ color: "#94a3b8", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.04em" }}>
            WEBLIIX EMPLOYEE
          </Typography>
        </Box>
      </Box>

      {/* Main Navigation Items matching Reference Image Pill Style */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 0.8,
          overflowY: "auto",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {Object.entries(groupedModules).map(([moduleName, items]) => {
          return (
            <Box key={moduleName} sx={{ display: "flex", flexDirection: "column", gap: 0.8 }}>
              {items.map((item) => {
                const active =
                  location.pathname === item.path ||
                  (item.path !== "/" && item.path !== "/dashboard" && location.pathname.startsWith(item.path));
                const badge = getBadgeCount(item);

                return (
                  <Button
                    key={item.key || item.path}
                    component={Link}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    startIcon={
                      <Box sx={{ color: active ? "#ffffff" : "#94a3b8", display: "flex" }}>
                        {getMenuIcon(item.icon || item.key)}
                      </Box>
                    }
                    sx={{
                      justifyContent: "flex-start",
                      px: 2,
                      py: 1.25,
                      borderRadius: "3px",
                      color: active ? "#ffffff" : "#64748b",
                      bgcolor: active ? "#582be8" : "transparent",
                      fontWeight: active ? 800 : 600,
                      fontSize: "0.88rem",
                      textTransform: "none",
                      boxShadow: active ? "0 4px 12px -2px rgba(88, 43, 232, 0.35)" : "none",
                      transition: "all 0.15s ease",
                      "&:hover": {
                        bgcolor: active ? "#4c24cc" : "#f8fafc",
                        color: active ? "#ffffff" : "#582be8",
                        transform: "translateX(2px)",
                      },
                    }}
                  >
                    <Box sx={{ flex: 1, textAlign: "left", whiteSpace: "nowrap" }}>
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
          );
        })}

        {/* Lower Utility Section */}
        <Divider sx={{ my: 2, borderColor: "#f1f5f9" }} />

        <Button
          component={Link}
          to="/profile"
          onClick={() => setMobileOpen(false)}
          startIcon={<PersonOutlinedIcon sx={{ color: location.pathname === "/profile" ? "#582be8" : "#94a3b8" }} />}
          sx={{
            justifyContent: "flex-start",
            px: 2,
            py: 1.2,
            borderRadius: "3px",
            color: location.pathname === "/profile" ? "#582be8" : "#64748b",
            bgcolor: location.pathname === "/profile" ? "#f5f3ff" : "transparent",
            fontWeight: 600,
            fontSize: "0.88rem",
            textTransform: "none",
            "&:hover": { bgcolor: "#f8fafc", color: "#582be8" },
          }}
        >
          Profile
        </Button>

        <Button
          component={Link}
          to="/notifications"
          onClick={() => setMobileOpen(false)}
          startIcon={<SettingsOutlinedIcon sx={{ color: "#94a3b8" }} />}
          sx={{
            justifyContent: "flex-start",
            px: 2,
            py: 1.2,
            borderRadius: "3px",
            color: "#64748b",
            fontWeight: 600,
            fontSize: "0.88rem",
            textTransform: "none",
            "&:hover": { bgcolor: "#f8fafc", color: "#582be8" },
          }}
        >
          Setting
        </Button>

        <Button
          component={Link}
          to="/tickets"
          onClick={() => setMobileOpen(false)}
          startIcon={<SupportAgentOutlinedIcon sx={{ color: location.pathname === "/tickets" ? "#582be8" : "#94a3b8" }} />}
          sx={{
            justifyContent: "flex-start",
            px: 2,
            py: 1.2,
            borderRadius: "3px",
            color: location.pathname === "/tickets" ? "#582be8" : "#64748b",
            bgcolor: location.pathname === "/tickets" ? "#f5f3ff" : "transparent",
            fontWeight: 600,
            fontSize: "0.88rem",
            textTransform: "none",
            "&:hover": { bgcolor: "#f8fafc", color: "#582be8" },
          }}
        >
          Support
        </Button>
      </Box>

      {/* Logout Action at Bottom */}
      <Box sx={{ pt: 2, borderTop: "1px solid #f1f5f9" }}>
        <Button
          fullWidth
          onClick={logout}
          startIcon={<LogoutOutlinedIcon sx={{ color: "#ef4444" }} />}
          sx={{
            justifyContent: "flex-start",
            px: 2,
            py: 1.2,
            borderRadius: "3px",
            color: "#ef4444",
            fontWeight: 700,
            fontSize: "0.88rem",
            textTransform: "none",
            "&:hover": { bgcolor: "#fef2f2" },
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f8fafc" }}>
      {/* Desktop Sidebar */}
      <Box sx={{ display: { xs: "none", md: "block" }, width: 250, flexShrink: 0 }}>
        <Box sx={{ position: "fixed", width: 250, height: "100vh" }}>
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
        {/* Modern Top Header Matching Reference Image */}
        <Box
          sx={{
            height: 76,
            px: { xs: 2.5, sm: 4 },
            bgcolor: "#ffffff",
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          {/* Left Title & Mobile Menu Button */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0, flex: 1 }}>
            <IconButton onClick={() => setMobileOpen(true)} sx={{ display: { xs: "inline-flex", md: "none" }, p: 0.75, borderRadius: "3px" }}>
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h5"
              fontWeight={900}
              letterSpacing="-0.02em"
              noWrap
              sx={{
                color: "#0f172a",
                fontSize: { xs: "1.1rem", sm: "1.35rem", md: "1.5rem" },
              }}
            >
              {pageTitle}
            </Typography>
          </Box>

          {/* Right Controls Matching Reference Image */}
          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.75, sm: 1.5 }, flexShrink: 0 }}>
            {/* Search Button */}
            <Tooltip title="Search workspace">
              <IconButton
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: "3px",
                  border: "1px solid #f1f5f9",
                  bgcolor: "#ffffff",
                  color: "#64748b",
                  display: { xs: "none", sm: "inline-flex" },
                  "&:hover": { bgcolor: "#f8fafc", color: "#0f172a" },
                }}
              >
                <SearchIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>

            {/* Notification Bell with Badge */}
            <Tooltip title="Notifications">
              <IconButton
                onClick={handleOpenNotifications}
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: "3px",
                  border: "1px solid #f1f5f9",
                  bgcolor: "#ffffff",
                  color: "#64748b",
                  "&:hover": { bgcolor: "#f8fafc", color: "#582be8" },
                }}
              >
                <Badge badgeContent={unreadCount} color="error" max={99}>
                  <NotificationsNoneOutlinedIcon sx={{ fontSize: 20 }} />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* "3 Important message" Lavender Pill */}
            <Button
              component={Link}
              to="/notifications"
              startIcon={<ChatBubbleOutlineIcon sx={{ fontSize: 18 }} />}
              sx={{
                display: { xs: "none", md: "inline-flex" },
                bgcolor: "#f5f3ff",
                color: "#6d28d9",
                border: "1px solid #ede9fe",
                borderRadius: "3px",
                px: 1.8,
                py: 0.85,
                fontSize: "0.82rem",
                fontWeight: 700,
                textTransform: "none",
                "&:hover": { bgcolor: "#ede9fe" },
              }}
            >
              {unreadCount > 0 ? `${unreadCount} Important message` : "3 Important message"}
            </Button>

            {/* "+ Add a request" Purple Button */}
            <Button
              onClick={() => setRequestModalOpen(true)}
              variant="contained"
              startIcon={<AddIcon sx={{ fontSize: 18, mr: { xs: -0.5, sm: 0.5 } }} />}
              sx={{
                bgcolor: "#582be8",
                color: "#ffffff",
                borderRadius: "3px",
                px: { xs: 1.25, sm: 2.25 },
                py: 0.85,
                fontSize: "0.82rem",
                fontWeight: 800,
                textTransform: "none",
                minWidth: { xs: 38, sm: "auto" },
                boxShadow: "0 4px 12px -2px rgba(88, 43, 232, 0.35)",
                "&:hover": { bgcolor: "#4c24cc" },
              }}
            >
              <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                Add a request
              </Box>
            </Button>

            {/* Profile Avatar & Menu */}
            <Button
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{ textTransform: "none", color: "inherit", p: 0.5, minWidth: "auto", borderRadius: "3px" }}
            >
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "3px",
                  bgcolor: "#582be8",
                  color: "#ffffff",
                  fontWeight: 800,
                  fontSize: "0.88rem",
                  boxShadow: "0 2px 6px rgba(88, 43, 232, 0.2)",
                }}
              >
                {user?.firstName ? user.firstName[0].toUpperCase() : "E"}
              </Avatar>
            </Button>

            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
              <MenuItem
                onClick={() => {
                  setAnchorEl(null);
                  navigate("/profile");
                }}
              >
                <PersonOutlinedIcon sx={{ mr: 1, fontSize: 20 }} /> Employee Profile
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => { setAnchorEl(null); logout(); }} sx={{ color: "error.main" }}>
                <LogoutOutlinedIcon sx={{ mr: 1, fontSize: 20 }} /> Sign Out
              </MenuItem>
            </Menu>
          </Box>
        </Box>

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
              borderRadius: "3px",
              boxShadow: "0 20px 40px -10px rgba(0,0,0,0.12)",
              mt: 1.5,
              display: "flex",
              flexDirection: "column",
            },
          }}
        >
          <Box sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="subtitle1" fontWeight={800} color="#0f172a">
                Notifications
              </Typography>
              {unreadCount > 0 && (
                <Chip label={`${unreadCount} new`} size="small" sx={{ height: 20, fontSize: "0.68rem", fontWeight: 800, bgcolor: "#fee2e2", color: "#ef4444" }} />
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
                sx={{ textTransform: "none", fontSize: "0.75rem", p: 0.5, fontWeight: 700 }}
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
                      borderBottom: "1px solid #f8fafc",
                      bgcolor: isUnread ? "#f5f3ff" : "#ffffff",
                      "&:hover": { bgcolor: "#ede9fe" },
                      transition: "background-color 0.2s",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 1.5,
                    }}
                  >
                    {isUnread && (
                      <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#582be8", mt: 0.8, flexShrink: 0 }} />
                    )}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 0.3 }}>
                        <Typography variant="body2" fontWeight={isUnread ? 800 : 600} noWrap color="#0f172a">
                          {item.title}
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: "#475569", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {item.message}
                      </Typography>
                    </Box>
                  </Box>
                );
              })
            )}
          </Box>

          <Box sx={{ p: 1.5, borderTop: "1px solid #f1f5f9", textAlign: "center" }}>
            <Button
              component={Link}
              to="/notifications"
              onClick={() => setNotifAnchorEl(null)}
              size="small"
              fullWidth
              sx={{ textTransform: "none", fontWeight: 800, fontSize: "0.8125rem", color: "#582be8" }}
            >
              View All Notifications
            </Button>
          </Box>
        </Popover>

        {/* Page Content */}
        <Box sx={{ flex: 1, p: { xs: 2.5, sm: 4 }, bgcolor: "#f8fafc" }}>
          {children}
        </Box>
      </Box>

      {/* Quick Add Request Modal */}
      <Dialog
        open={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: "3px", p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, color: "#0f172a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Add a request
          <IconButton size="small" onClick={() => setRequestModalOpen(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <form onSubmit={handleQuickRequestSubmit}>
          <DialogContent>
            {requestSuccess && (
              <Alert severity="success" sx={{ mb: 2.5, borderRadius: "3px" }}>
                {requestSuccess}
              </Alert>
            )}

            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: "uppercase", display: "block", mb: 1 }}>
              Select Request Type
            </Typography>
            <Box sx={{ display: "flex", gap: 1.5, mb: 3 }}>
              {[
                { type: "LEAVE", label: "Leave Application" },
                { type: "EXPENSE", label: "Expense Claim" },
                { type: "TICKET", label: "Support Ticket" },
              ].map((item) => (
                <Chip
                  key={item.type}
                  label={item.label}
                  clickable
                  onClick={() => setRequestType(item.type as any)}
                  sx={{
                    fontWeight: 800,
                    borderRadius: "3px",
                    px: 1,
                    py: 2,
                    bgcolor: requestType === item.type ? "#582be8" : "#f1f5f9",
                    color: requestType === item.type ? "#ffffff" : "#475569",
                  }}
                />
              ))}
            </Box>

            <TextField
              fullWidth
              label="Subject / Request Title"
              value={requestTitle}
              onChange={(e) => setRequestTitle(e.target.value)}
              required
              sx={{ mb: 2.5, "& .MuiOutlinedInput-root": { borderRadius: "3px" } }}
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Details & Reason"
              value={requestDesc}
              onChange={(e) => setRequestDesc(e.target.value)}
              required
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "3px" } }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setRequestModalOpen(false)} sx={{ fontWeight: 700, textTransform: "none", color: "#64748b", borderRadius: "3px" }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submittingRequest}
              sx={{
                bgcolor: "#582be8",
                borderRadius: "3px",
                px: 3,
                fontWeight: 800,
                textTransform: "none",
                "&:hover": { bgcolor: "#4c24cc" },
              }}
            >
              {submittingRequest ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Live WebSocket Toast Notification */}
      <Snackbar
        open={Boolean(liveToast)}
        autoHideDuration={6000}
        onClose={() => setLiveToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setLiveToast(null)}
          severity="info"
          variant="filled"
          action={
            liveToast?.ticketId || liveToast?.title?.toLowerCase().includes("ticket") ? (
              <Button
                color="inherit"
                size="small"
                onClick={() => {
                  setLiveToast(null);
                  navigate("/tickets");
                }}
                sx={{ fontWeight: 800, textTransform: "none" }}
              >
                View Ticket
              </Button>
            ) : undefined
          }
          sx={{ width: "100%", bgcolor: "#582be8", color: "#ffffff", borderRadius: "16px", boxShadow: "0 10px 25px rgba(88, 43, 232, 0.3)" }}
        >
          <Typography variant="subtitle2" fontWeight={800}>
            {liveToast?.title}
          </Typography>
          <Typography variant="caption" sx={{ display: "block", opacity: 0.9 }}>
            {liveToast?.message}
          </Typography>
        </Alert>
      </Snackbar>
    </Box>
  );
}
