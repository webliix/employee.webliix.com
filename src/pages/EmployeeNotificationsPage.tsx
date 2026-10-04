import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import { tokens } from "../theme/tokens";
import { notificationApi, type NotificationItem } from "../services/notificationApi";

export function EmployeeNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationApi.getMyNotifications();
      setNotifications(data);
    } catch (err) {
      console.error("Error loading notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, status: "READ" } : n))
      );
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, status: "READ" })));
    } catch (err) {
      console.error("Error marking all as read:", err);
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
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} sx={{ color: tokens.colors.secondary[900] }}>
            Notifications & Activity Alerts
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b" }}>
            Stay updated on assignment changes, ticket replies and review decisions
          </Typography>
        </Box>
        {notifications.some((n) => n.status !== "READ") && (
          <Button
            variant="outlined"
            startIcon={<DoneAllIcon />}
            onClick={handleMarkAllAsRead}
            sx={{ textTransform: "none", fontWeight: 700, borderRadius: `${tokens.borderRadius.md}px` }}
          >
            Mark All as Read
          </Button>
        )}
      </Box>

      {notifications.length === 0 ? (
        <Card sx={{ p: 4, textAlign: "center", borderRadius: `${tokens.borderRadius.lg}px` }}>
          <Typography variant="body1" sx={{ color: "#94a3b8" }}>
            You're all caught up! No notifications at this time.
          </Typography>
        </Card>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {notifications.map((n) => {
            const isUnread = n.status !== "READ";
            return (
              <Card
                key={n.id}
                sx={{
                  borderRadius: `${tokens.borderRadius.md}px`,
                  boxShadow: tokens.shadows.sm,
                  borderLeft: isUnread ? `4px solid ${tokens.colors.primary[600]}` : "1px solid #e2e8f0",
                  bgcolor: isUnread ? "#f8fafc" : "#ffffff",
                }}
              >
                <CardContent sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                      <Typography variant="subtitle2" fontWeight={isUnread ? 800 : 600}>
                        {n.title}
                      </Typography>
                      {n.referenceType && (
                        <Chip label={n.referenceType} size="small" sx={{ height: 20, fontSize: "0.6875rem", fontWeight: 700 }} />
                      )}
                    </Box>
                    <Typography variant="body2" sx={{ color: "#475569" }}>
                      {n.message}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#94a3b8", display: "block", mt: 1 }}>
                      {new Date(n.createdAt).toLocaleString()}
                    </Typography>
                  </Box>

                  {isUnread && (
                    <IconButton
                      size="small"
                      title="Mark as read"
                      onClick={() => handleMarkAsRead(n.id)}
                      sx={{ color: tokens.colors.primary[600] }}
                    >
                      <CheckCircleOutlineIcon fontSize="small" />
                    </IconButton>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
