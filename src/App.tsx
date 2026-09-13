import { BrowserRouter, Routes, Route } from "react-router-dom";
import Shell from "./components/layout/Shell";
import Overview from "./pages/Overview";
import LiveView from "./pages/LiveView";
import Health from "./pages/Health";
import Alerts from "./pages/Alerts";
import Watchlist from "./pages/Watchlist";
import Registry from "./pages/Registry";
import GISMap from "./pages/GISMap";
import Investigate from "./pages/Investigate";

// TODO(auth): once context/AuthContext.tsx is activated, wrap this in an
// auth gate - see the activation steps documented at the top of that file.
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Shell />}>
          <Route path="/" element={<Overview />} />
          <Route path="/live" element={<LiveView />} />
          <Route path="/health" element={<Health />} />
          <Route path="/gis" element={<GISMap />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/investigate" element={<Investigate />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/registry" element={<Registry />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
