import Skeleton from "@mui/material/Skeleton";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import "../../styles/loader.css";

export function EmployeeFadeWebliixLoader({
  message = "Loading employee overview...",
  size = "small",
}: {
  message?: string;
  size?: "small" | "medium" | "large";
}) {
  const containerClass =
    size === "small"
      ? "logo-loader-sm"
      : size === "large"
      ? "logo-loader-lg"
      : "logo-loader";

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        py: size === "small" ? 1 : 2,
      }}
    >
      <div className={containerClass}>
        <img
          src="https://res.cloudinary.com/vhth8clt/image/upload/v1788210409/logo.png"
          alt="Webliix"
          style={{ width: size === "small" ? 36 : 56, height: size === "small" ? 36 : 56, objectFit: "contain" }}
        />
      </div>
      {message && (
        <Typography
          variant="caption"
          sx={{
            color: "#64748b",
            fontWeight: 800,
            mt: 1,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            fontSize: "0.72rem",
          }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
}

export function EmployeeDashboardSkeleton() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, width: "100%", maxWidth: "100%" }}>
      {/* Top Banner with Fade Webliix Loader */}
      <Box sx={{ display: "flex", justifyContent: "center", py: 1 }}>
        <EmployeeFadeWebliixLoader message="Fetching employee allotted workspace & records..." size="small" />
      </Box>

      {/* TOP ROW: Duties (Card 1) | Hours & Environments (Cards 2 & 3) | Current Project (Card 4) */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)", lg: "1.1fr 1.3fr 1.1fr" },
          gap: 3,
        }}
      >
        {/* Card 1: Duties Skeleton */}
        <Card
          sx={{
            borderRadius: "3px",
            bgcolor: "#ffffff",
            p: 3,
            border: "1px solid #f1f5f9",
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5 }}>
            <Skeleton variant="text" width={90} height={28} sx={{ borderRadius: "2px" }} />
            <Skeleton variant="rectangular" width={28} height={28} sx={{ borderRadius: "3px" }} />
          </Box>

          <Box sx={{ bgcolor: "#f8fafc", p: 2, borderRadius: "3px", mb: 2, border: "1px solid #f1f5f9" }}>
            <Skeleton variant="text" width={110} height={20} sx={{ mb: 1.5, borderRadius: "2px" }} />
            <Skeleton variant="rectangular" height={54} sx={{ borderRadius: "3px", mb: 1 }} />
            <Skeleton variant="text" width="90%" height={18} sx={{ borderRadius: "2px" }} />
          </Box>

          <Box sx={{ bgcolor: "#f8fafc", p: 2, borderRadius: "3px", border: "1px solid #f1f5f9" }}>
            <Skeleton variant="text" width={120} height={20} sx={{ mb: 1.5, borderRadius: "2px" }} />
            <Skeleton variant="rectangular" height={40} sx={{ borderRadius: "3px", mb: 1 }} />
            <Skeleton variant="text" width="80%" height={18} sx={{ borderRadius: "2px" }} />
          </Box>
        </Card>

        {/* Middle Column: Hours & Environments Skeleton */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Hours Card */}
          <Card
            sx={{
              borderRadius: "3px",
              bgcolor: "#ffffff",
              p: 3,
              border: "1px solid #f1f5f9",
              boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
              <Skeleton variant="text" width={100} height={24} sx={{ borderRadius: "2px" }} />
              <Skeleton variant="rectangular" width={20} height={20} sx={{ borderRadius: "3px" }} />
            </Box>
            <Skeleton variant="text" width={130} height={42} sx={{ mb: 2, borderRadius: "2px" }} />
            <Skeleton variant="rectangular" height={70} sx={{ borderRadius: "3px" }} />
          </Card>

          {/* Environments Card */}
          <Card
            sx={{
              borderRadius: "3px",
              bgcolor: "#ffffff",
              p: 3,
              border: "1px solid #f1f5f9",
              boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Skeleton variant="text" width={90} height={24} sx={{ borderRadius: "2px" }} />
              <Skeleton variant="rectangular" width={20} height={20} sx={{ borderRadius: "3px" }} />
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2 }}>
                <Skeleton variant="text" width={90} height={18} />
                <Skeleton variant="text" width={110} height={18} />
                <Skeleton variant="text" width={80} height={18} />
              </Box>
              <Skeleton variant="rectangular" width={110} height={70} sx={{ borderRadius: "3px" }} />
            </Box>
          </Card>
        </Box>

        {/* Card 4: Current Project Skeleton */}
        <Card
          sx={{
            borderRadius: "3px",
            bgcolor: "#ffffff",
            p: 3,
            border: "1px solid #f1f5f9",
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5 }}>
            <Skeleton variant="text" width={130} height={26} sx={{ borderRadius: "2px" }} />
            <Skeleton variant="text" width={50} height={20} sx={{ borderRadius: "2px" }} />
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 2.5 }}>
            <Box>
              <Skeleton variant="text" width={70} height={14} sx={{ mb: 0.5 }} />
              <Skeleton variant="text" width={100} height={22} />
            </Box>
            <Box>
              <Skeleton variant="text" width={50} height={14} sx={{ mb: 0.5 }} />
              <Skeleton variant="rectangular" width={80} height={22} sx={{ borderRadius: "3px" }} />
            </Box>
            <Box>
              <Skeleton variant="text" width={80} height={14} sx={{ mb: 0.5 }} />
              <Skeleton variant="text" width={90} height={22} />
            </Box>
            <Box>
              <Skeleton variant="text" width={70} height={14} sx={{ mb: 0.5 }} />
              <Skeleton variant="text" width={90} height={22} />
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 1, pt: 1, borderTop: "1px solid #f1f5f9" }}>
            <Skeleton variant="rectangular" width={30} height={30} sx={{ borderRadius: "3px" }} />
            <Skeleton variant="rectangular" width={30} height={30} sx={{ borderRadius: "3px" }} />
            <Skeleton variant="rectangular" width={30} height={30} sx={{ borderRadius: "3px" }} />
          </Box>
        </Card>
      </Box>

      {/* BOTTOM ROW: Employee Schedule (Card 5) | Team Collaborators (Card 6) */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "2.2fr 1.1fr" },
          gap: 3,
        }}
      >
        {/* Card 5: Schedule Table Skeleton */}
        <Card
          sx={{
            borderRadius: "3px",
            bgcolor: "#ffffff",
            p: 3,
            border: "1px solid #f1f5f9",
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2.5 }}>
            <Box>
              <Skeleton variant="text" width={160} height={28} sx={{ borderRadius: "2px" }} />
              <Skeleton variant="text" width={220} height={18} sx={{ borderRadius: "2px" }} />
            </Box>
            <Skeleton variant="rectangular" width={110} height={36} sx={{ borderRadius: "3px" }} />
          </Box>

          <Skeleton variant="rectangular" height={56} sx={{ borderRadius: "3px", mb: 2.5 }} />

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Skeleton variant="rectangular" height={42} sx={{ borderRadius: "3px" }} />
            <Skeleton variant="rectangular" height={42} sx={{ borderRadius: "3px" }} />
            <Skeleton variant="rectangular" height={42} sx={{ borderRadius: "3px" }} />
          </Box>
        </Card>

        {/* Card 6: Team List Skeleton */}
        <Card
          sx={{
            borderRadius: "3px",
            bgcolor: "#ffffff",
            p: 3,
            border: "1px solid #f1f5f9",
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5 }}>
            <Skeleton variant="text" width={120} height={28} sx={{ borderRadius: "2px" }} />
            <Skeleton variant="text" width={50} height={18} sx={{ borderRadius: "2px" }} />
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {[1, 2, 3, 4].map((i) => (
              <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Skeleton variant="rectangular" width={36} height={36} sx={{ borderRadius: "3px" }} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="60%" height={18} />
                  <Skeleton variant="text" width="40%" height={14} />
                </Box>
              </Box>
            ))}
          </Box>
        </Card>
      </Box>
    </Box>
  );
}
