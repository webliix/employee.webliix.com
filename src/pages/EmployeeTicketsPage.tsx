import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import SendIcon from "@mui/icons-material/Send";
import { tokens } from "../theme/tokens";
import { ticketApi, type Ticket, type TicketComment } from "../services/ticketApi";
import { authService } from "../services/authService";

export function EmployeeTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const user = authService.getCurrentUser();

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const data = await ticketApi.getMyTickets();
      setTickets(data);
      if (data.length > 0 && !selectedTicket) {
        selectTicket(data[0]);
      }
    } catch (err) {
      console.error("Error loading tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const selectTicket = async (t: Ticket) => {
    setSelectedTicket(t);
    try {
      const comms = await ticketApi.getComments(t.id);
      setComments(comms);
    } catch (err) {
      console.error("Error loading ticket comments:", err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const added = await ticketApi.addComment(selectedTicket.id, newComment.trim());
      setComments((prev) => [...prev, added]);
      setNewComment("");
    } catch (err) {
      console.error("Failed to add comment:", err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedTicket) return;
    try {
      const updated = await ticketApi.updateTicket(selectedTicket.id, { status });
      setSelectedTicket(updated);
      setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch (err) {
      console.error("Failed to update status:", err);
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
          Assigned Support Tickets
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748b" }}>
          Resolve tickets and chat with customers
        </Typography>
      </Box>

      {tickets.length === 0 ? (
        <Card sx={{ p: 4, textAlign: "center", borderRadius: `${tokens.borderRadius.lg}px` }}>
          <Typography variant="body1" sx={{ color: "#94a3b8" }}>
            No support tickets currently assigned to you.
          </Typography>
        </Card>
      ) : (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "340px 1fr" }, gap: 3, alignItems: "start" }}>
          {/* Ticket List Column */}
          <Card sx={{ borderRadius: `${tokens.borderRadius.lg}px`, boxShadow: tokens.shadows.sm }}>
            <CardContent sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ color: "#64748b" }}>
                YOUR QUEUE ({tickets.length})
              </Typography>
              {tickets.map((t) => {
                const isSelected = selectedTicket?.id === t.id;
                return (
                  <Box
                    key={t.id}
                    onClick={() => selectTicket(t)}
                    sx={{
                      p: 1.5,
                      borderRadius: `${tokens.borderRadius.md}px`,
                      cursor: "pointer",
                      border: "1px solid",
                      borderColor: isSelected ? tokens.colors.primary[500] : "#e2e8f0",
                      bgcolor: isSelected ? tokens.colors.primary[50] : "#ffffff",
                      "&:hover": { bgcolor: isSelected ? tokens.colors.primary[50] : "#f8fafc" },
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                      <Typography variant="caption" fontWeight={700} sx={{ color: tokens.colors.primary[700] }}>
                        {t.ticketNumber}
                      </Typography>
                      <Chip
                        label={t.status}
                        size="small"
                        color={t.status === "OPEN" ? "warning" : t.status === "RESOLVED" ? "success" : "default"}
                        sx={{ fontSize: "0.6875rem", height: 20 }}
                      />
                    </Box>
                    <Typography variant="body2" fontWeight={700} noWrap>
                      {t.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#64748b" }} noWrap display="block">
                      {t.category} • Priority: {t.priority}
                    </Typography>
                  </Box>
                );
              })}
            </CardContent>
          </Card>

          {/* Ticket Details & Chat Conversation */}
          {selectedTicket && (
            <Card sx={{ borderRadius: `${tokens.borderRadius.lg}px`, boxShadow: tokens.shadows.sm, display: "flex", flexDirection: "column" }}>
              {/* Header */}
              <Box sx={{ p: 2.5, borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Chip label={selectedTicket.ticketNumber} size="small" sx={{ fontWeight: 700 }} />
                    <Chip label={selectedTicket.priority} size="small" color={selectedTicket.priority === "HIGH" ? "error" : "default"} />
                  </Box>
                  <Typography variant="h6" fontWeight={800} sx={{ mt: 1 }}>
                    {selectedTicket.title}
                  </Typography>
                </Box>

                {/* Status Actions */}
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    size="small"
                    variant={selectedTicket.status === "IN_PROGRESS" ? "contained" : "outlined"}
                    onClick={() => handleUpdateStatus("IN_PROGRESS")}
                    sx={{ textTransform: "none", fontSize: "0.75rem" }}
                  >
                    In Progress
                  </Button>
                  <Button
                    size="small"
                    color="success"
                    variant={selectedTicket.status === "RESOLVED" ? "contained" : "outlined"}
                    onClick={() => handleUpdateStatus("RESOLVED")}
                    sx={{ textTransform: "none", fontSize: "0.75rem" }}
                  >
                    Resolve
                  </Button>
                </Box>
              </Box>

              {/* Description */}
              {selectedTicket.description && (
                <Box sx={{ p: 2.5, bgcolor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  <Typography variant="caption" fontWeight={700} sx={{ color: "#64748b", display: "block", mb: 0.5 }}>
                    INITIAL ISSUE DESCRIPTION:
                  </Typography>
                  <Typography variant="body2">{selectedTicket.description}</Typography>
                </Box>
              )}

              {/* Conversation Body */}
              <Box sx={{ p: 2.5, flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 2, minHeight: 300, maxHeight: 450 }}>
                {comments.length === 0 ? (
                  <Typography variant="body2" sx={{ color: "#94a3b8", textAlign: "center", my: "auto" }}>
                    No messages in conversation thread yet.
                  </Typography>
                ) : (
                  comments.map((c) => {
                    const isMe = c.commentedBy === `${user?.firstName} ${user?.lastName || ""}` || c.commentedBy === user?.email;
                    return (
                      <Box
                        key={c.id}
                        sx={{
                          alignSelf: isMe ? "flex-end" : "flex-start",
                          maxWidth: "80%",
                          p: 1.5,
                          borderRadius: `${tokens.borderRadius.md}px`,
                          bgcolor: isMe ? tokens.colors.primary[600] : "#f1f5f9",
                          color: isMe ? "#ffffff" : "#0f172a",
                        }}
                      >
                        <Typography variant="caption" fontWeight={700} sx={{ opacity: 0.8, display: "block" }}>
                          {c.commentedBy}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>{c.comment}</Typography>
                      </Box>
                    );
                  })
                )}
              </Box>

              {/* Chat Reply Input */}
              <Box component="form" onSubmit={handleAddComment} sx={{ p: 2, borderTop: "1px solid #e2e8f0", display: "flex", gap: 1 }}>
                <TextField
                  placeholder="Type reply to customer..."
                  size="small"
                  fullWidth
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={submittingComment || !newComment.trim()}
                  sx={{ bgcolor: tokens.colors.primary[600], minWidth: 44, px: 2 }}
                >
                  <SendIcon fontSize="small" />
                </Button>
              </Box>
            </Card>
          )}
        </Box>
      )}
    </Box>
  );
}
