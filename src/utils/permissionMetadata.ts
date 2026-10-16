export interface PermissionMeta {
  code: string;
  name: string;
  module: string;
  category: "Work & Projects" | "Support & Tickets" | "Finance & Billing" | "HR & Workforce" | "CRM & Clients" | "System & Admin";
  description: string;
  isApprovalAuthority?: boolean;
}

export const PERMISSION_METADATA_MAP: Record<string, PermissionMeta> = {
  // Dashboard & Portal
  EMPLOYEE_PORTAL_ACCESS: {
    code: "EMPLOYEE_PORTAL_ACCESS",
    name: "Employee Portal Access",
    module: "Core",
    category: "System & Admin",
    description: "Access and sign in to the Webliix Employee Workspace Portal.",
  },
  DASHBOARD_VIEW: {
    code: "DASHBOARD_VIEW",
    name: "Dashboard Overview",
    module: "Dashboard",
    category: "Work & Projects",
    description: "View workspace KPI cards, recent activity, and personal operational status.",
  },

  // Projects & Tasks
  PROJECTS_VIEW: {
    code: "PROJECTS_VIEW",
    name: "View Assigned Projects",
    module: "Projects",
    category: "Work & Projects",
    description: "Inspect project deliverables, timelines, milestones, comments, and project briefs.",
  },
  PROJECTS_CREATE: {
    code: "PROJECTS_CREATE",
    name: "Create Projects",
    module: "Projects",
    category: "Work & Projects",
    description: "Initialize and create new customer and internal projects.",
  },
  PROJECTS_EDIT: {
    code: "PROJECTS_EDIT",
    name: "Edit Projects & Milestones",
    module: "Projects",
    category: "Work & Projects",
    description: "Update project phases, status updates, progress percentages, and deliverables.",
  },
  PROJECTS_DELETE: {
    code: "PROJECTS_DELETE",
    name: "Delete Projects",
    module: "Projects",
    category: "Work & Projects",
    description: "Permanently delete or archive project repositories and tasks.",
  },
  PROJECTS_BILLING_VIEW: {
    code: "PROJECTS_BILLING_VIEW",
    name: "View Project Billing Context",
    module: "Projects",
    category: "Finance & Billing",
    description: "Access project contract budget, billing milestones, and unbilled balance snapshots.",
  },

  // Daily Work Logs
  WORKLOGS_SUBMIT: {
    code: "WORKLOGS_SUBMIT",
    name: "Submit Daily Work Logs",
    module: "Work Logs",
    category: "Work & Projects",
    description: "Submit daily summaries, hours worked, completed tasks, and blockers for review.",
  },
  WORKLOGS_VIEW: {
    code: "WORKLOGS_VIEW",
    name: "View Work Logs",
    module: "Work Logs",
    category: "Work & Projects",
    description: "View logged daily work history, timesheets, and manager review notes.",
  },
  WORKLOGS_REVIEW: {
    code: "WORKLOGS_REVIEW",
    name: "Review & Approve Work Logs",
    module: "Work Logs",
    category: "Work & Projects",
    description: "Approve or reject team member daily work logs and timesheets.",
    isApprovalAuthority: true,
  },

  // Support Tickets
  TICKETS_VIEW: {
    code: "TICKETS_VIEW",
    name: "View Support Tickets",
    module: "Tickets",
    category: "Support & Tickets",
    description: "View client support inquiries, assigned bug tickets, and SLA deadlines.",
  },
  TICKETS_CREATE: {
    code: "TICKETS_CREATE",
    name: "Open Support Tickets",
    module: "Tickets",
    category: "Support & Tickets",
    description: "Submit and open new support tickets on behalf of clients or internal issues.",
  },
  TICKETS_EDIT: {
    code: "TICKETS_EDIT",
    name: "Update Ticket Status & Reply",
    module: "Tickets",
    category: "Support & Tickets",
    description: "Add messages, attachments, update status, and resolve assigned customer tickets.",
  },
  TICKETS_ASSIGN: {
    code: "TICKETS_ASSIGN",
    name: "Assign Tickets",
    module: "Tickets",
    category: "Support & Tickets",
    description: "Reassign tickets to department team members or support specialists.",
    isApprovalAuthority: true,
  },
  TICKETS_DELETE: {
    code: "TICKETS_DELETE",
    name: "Delete Tickets",
    module: "Tickets",
    category: "Support & Tickets",
    description: "Permanently delete spam or duplicate support tickets.",
  },

  // Business Expenses
  EXPENSES_VIEW: {
    code: "EXPENSES_VIEW",
    name: "View Expense Claims",
    module: "Expenses",
    category: "Finance & Billing",
    description: "View submitted business expense reimbursements and payment status.",
  },
  EXPENSES_SUBMIT: {
    code: "EXPENSES_SUBMIT",
    name: "Submit Expense Reimbursements",
    module: "Expenses",
    category: "Finance & Billing",
    description: "Create and submit expense claims for travel, equipment, meals, and deliverables.",
  },
  EXPENSES_CREATE: {
    code: "EXPENSES_CREATE",
    name: "Submit Expense Reports",
    module: "Expenses",
    category: "Finance & Billing",
    description: "Submit new expense claims for processing.",
  },
  EXPENSES_EDIT: {
    code: "EXPENSES_EDIT",
    name: "Edit Expenses",
    module: "Expenses",
    category: "Finance & Billing",
    description: "Modify pending expense claims before review.",
  },
  EXPENSES_APPROVE: {
    code: "EXPENSES_APPROVE",
    name: "Approve / Reject Expenses",
    module: "Expenses",
    category: "Finance & Billing",
    description: "Authorized to review and approve or reject team expense reimbursement claims.",
    isApprovalAuthority: true,
  },
  EXPENSES_PAY: {
    code: "EXPENSES_PAY",
    name: "Disburse / Pay Expenses",
    module: "Expenses",
    category: "Finance & Billing",
    description: "Authorize disbursement for approved expense claims.",
    isApprovalAuthority: true,
  },

  // Field Payment Submissions
  PAYMENT_SUBMISSIONS_VIEW: {
    code: "PAYMENT_SUBMISSIONS_VIEW",
    name: "View Payment Submissions",
    module: "Payments",
    category: "Finance & Billing",
    description: "View submitted client payment proofs and transaction vouchers.",
  },
  PAYMENT_SUBMISSIONS_SUBMIT: {
    code: "PAYMENT_SUBMISSIONS_SUBMIT",
    name: "Submit Client Payment Proofs",
    module: "Payments",
    category: "Finance & Billing",
    description: "Submit customer payment receipts, checks, and reference numbers from field operations.",
  },
  PAYMENT_SUBMISSIONS_REVIEW: {
    code: "PAYMENT_SUBMISSIONS_REVIEW",
    name: "Review & Verify Payments",
    module: "Payments",
    category: "Finance & Billing",
    description: "Authorized to verify, approve, or reject employee payment proofs.",
    isApprovalAuthority: true,
  },

  // Invoices & Billing
  INVOICES_VIEW: {
    code: "INVOICES_VIEW",
    name: "View Invoices & Billing",
    module: "Invoices",
    category: "Finance & Billing",
    description: "Inspect customer billing history, issued invoices, and payment statuses.",
  },
  INVOICES_CREATE: {
    code: "INVOICES_CREATE",
    name: "Generate Invoices",
    module: "Invoices",
    category: "Finance & Billing",
    description: "Create new client tax invoices with milestone deliverables.",
  },
  INVOICES_EDIT: {
    code: "INVOICES_EDIT",
    name: "Edit Invoices",
    module: "Invoices",
    category: "Finance & Billing",
    description: "Modify draft or pending invoices.",
  },
  INVOICES_SEND: {
    code: "INVOICES_SEND",
    name: "Send Invoices to Clients",
    module: "Invoices",
    category: "Finance & Billing",
    description: "Dispatch official invoice PDF notifications to customer billing contacts.",
  },

  // Quotations
  QUOTATIONS_VIEW: {
    code: "QUOTATIONS_VIEW",
    name: "View Quotations",
    module: "Quotations",
    category: "Finance & Billing",
    description: "View sales quotations and cost estimates.",
  },
  QUOTATIONS_CREATE: {
    code: "QUOTATIONS_CREATE",
    name: "Draft Quotations",
    module: "Quotations",
    category: "Finance & Billing",
    description: "Prepare project estimates and sales proposals.",
  },
  QUOTATIONS_CONVERT: {
    code: "QUOTATIONS_CONVERT",
    name: "Convert Quotations to Invoices",
    module: "Quotations",
    category: "Finance & Billing",
    description: "Transform accepted quotations directly into official invoices.",
    isApprovalAuthority: true,
  },

  // HR, Attendance & Leaves
  ATTENDANCE_VIEW: {
    code: "ATTENDANCE_VIEW",
    name: "View Attendance Records",
    module: "Attendance",
    category: "HR & Workforce",
    description: "View attendance logs, daily check-ins, check-outs, and shift hours.",
  },
  ATTENDANCE_MANAGE: {
    code: "ATTENDANCE_MANAGE",
    name: "Manage Staff Attendance",
    module: "Attendance",
    category: "HR & Workforce",
    description: "Adjust timesheets and rectify employee attendance records.",
    isApprovalAuthority: true,
  },
  LEAVE_APPLY: {
    code: "LEAVE_APPLY",
    name: "Apply for Leaves",
    module: "Leave",
    category: "HR & Workforce",
    description: "Submit personal leave requests (Annual, Sick, Casual, Unpaid).",
  },
  LEAVE_VIEW: {
    code: "LEAVE_VIEW",
    name: "View Leave Applications & Balances",
    module: "Leave",
    category: "HR & Workforce",
    description: "Inspect allotted leave quotas, remaining days, and application status.",
  },
  LEAVE_APPROVE: {
    code: "LEAVE_APPROVE",
    name: "Approve Staff Leaves",
    module: "Leave",
    category: "HR & Workforce",
    description: "Approve or reject team member leave applications.",
    isApprovalAuthority: true,
  },
  PAYSLIP_VIEW_OWN: {
    code: "PAYSLIP_VIEW_OWN",
    name: "View Own Monthly Payslips",
    module: "Payroll",
    category: "HR & Workforce",
    description: "Access and download personal monthly payslips and tax deductions.",
  },
  EMPLOYEES_VIEW: {
    code: "EMPLOYEES_VIEW",
    name: "View Employee Directory",
    module: "HR core",
    category: "HR & Workforce",
    description: "View team roster, designations, and department contacts.",
  },
  EMPLOYEES_MANAGE: {
    code: "EMPLOYEES_MANAGE",
    name: "Manage Employees",
    module: "HR core",
    category: "HR & Workforce",
    description: "Add, update, or onboard employee profiles and departmental assignments.",
    isApprovalAuthority: true,
  },

  // CRM: Leads & Customers
  LEADS_VIEW: {
    code: "LEADS_VIEW",
    name: "View Sales Leads",
    module: "Leads",
    category: "CRM & Clients",
    description: "Access incoming prospect leads and sales pipeline.",
  },
  LEADS_CREATE: {
    code: "LEADS_CREATE",
    name: "Create Leads",
    module: "Leads",
    category: "CRM & Clients",
    description: "Register new business prospects and inquiries.",
  },
  LEADS_EDIT: {
    code: "LEADS_EDIT",
    name: "Update Leads",
    module: "Leads",
    category: "CRM & Clients",
    description: "Update stage, contact history, and notes on leads.",
  },
  LEADS_CONVERT: {
    code: "LEADS_CONVERT",
    name: "Convert Leads to Customers",
    module: "Leads",
    category: "CRM & Clients",
    description: "Promote qualified prospects into active customer accounts.",
    isApprovalAuthority: true,
  },
  CUSTOMERS_VIEW: {
    code: "CUSTOMERS_VIEW",
    name: "View Customer Directory",
    module: "Customers",
    category: "CRM & Clients",
    description: "Access client accounts, contacts, and company profiles.",
  },
  CUSTOMERS_CREATE: {
    code: "CUSTOMERS_CREATE",
    name: "Create Customer Accounts",
    module: "Customers",
    category: "CRM & Clients",
    description: "Add new corporate or individual client entities.",
  },
  CUSTOMERS_EDIT: {
    code: "CUSTOMERS_EDIT",
    name: "Edit Customer Accounts",
    module: "Customers",
    category: "CRM & Clients",
    description: "Update client details, contact persons, and addresses.",
  },

  // Reports
  REPORTS_FINANCE_VIEW: {
    code: "REPORTS_FINANCE_VIEW",
    name: "View Financial & Revenue Reports",
    module: "Reports",
    category: "Finance & Billing",
    description: "Access monthly billing summaries, profit/loss, and revenue analytics.",
  },
  REPORTS_PROJECTS_VIEW: {
    code: "REPORTS_PROJECTS_VIEW",
    name: "View Project Analytics",
    module: "Reports",
    category: "Work & Projects",
    description: "Analyze project delivery rates, task velocity, and milestone completion.",
  },

  // Marketing & System
  BLOGS_MANAGE: {
    code: "BLOGS_MANAGE",
    name: "Manage Public Blog Posts",
    module: "Marketing",
    category: "System & Admin",
    description: "Draft, edit, publish, and delete articles for the public website blog.",
  },
  AUDIT_VIEW: {
    code: "AUDIT_VIEW",
    name: "View Security Audit Logs",
    module: "Audit",
    category: "System & Admin",
    description: "Inspect user action trails, IP addresses, and operational security logs.",
  },
  SETTINGS_VIEW: {
    code: "SETTINGS_VIEW",
    name: "View System Settings",
    module: "Settings",
    category: "System & Admin",
    description: "Inspect workspace branding, operational defaults, and configurations.",
  },
};

