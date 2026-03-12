import { Router, Route, Navigate } from "@solidjs/router";
import { isLoggedIn } from "../utils/auth";

// ===== LAYOUTS =====
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";

// ===== AUTH PAGES =====
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

// ===== DASHBOARD PAGES (MASTER DATA) =====
import Assets from "../pages/dashboard/master-data/Assets";
import StockOpname from "../pages/dashboard/master-data/StockOpname";
import Conditions from "../pages/dashboard/master-data/Conditions";
import Locations from "../pages/dashboard/master-data/Locations";
import Events from "../pages/dashboard/master-data/Events";
import Types from "../pages/dashboard/master-data/Types";
import Customer from "../pages/dashboard/master-data/Customer";
import Division from "../pages/dashboard/master-data/Division";
import Freelances from "../pages/dashboard/master-data/Freelances";
import Members from "../pages/dashboard/master-data/Members";
import Positions from "../pages/dashboard/master-data/Positions";
import Questions from "../pages/dashboard/master-data/Questions";

// ===== DASHBOARD PAGES (CRUD & TRANSACTIONS) =====
import AssetCreate from "../pages/dashboard/master-data/crud/AssetCreate";
import FreelanceCreate from "../pages/dashboard/master-data/crud/FreelanceCreate";
import QuestionCreate from "../pages/dashboard/master-data/crud/QuestionCreate";
import LoadingInList from "../pages/dashboard/load-in/LoadingInList";
import LoadingInCreate from "../pages/dashboard/load-in/LoadingInCreate";
import LoadingOutList from "../pages/dashboard/load-out/LoadingOutList";
import LoadingOutCreate from "../pages/dashboard/load-out/LoadingOutCreate";
import InvoiceList from "../pages/dashboard/reporting-invoice/InvoiceList";
import InvoiceCreate from "../pages/dashboard/reporting-invoice/InvoiceCreate";
import VideoDataBankList from "../pages/dashboard/file-management-video/VideoDataList";
import VideoDataBankCreate from "../pages/dashboard/file-management-video/VideoDataCreate";
import CrewLogs from "../pages/dashboard/crews-log-invoice/CrewLogs";
import CrewLogForm from "../pages/dashboard/crews-log-invoice/CrewLogForm";
import VendorLogList from "../pages/dashboard/vendors-payment-log-invoice/VendorLogList";
import VendorLogCreate from "../pages/dashboard/vendors-payment-log-invoice/VendorLogCreate";
import CsInternalList from "../pages/dashboard/corporate-management/CsInternalList";
import CsInternalForm from "../pages/dashboard/corporate-management/CsInternalForm";

// ===== ROUTE GUARD (PROTECTED ADMIN) =====
// Ini yang bener bro! Nge-cek login dulu, kalo lolos baru render DashboardLayout
function ProtectedAdminLayout(props) {
  return isLoggedIn() ? (
    <DashboardLayout>{props.children}</DashboardLayout>
  ) : (
    <Navigate href="/login" />
  );
}

export default function AppRouter() {
  return (
    <Router>
      {/* =========================================
          PUBLIC ROUTES (AUTH)
      ========================================= */}
      <Route path="/" component={AuthLayout}>
        <Route path="" component={Login} />
        <Route path="login" component={Login} />
        <Route path="register" component={Register} />
      </Route>

      {/* =========================================
          PROTECTED ROUTES (ADMIN DASHBOARD)
      ========================================= */}
      <Route path="/admin" component={ProtectedAdminLayout}>
        {/* --- Master Data --- */}
        <Route path="conditions" component={Conditions} />
        <Route path="locations" component={Locations} />
        <Route path="events" component={Events} />
        <Route path="types" component={Types} />
        <Route path="customers" component={Customer} />
        <Route path="divisions" component={Division} />
        <Route path="freelances" component={Freelances} />
        <Route path="members" component={Members} />
        <Route path="positions" component={Positions} />
        <Route path="questions" component={Questions} />
        {/* --- Assets & Stock Opname --- */}
        <Route path="asset" component={Assets} />
        <Route path="asset/create" component={AssetCreate} />
        <Route path="asset/edit/:id" component={AssetCreate} />
        <Route path="stock-opname" component={StockOpname} />
        {/* --- Transactions: Load In --- */}
        <Route path="load-in" component={LoadingInList} />
        <Route path="load-in/create" component={LoadingInCreate} />
        <Route path="load-in/edit/:id" component={LoadingInCreate} />
        {/* --- Transactions: Load Out --- */}
        <Route path="load-out" component={LoadingOutList} />
        <Route path="load-out/create" component={LoadingOutCreate} />
        <Route path="load-out/edit/:id" component={LoadingOutCreate} />
        {/* --- Transactions: Invoice --- */}
        <Route path="invoice" component={InvoiceList} />
        <Route path="invoice/create" component={InvoiceCreate} />
        <Route path="invoice/edit/:id" component={InvoiceCreate} />

        {/* --- Transactions: CrewLogs --- */}
        <Route path="crews-log" component={CrewLogs} />
        <Route path="crews-log/create" component={CrewLogForm} />
        <Route path="crews-log/edit/:id" component={CrewLogForm} />

        {/* --- Transactions: Vendor Logs --- */}
        <Route path="vendor-log" component={VendorLogList} />
        <Route path="vendor-log/create" component={VendorLogCreate} />
        <Route path="vendor-log/edit/:id" component={VendorLogCreate} />

        {/* --- File Management: Video's Team Data Bank --- */}
        <Route path="video-data-bank" component={VideoDataBankList} />
        <Route path="video-data-bank/create" component={VideoDataBankCreate} />
        <Route
          path="video-data-bank/edit/:id"
          component={VideoDataBankCreate}
        />

        {/* --- Corporate Management: CS Internal --- */}
        <Route path="corman-cs-internal" component={CsInternalList} />
        <Route path="corman-cs-internal/create" component={CsInternalForm} />
        <Route path="corman-cs-internal/edit/:id" component={CsInternalForm} />

        {/* --- Assets & Stock Opname --- */}
        <Route path="freelances/create" component={FreelanceCreate} />
        <Route path="freelances/edit/:id" component={FreelanceCreate} />

        {/* --- Questions --- */}
        <Route path="questions/create" component={QuestionCreate} />
        <Route path="questions/edit/:id" component={QuestionCreate} />
      </Route>

      {/* =========================================
          FALLBACK (404 / REDIRECT)
      ========================================= */}
      <Route path="*404" element={<Navigate href="/" />} />
    </Router>
  );
}
