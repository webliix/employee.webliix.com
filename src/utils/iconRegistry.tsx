import React from "react";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import ContactPhoneOutlinedIcon from "@mui/icons-material/ContactPhoneOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import FolderSpecialOutlinedIcon from "@mui/icons-material/FolderSpecialOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import RequestQuoteOutlinedIcon from "@mui/icons-material/RequestQuoteOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import MarkEmailReadOutlinedIcon from "@mui/icons-material/MarkEmailReadOutlined";
import StarRateOutlinedIcon from "@mui/icons-material/StarRateOutlined";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";

const ICON_MAP: Record<string, React.ReactElement> = {
  DashboardOutlined: <DashboardOutlinedIcon fontSize="small" />,
  ContactPhoneOutlined: <ContactPhoneOutlinedIcon fontSize="small" />,
  PeopleOutlined: <PeopleOutlinedIcon fontSize="small" />,
  FolderSpecialOutlined: <FolderSpecialOutlinedIcon fontSize="small" />,
  ReceiptLongOutlined: <ReceiptLongOutlinedIcon fontSize="small" />,
  RequestQuoteOutlined: <RequestQuoteOutlinedIcon fontSize="small" />,
  AccountBalanceWalletOutlined: <AccountBalanceWalletOutlinedIcon fontSize="small" />,
  ConfirmationNumberOutlined: <ConfirmationNumberOutlinedIcon fontSize="small" />,
  BadgeOutlined: <BadgeOutlinedIcon fontSize="small" />,
  PaymentsOutlined: <PaymentsOutlinedIcon fontSize="small" />,
  BarChartOutlined: <BarChartOutlinedIcon fontSize="small" />,
  SmartToyOutlined: <SmartToyOutlinedIcon fontSize="small" />,
  ArticleOutlined: <ArticleOutlinedIcon fontSize="small" />,
  MarkEmailReadOutlined: <MarkEmailReadOutlinedIcon fontSize="small" />,
  StarRateOutlined: <StarRateOutlinedIcon fontSize="small" />,
  ManageAccountsOutlined: <ManageAccountsOutlinedIcon fontSize="small" />,
  AdminPanelSettingsOutlined: <AdminPanelSettingsOutlinedIcon fontSize="small" />,
  HistoryOutlined: <HistoryOutlinedIcon fontSize="small" />,
  SettingsOutlined: <SettingsOutlinedIcon fontSize="small" />,
  AssignmentOutlined: <AssignmentOutlinedIcon fontSize="small" />,
  NotificationsNoneOutlined: <NotificationsNoneOutlinedIcon fontSize="small" />,
  PersonOutlined: <PersonOutlinedIcon fontSize="small" />,

  // Alternate key aliases
  dashboard: <DashboardOutlinedIcon fontSize="small" />,
  leads: <ContactPhoneOutlinedIcon fontSize="small" />,
  customers: <PeopleOutlinedIcon fontSize="small" />,
  projects: <FolderSpecialOutlinedIcon fontSize="small" />,
  invoices: <ReceiptLongOutlinedIcon fontSize="small" />,
  billing: <ReceiptLongOutlinedIcon fontSize="small" />,
  quotations: <RequestQuoteOutlinedIcon fontSize="small" />,
  expenses: <AccountBalanceWalletOutlinedIcon fontSize="small" />,
  tickets: <ConfirmationNumberOutlinedIcon fontSize="small" />,
  employees: <BadgeOutlinedIcon fontSize="small" />,
  payrolls: <PaymentsOutlinedIcon fontSize="small" />,
  reports: <BarChartOutlinedIcon fontSize="small" />,
  automations: <SmartToyOutlinedIcon fontSize="small" />,
  blogs: <ArticleOutlinedIcon fontSize="small" />,
  newsletter: <MarkEmailReadOutlinedIcon fontSize="small" />,
  reviews: <StarRateOutlinedIcon fontSize="small" />,
  users: <ManageAccountsOutlinedIcon fontSize="small" />,
  roles: <AdminPanelSettingsOutlinedIcon fontSize="small" />,
  audit: <HistoryOutlinedIcon fontSize="small" />,
  settings: <SettingsOutlinedIcon fontSize="small" />,
  worklogs: <AssignmentOutlinedIcon fontSize="small" />,
  notifications: <NotificationsNoneOutlinedIcon fontSize="small" />,
  profile: <PersonOutlinedIcon fontSize="small" />,
  EventAvailableOutlined: <EventAvailableOutlinedIcon fontSize="small" />,
  FactCheckOutlined: <FactCheckOutlinedIcon fontSize="small" />,
  attendance: <EventAvailableOutlinedIcon fontSize="small" />,
  leaves: <FactCheckOutlinedIcon fontSize="small" />,
};

export function getMenuIcon(iconKey?: string): React.ReactElement {
  if (!iconKey) {
    return <DashboardOutlinedIcon fontSize="small" />;
  }
  return ICON_MAP[iconKey] || <DashboardOutlinedIcon fontSize="small" />;
}
