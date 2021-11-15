/*!

=========================================================
* Material Dashboard React - v1.10.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2021 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/material-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
// @material-ui/icons
import DashboardIcon from "@material-ui/icons/Dashboard";
import BubbleChartIcon from "@material-ui/icons/BubbleChart";
import AccountTreeIcon from "@material-ui/icons/AccountTree";
import BarChartIcon from "@material-ui/icons/BarChart";
import TimelineIcon from "@material-ui/icons/Timeline";
import PersonIcon from "@material-ui/icons/Person";
import LibraryBooksIcon from "@material-ui/icons/LibraryBooks";
import LocationOnIcon from "@material-ui/icons/LocationOn";
import NotificationsIcon from "@material-ui/icons/Notifications";
import UnarchiveIcon from "@material-ui/icons/Unarchive";
import LanguageIcon from "@material-ui/icons/Language";
// core components/views for Admin layout
import Statistics from "views/Statistics/Statistics.js";
import Transactions from "views/Transactions/Transactions.js";
import FundsFlow from "views/FundsFlow/FundsFlow.js";
import DashboardPage from "views/Dashboard/Dashboard.js";
import AccountsActivity from "views/AccountsActivity/AccountsActivity.js";
import UserProfile from "views/UserProfile/UserProfile.js";
import TableList from "views/TableList/TableList.js";
import Typography from "views/Typography/Typography.js";
import Icons from "views/Icons/Icons.js";
import Maps from "views/Maps/Maps.js";
import NotificationsPage from "views/Notifications/Notifications.js";
import UpgradeToPro from "views/UpgradeToPro/UpgradeToPro.js";
// core components/views for RTL layout
import RTLPage from "views/RTLPage/RTLPage.js";

const dashboardRoutes = [
  {
    path: "/dashboard",
    name: "Dashboard",
    rtlName: "لوحة القيادة",
    icon: DashboardIcon,
    component: DashboardPage,
    layout: "/admin",
  },
  {
    path: "/transactions",
    name: "Transactions",
    rtlName: "لوحة القيادة",
    icon: BubbleChartIcon,
    component: Transactions,
    layout: "/admin",
  },
  {
    path: "/funds-flow",
    name: "Funds Flow",
    rtlName: "لوحة القيادة",
    icon: AccountTreeIcon,
    component: FundsFlow,
    layout: "/admin",
  },
  /*{
    path: "/accounts-activity",
    name: "Accounts Activity",
    rtlName: "قائمة الجدول",
    icon: BarChartIcon,
    component: AccountsActivity,
    layout: "/admin",
  },*/
  {
    path: "/statistics",
    name: "Statistics",
    rtlName: "قائمة الجدول",
    icon: TimelineIcon,
    component: Statistics,
    layout: "/admin",
  },
  /*{
    path: "/user",
    name: "User Profile",
    rtlName: "ملف تعريفي للمستخدم",
    icon: PersonIcon,
    component: UserProfile,
    layout: "/admin",
  },
  {
    path: "/typography",
    name: "Typography",
    rtlName: "طباعة",
    icon: LibraryBooksIcon,
    component: Typography,
    layout: "/admin",
  },
  {
    path: "/icons",
    name: "Icons",
    rtlName: "الرموز",
    icon: BubbleChartIcon,
    component: Icons,
    layout: "/admin",
  },
  {
    path: "/maps",
    name: "Maps",
    rtlName: "خرائط",
    icon: LocationOnIcon,
    component: Maps,
    layout: "/admin",
  },
  {
    path: "/notifications",
    name: "Notifications",
    rtlName: "إخطارات",
    icon: NotificationsIcon,
    component: NotificationsPage,
    layout: "/admin",
  },
  {
    path: "/rtl-page",
    name: "RTL Support",
    rtlName: "پشتیبانی از راست به چپ",
    icon: LanguageIcon,
    component: RTLPage,
    layout: "/rtl",
  },
  {
    path: "/upgrade-to-pro",
    name: "Upgrade To PRO",
    rtlName: "التطور للاحترافية",
    icon: UnarchiveIcon,
    component: UpgradeToPro,
    layout: "/admin",
  },*/
];

export default dashboardRoutes;
