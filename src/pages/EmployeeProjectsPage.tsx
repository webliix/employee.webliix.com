import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import LinearProgress from "@mui/material/LinearProgress";
import { tokens } from "../theme/tokens";
import { projectApi, type Project } from "../services/projectApi";

export function EmployeeProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    projectApi
      .getMyProjects()
      .then((data) => setProjects(data))
      .catch((err) => console.error("Error fetching projects:", err))
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
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box>
        <Typography variant="h5" fontWeight={800} sx={{ color: tokens.colors.secondary[900] }}>
          My Assigned Projects
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748b" }}>
          Projects where you have active team membership
        </Typography>
      </Box>

      {projects.length === 0 ? (
        <Card sx={{ p: 4, textAlign: "center", borderRadius: `${tokens.borderRadius.lg}px` }}>
          <Typography variant="body1" sx={{ color: "#94a3b8" }}>
            No projects currently assigned. Please contact your project manager.
          </Typography>
        </Card>
      ) : (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }, gap: 2.5 }}>
          {projects.map((project) => (
            <Card key={project.id} sx={{ borderRadius: `${tokens.borderRadius.lg}px`, boxShadow: tokens.shadows.sm, display: "flex", flexDirection: "column" }}>
              <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Chip label={project.projectCode} size="small" sx={{ fontWeight: 700, bgcolor: tokens.colors.primary[50], color: tokens.colors.primary[700] }} />
                  <Chip label={project.status} size="small" sx={{ fontWeight: 600 }} />
                </Box>

                <Typography variant="h6" fontWeight={700} sx={{ mt: 0.5 }}>
                  {project.projectName}
                </Typography>

                {project.description && (
                  <Typography variant="body2" sx={{ color: "#64748b", flex: 1 }}>
                    {project.description}
                  </Typography>
                )}

                {project.customer && (
                  <Box sx={{ p: 1.5, bgcolor: "#f8fafc", borderRadius: `${tokens.borderRadius.sm}px` }}>
                    <Typography variant="caption" sx={{ color: "#94a3b8", display: "block" }}>Client</Typography>
                    <Typography variant="body2" fontWeight={600}>{project.customer.companyName}</Typography>
                  </Box>
                )}

                {project.progressPercentage !== undefined && (
                  <Box sx={{ mt: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                      <Typography variant="caption" sx={{ color: "#64748b" }}>Progress</Typography>
                      <Typography variant="caption" fontWeight={700}>{project.progressPercentage}%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={project.progressPercentage || 0} sx={{ height: 6, borderRadius: 3 }} />
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}