export function getPermissionMetadata(code: string): PermissionMeta {
  if (PERMISSION_METADATA_MAP[code]) {
    return PERMISSION_METADATA_MAP[code];
  }
  // Fallback for custom or newly added permissions
  const parts = code.split("_");
  const action = parts[parts.length - 1];
  const module = parts.slice(0, parts.length - 1).join(" ") || "General";
  const name = `${module.charAt(0).toUpperCase() + module.slice(1).toLowerCase()} ${action.toLowerCase()}`;
  return {
    code,
    name,
    module: module.toUpperCase(),
    category: "System & Admin",
    description: `Grants capability to ${action.toLowerCase()} in ${module.toLowerCase()} module.`,
  };
}

export const SCOPE_DESCRIPTIONS: Record<string, { label: string; description: string; color: string; bg: string }> = {
  OWN: {
    label: "Self / Own Only",
    description: "Limited strictly to records and entities assigned to or created by you.",
    color: "#0369a1",
    bg: "#e0f2fe",
  },
  DEPARTMENT: {
    label: "Department Wide",
    description: "Applies to all records and staff belonging to your assigned department.",
    color: "#92400e",
    bg: "#fef3c7",
  },
  ALL: {
    label: "Organization Wide",
    description: "Full workspace-wide visibility and administrative authority across all teams.",
    color: "#991b1b",
    bg: "#fee2e2",
  },
};
