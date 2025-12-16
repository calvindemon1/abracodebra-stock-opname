import { Route, Navigate, Router } from "@solidjs/router";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import AdminHome from "../pages/dashboard/AdminHome";
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import { isLoggedIn } from "../utils/auth";
import Conditions from "../pages/dashboard/Conditions";
import Locations from "../pages/dashboard/Locations";
import Events from "../pages/dashboard/Events";
import Types from "../pages/dashboard/Types";
import StockOpname from "../pages/dashboard/StockOpname";
import AssetCreate from "../pages/crud/AssetCreate";
import Assets from "../pages/dashboard/Assets";
import LoadingInList from "../pages/dashboard/load-in/LoadingInList";
import LoadingInCreate from "../pages/dashboard/load-in/LoadingInCreate";
import LoadingOutList from "../pages/dashboard/load-out/LoadingOutList";
import LoadingOutCreate from "../pages/dashboard/load-out/LoadingOutCreate";

// Protect admin route
function PrivateRoute(props) {
  return isLoggedIn() ? props.children : <Navigate href="/login" />;
}

export default function AppRouter() {
  return (
    <Router>
      {/* Root = Login */}
      <Route path="/" component={AuthLayout}>
        <Route path="" component={Login} />
      </Route>

      {/* Login */}
      <Route path="/login" component={AuthLayout}>
        <Route path="" component={Login} />
      </Route>

      {/* Register */}
      <Route path="/register" component={AuthLayout}>
        <Route path="" component={Register} />
      </Route>

      {/* Admin */}
      <Route path="/admin" component={DashboardLayout}>
        <Route path="" component={AdminHome} />
        <Route path="asset" component={Assets} />
        <Route path="stock-opname" component={StockOpname} />
        <Route path="asset/create" component={AssetCreate} />
        <Route path="asset/edit/:id" component={AssetCreate} />
        <Route path="conditions" component={Conditions} />
        <Route path="locations" component={Locations} />
        <Route path="events" component={Events} />
        <Route path="types" component={Types} />

        <Route path="load-in" component={LoadingInList} />
        <Route path="load-in/create" component={LoadingInCreate} />
        <Route path="load-in/edit/:id" component={LoadingInCreate} />
        <Route path="load-out" component={LoadingOutList} />
        <Route path="load-out/create" component={LoadingOutCreate} />
        <Route path="load-out/edit/:id" component={LoadingOutCreate} />
      </Route>

      {/* fallback */}
      <Route path="/*" element={<Navigate href="/" />} />
    </Router>
  );
}
