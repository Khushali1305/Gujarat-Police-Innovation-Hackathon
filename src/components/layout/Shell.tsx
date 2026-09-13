import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar, { NAV_ITEMS } from "./Sidebar";
import Topbar from "./Topbar";

export default function Shell() {
  const location = useLocation();
  const navigate = useNavigate();
  const active = NAV_ITEMS.find((item) => item.path === location.pathname);
  const isGis = location.pathname === "/gis";

  return (
    <div id="app-shell">
      <Sidebar activeId={active?.id ?? "overview"} onNavigate={(path) => navigate(path)} />
      <div id="main-col">
        <Topbar />
        <div id="main-content" className={isGis ? "no-pad" : ""}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
