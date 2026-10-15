import { lazy, type ComponentType } from "react";

export interface AppRouteDefinition {
  key: string;
  path: string;
  component: ComponentType<any>;
  permission?: string;
  anyOf?: string[];
  title?: string;
}

export const routeRegistry: Record<string, AppRouteDefinition> = {
  dashboard: {
    key: "dashboard",
    path: "/dashboard",
    component: lazy(() =>
      import("../pages/EmployeeDashboardPage").then((m) => ({
        default: m.EmployeeDashboardPage,
      }))
    ),
    anyOf: ["DASHBOARD_VIEW", "EMPLOYEE_PORTAL_ACCESS"],
    title: "Dashboard",
  },
  projects: {
    key: "projects",
    path: "/projects",
    component: lazy(() =>
      import("../pages/EmployeeProjectsPage").then((m) => ({
        default: m.EmployeeProjectsPage,
      }))
    ),
    permission: "PROJECTS_VIEW",
    title: "My Projects",
  },
  worklogs: {
    key: "worklogs",
    path: "/work-logs",
    component: lazy(() =>
      import("../pages/EmployeeWorkLogsPage").then((m) => ({
        default: m.EmployeeWorkLogsPage,
      }))
    ),
    anyOf: ["WORKLOGS_VIEW", "WORKLOGS_SUBMIT", "EMPLOYEE_PORTAL_ACCESS"],
    title: "Daily Work Log",
  },
  tickets: {
    key: "tickets",
    path: "/tickets",
    component: lazy(() =>
      import("../pages/EmployeeTicketsPage").then((m) => ({
        default: m.EmployeeTicketsPage,
      }))
    ),
    permission: "TICKETS_VIEW",
    title: "Assigned Tickets",
  },
  payments: {
    key: "payments",
    path: "/payments",
    component: lazy(() =>
      import("../pages/EmployeePaymentsPage").then((m) => ({
        default: m.EmployeePaymentsPage,
      }))
    ),
    anyOf: ["PAYMENT_SUBMISSIONS_VIEW", "PAYMENT_SUBMISSIONS_SUBMIT", "EMPLOYEE_PORTAL_ACCESS"],
    title: "Payment Submissions",
  },
  expenses: {
    key: "expenses",
    path: "/expenses",
    component: lazy(() =>
      import("../features/expenses/pages/ExpensesPage").then((m) => ({
        default: m.ExpensesPage,
      }))
    ),
    permission: "EXPENSES_VIEW",
    title: "Expenses",
  },
  invoices: {
    key: "invoices",
    path: "/invoices",
    component: lazy(() =>
      import("../features/invoices/pages/InvoicesPage").then((m) => ({
        default: m.InvoicesPage,
      }))
    ),
    permission: "INVOICES_VIEW",
    title: "Invoices & Billing",
  },
  quotations: {
    key: "quotations",
    path: "/quotations",
    component: lazy(() =>
      import("../features/quotations/pages/QuotationsPage").then((m) => ({
        default: m.QuotationsPage,
      }))
    ),
    permission: "QUOTATIONS_VIEW",
    title: "Quotations",
  },
  leads: {
    key: "leads",
    path: "/leads",
    component: lazy(() =>
      import("../features/leads/pages/LeadsPage").then((m) => ({
        default: m.LeadsPage,
      }))
    ),
    permission: "LEADS_VIEW",
    title: "Sales Leads",
  },
  customers: {
    key: "customers",
    path: "/customers",
    component: lazy(() =>
      import("../features/customers/pages/CustomersPage").then((m) => ({
        default: m.CustomersPage,
      }))
    ),
    permission: "CUSTOMERS_VIEW",
    title: "Customers Directory",
  },
  employees: {
    key: "employees",
    path: "/employees",
    component: lazy(() =>
      import("../features/hr/pages/EmployeesPage").then((m) => ({
        default: m.EmployeesPage,
      }))
    ),
    permission: "EMPLOYEES_VIEW",
    title: "Employee Directory",
  },
  payrolls: {
    key: "payrolls",
    path: "/payrolls",
    component: lazy(() =>
      import("../features/hr/pages/PayrollPage").then((m) => ({
        default: m.PayrollPage,
      }))
    ),
    permission: "PAYROLL_VIEW",
    title: "Payroll",
  },
  reports: {
    key: "reports",
    path: "/reports",
    component: lazy(() =>
      import("../features/reports/pages/ReportsPage").then((m) => ({
        default: m.ReportsPage,
      }))
    ),
    permission: "REPORTS_FINANCE_VIEW",
    title: "Financial Reports",
  },
  blogs: {
    key: "blogs",
    path: "/blogs",
    component: lazy(() =>
      import("../features/marketing/pages/BlogsPage").then((m) => ({
        default: m.BlogsPage,
      }))
    ),
    permission: "BLOGS_MANAGE",
    title: "Blog Management",
  },
  roles: {
    key: "roles",
    path: "/roles",
    component: lazy(() =>
      import("../features/admin/pages/RolesPage").then((m) => ({
        default: m.RolesPage,
      }))
    ),
    permission: "ROLES_MANAGE",
    title: "Roles & Permissions",
  },
  audit: {
    key: "audit",
    path: "/audit-logs",
    component: lazy(() =>
      import("../features/admin/pages/AuditLogsPage").then((m) => ({
        default: m.AuditLogsPage,
      }))
    ),
    permission: "AUDIT_VIEW",
    title: "Audit Logs",
  },
  settings: {
    key: "settings",
    path: "/settings",
    component: lazy(() =>
      import("../features/admin/pages/SettingsPage").then((m) => ({
        default: m.SettingsPage,
      }))
    ),
    permission: "SETTINGS_VIEW",
    title: "System Settings",
  },
  notifications: {
    key: "notifications",
    path: "/notifications",
    component: lazy(() =>
      import("../pages/EmployeeNotificationsPage").then((m) => ({
        default: m.EmployeeNotificationsPage,
      }))
    ),
    title: "Notifications",
  },
  profile: {
    key: "profile",
    path: "/profile",
    component: lazy(() =>
      import("../pages/EmployeeProfilePage").then((m) => ({
        default: m.EmployeeProfilePage,
      }))
    ),
    title: "My Profile",
  },
};
