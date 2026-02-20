import { Suspense, lazy, type ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import RequireAuth from "./RequireAuth";
import RequireOrgType from "./guards/RequireOrgType";

const InboundPage = lazy(() => import("../inbound/InboundPage"));
const OutboundPage = lazy(() => import("../outbound/OutboundPage"));
const BOMPage = lazy(() => import("../bom/BOMPage"));
const RequestPage = lazy(() => import("../request/RequestPage"));
const PartPage = lazy(() => import("../part/PartPage"));
const PropertyPage = lazy(() => import("../property/PropertyPage"));
const ItemPage = lazy(() => import("../items/ItemPage"));
const PurchasingPage = lazy(() => import("../purchasing/PurchasingPage"));
const HumanPage = lazy(() => import("../human/HumanPage"));
const DashboardPage = lazy(() => import("../dashboard/DashboardPage"));
const UserProfilePage = lazy(() => import("../user/UserProfilePage"));
const CarModelPage = lazy(() => import("../carModel/CarModelPage"));
const Login = lazy(() => import("../auth/pages/Login"));
const AuthCallback = lazy(() => import("../auth/pages/AuthCallback"));

function RouteFallback() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "40vh",
        color: "#6b7280",
      }}
    >
      페이지를 불러오는 중입니다.
    </div>
  );
}

function withSuspense(element: ReactNode) {
  return <Suspense fallback={<RouteFallback />}>{element}</Suspense>;
}

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={withSuspense(<Login />)} />
      <Route path="/auth/callback" element={withSuspense(<AuthCallback />)} />

      <Route element={<RequireAuth />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route
          path="/dashboard"
          element={withSuspense(
            <RequireOrgType required="본사">
              <DashboardPage />
            </RequireOrgType>
          )}
        />
        <Route
          path="/mrp"
          element={withSuspense(
            <RequireOrgType required="본사">
              <BOMPage />
            </RequireOrgType>
          )}
        />
        <Route
          path="/request"
          element={withSuspense(
            <RequireOrgType required="본사">
              <RequestPage />
            </RequireOrgType>
          )}
        />
        <Route
          path="/items"
          element={withSuspense(
            <RequireOrgType required="본사">
              <ItemPage />
            </RequireOrgType>
          )}
        />
        <Route
          path="/part"
          element={withSuspense(
            <RequireOrgType required="본사">
              <PartPage />
            </RequireOrgType>
          )}
        />
        <Route
          path="/car-models"
          element={withSuspense(
            <RequireOrgType required="본사">
              <CarModelPage />
            </RequireOrgType>
          )}
        />
        <Route
          path="/property"
          element={withSuspense(
            <RequireOrgType required="본사">
              <PropertyPage />
            </RequireOrgType>
          )}
        />
        <Route
          path="/inbound"
          element={withSuspense(
            <RequireOrgType required="본사">
              <InboundPage />
            </RequireOrgType>
          )}
        />
        <Route
          path="/outbound"
          element={withSuspense(
            <RequireOrgType required="본사">
              <OutboundPage />
            </RequireOrgType>
          )}
        />
        <Route
          path="/purchasing"
          element={withSuspense(
            <RequireOrgType required="본사">
              <PurchasingPage />
            </RequireOrgType>
          )}
        />
        <Route
          path="/human"
          element={withSuspense(
            <RequireOrgType required="본사">
              <HumanPage />
            </RequireOrgType>
          )}
        />
        <Route
          path="/profile"
          element={withSuspense(
            <RequireOrgType required="본사">
              <UserProfilePage />
            </RequireOrgType>
          )}
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
