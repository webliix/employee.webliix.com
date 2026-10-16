import { useState, useMemo } from "react";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import Alert from "@mui/material/Alert";

import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import KeyOutlinedIcon from "@mui/icons-material/KeyOutlined";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import StarsIcon from "@mui/icons-material/Stars";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import { tokens } from "../theme/tokens";
import { useAuth } from "../auth/AuthProvider";
import {
  getPermissionMetadata,
  SCOPE_DESCRIPTIONS,
} from "../utils/permissionMetadata";
import type { ScopeType } from "../types/auth";

interface MyPermissionsDrawerProps {
  open: boolean;
  onClose: () => void;
  employeeCode?: string;
}

export function MyPermissionsDrawer({
  open,
  onClose,
  employeeCode,
}: MyPermissionsDrawerProps) {
  const { user, permissions } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const permissionList = useMemo(() => {
    const list: { code: string; scope: ScopeType }[] = [];
    permissions.forEach((scope, code) => {
      list.push({ code, scope });
    });
    return list;
  }, [permissions]);

  const enrichedList = useMemo(() => {
    return permissionList.map((p) => ({
      ...p,
      meta: getPermissionMetadata(p.code),
    }));
  }, [permissionList]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    enrichedList.forEach((p) => set.add(p.meta.category));
    return ["ALL", ...Array.from(set)];
  }, [enrichedList]);

  const filteredList = useMemo(() => {
    return enrichedList.filter((item) => {
      const matchesSearch =
        item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.meta.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.meta.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.meta.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "ALL" || item.meta.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [enrichedList, searchTerm, selectedCategory]);

  const approvalAuthorities = useMemo(() => {
    return enrichedList.filter((i) => i.meta.isApprovalAuthority);
  }, [enrichedList]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 540 },
          display: "flex",
          flexDirection: "column",
          bgcolor: "#f8fafc",
        },
      }}
    >
      {/* Drawer Header */}
      <Box
        sx={{
          p: 3,
          bgcolor: tokens.colors.secondary[900],
          color: "#ffffff",
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                p: 1,
                borderRadius: `${tokens.borderRadius.md}px`,
                bgcolor: "rgba(255,255,255,0.1)",
                color: tokens.colors.primary[400],
                display: "flex",
              }}
            >
              <SecurityOutlinedIcon />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={800} sx={{ color: "#ffffff", lineHeight: 1.2 }}>
                My Assigned Permissions
              </Typography>
              <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                Active role grants & operational capabilities
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} sx={{ color: "#94a3b8", "&:hover": { color: "#ffffff" } }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* User Card inside Header */}
        <Box
          sx={{
            p: 1.5,
            bgcolor: "rgba(255,255,255,0.06)",
            borderRadius: `${tokens.borderRadius.md}px`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <VerifiedUserIcon sx={{ color: "#38bdf8", fontSize: "1.1rem" }} />
            <Typography variant="body2" fontWeight={700} sx={{ color: "#ffffff" }}>
              {user?.firstName} {user?.lastName}
            </Typography>
            {employeeCode && (
              <Chip
                label={employeeCode}
                size="small"
                sx={{
                  bgcolor: "rgba(56, 189, 248, 0.2)",
                  color: "#38bdf8",
                  fontWeight: 800,
                  fontSize: "0.68rem",
                  height: 20,
                }}
              />
            )}
          </Box>
          <Chip
            label={`${permissionList.length} Active Grants`}
            size="small"
            sx={{
              bgcolor: tokens.colors.primary[500],
              color: "#ffffff",
              fontWeight: 800,
              fontSize: "0.7rem",
            }}
          />
        </Box>
      </Box>

      {/* Approval Banner if user has approval authority */}
      {approvalAuthorities.length > 0 && (
        <Alert
          severity="info"
          icon={<StarsIcon sx={{ color: "#0284c7" }} />}
          sx={{
            m: 2,
            mb: 0,
            borderRadius: `${tokens.borderRadius.md}px`,
            fontWeight: 600,
            fontSize: "0.82rem",
          }}
        >
          You hold <strong>{approvalAuthorities.length} approval/review authorities</strong> across the workspace.
        </Alert>
      )}

      {/* Filter and Search Bar */}
      <Box sx={{ p: 2, pb: 1, display: "flex", flexDirection: "column", gap: 1.5 }}>
        <TextField
          size="small"
          placeholder="Search by permission code, name, or module..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#94a3b8", fontSize: "1.2rem" }} />
              </InputAdornment>
            ),
            sx: { bgcolor: "#ffffff", borderRadius: `${tokens.borderRadius.md}px` },
          }}
          fullWidth
        />

        {/* Category Pills */}
        <Box sx={{ display: "flex", gap: 0.75, overflowX: "auto", pb: 0.5 }}>
          {categories.map((cat) => (
            <Chip
              key={cat}
              label={cat === "ALL" ? `All (${enrichedList.length})` : cat}
              size="small"
              onClick={() => setSelectedCategory(cat)}
              color={selectedCategory === cat ? "primary" : "default"}
              variant={selectedCategory === cat ? "filled" : "outlined"}
              sx={{
                fontWeight: 700,
                fontSize: "0.72rem",
                bgcolor: selectedCategory === cat ? tokens.colors.primary[600] : "#ffffff",
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Permissions List */}
      <Box sx={{ flexGrow: 1, overflowY: "auto", px: 2, pb: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
        {filteredList.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center", bgcolor: "#ffffff", borderRadius: 2 }}>
            <Typography variant="body2" sx={{ color: "#94a3b8" }}>
              No permissions found matching "{searchTerm}".
            </Typography>
          </Box>
        ) : (
          filteredList.map((item) => {
            const scopeInfo = SCOPE_DESCRIPTIONS[item.scope] || {
              label: item.scope,
              description: `Scope: ${item.scope}`,
              color: "#334155",
              bg: "#f1f5f9",
            };

            return (
              <Box
                key={item.code}
                sx={{
                  p: 2,
                  bgcolor: "#ffffff",
                  borderRadius: `${tokens.borderRadius.md}px`,
                  border: "1px solid #e2e8f0",
                  boxShadow: tokens.shadows.xs,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  transition: "all 0.15s ease",
                  "&:hover": {
                    borderColor: tokens.colors.primary[300],
                    boxShadow: tokens.shadows.sm,
                  },
                }}
              >
                {/* Card Top: Name & Scope */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                    <KeyOutlinedIcon sx={{ fontSize: "1rem", color: tokens.colors.primary[600] }} />
                    <Typography variant="subtitle2" fontWeight={800} sx={{ color: tokens.colors.secondary[900] }}>
                      {item.meta.name}
                    </Typography>
                    {item.meta.isApprovalAuthority && (
                      <Chip
                        label="Approver Authority"
                        size="small"
                        icon={<StarsIcon sx={{ fontSize: "0.85rem !important" }} />}
                        sx={{
                          height: 20,
                          fontSize: "0.65rem",
                          fontWeight: 800,
                          bgcolor: "#fef3c7",
                          color: "#b45309",
                        }}
                      />
                    )}
                  </Box>

                  <Tooltip title={scopeInfo.description} arrow placement="left">
                    <Chip
                      label={item.scope}
                      size="small"
                      sx={{
                        fontWeight: 800,
                        fontSize: "0.68rem",
                        height: 22,
                        bgcolor: scopeInfo.bg,
                        color: scopeInfo.color,
                        border: `1px solid ${scopeInfo.color}33`,
                      }}
                    />
                  </Tooltip>
                </Box>

                {/* Description */}
                <Typography variant="body2" sx={{ color: "#475569", fontSize: "0.82rem" }}>
                  {item.meta.description}
                </Typography>

                {/* Meta details footer */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    pt: 0.5,
                    borderTop: "1px dashed #f1f5f9",
                  }}
                >
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <Chip
                      label={item.code}
                      size="small"
                      sx={{
                        fontFamily: "monospace",
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        bgcolor: "#f1f5f9",
                        color: "#475569",
                        height: 20,
                      }}
                    />
                    <Chip
                      label={item.meta.module}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: "0.65rem", height: 20 }}
                    />
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <CheckCircleOutlineIcon sx={{ color: "#16a34a", fontSize: "0.9rem" }} />
                    <Typography variant="caption" sx={{ color: "#16a34a", fontWeight: 700, fontSize: "0.7rem" }}>
                      Active
                    </Typography>
                  </Box>
                </Box>
              </Box>
            );
          })
        )}
      </Box>

      {/* Scope Legend Footer */}
      <Box
        sx={{
          p: 2,
          bgcolor: "#ffffff",
          borderTop: "1px solid #e2e8f0",
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <InfoOutlinedIcon sx={{ fontSize: "0.95rem", color: "#64748b" }} />
          <Typography variant="caption" fontWeight={700} sx={{ color: "#64748b", textTransform: "uppercase" }}>
            Access Scope Legend
          </Typography>
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1 }}>
          {Object.entries(SCOPE_DESCRIPTIONS).map(([key, info]) => (
            <Box
              key={key}
              sx={{
                p: 0.75,
                borderRadius: 1,
                bgcolor: info.bg,
                border: `1px solid ${info.color}33`,
              }}
            >
              <Typography variant="caption" fontWeight={800} sx={{ color: info.color, display: "block" }}>
                {key}
              </Typography>
              <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.65rem", lineHeight: 1.1, display: "block" }}>
                {info.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Drawer>
  );
}
