import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getCameras, reconstructRoute } from "../api/client";
import { useApiData } from "../hooks/useApiData";
import { useRole } from "../context/RoleContext";
import { PLATES } from "../data/mockData";
import { HealthBadge } from "../components/common/Badges";
import { formatTime } from "../lib/format";
import type { RouteStop } from "../types";

const HEALTH_COLORS: Record<string, string> = {
  healthy: "#2DD4A7",
  warning: "#E8A33D",
  critical: "#E4574C",
  offline: "#7C8A94",
};

export default function GISMap() {
  const { scopeCameras } = useRole();
  const { data } = useApiData(getCameras);
  const [searchParams] = useSearchParams();

  const mapRef = useRef<L.Map | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [selectedPlate, setSelectedPlate] = useState(PLATES[0]);
  const [traceStatus, setTraceStatus] = useState("");

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { zoomControl: true }).setView([22.6, 71.6], 7);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Plot camera markers whenever scoped data changes
  useEffect(() => {
    if (!mapRef.current || !data) return;
    const map = mapRef.current;
    const cameraLayer = L.layerGroup().addTo(map);
    scopeCameras(data).forEach((c) => {
      const color = HEALTH_COLORS[c.health];
      L.circleMarker([c.lat, c.lon], { radius: 7, color, fillColor: color, fillOpacity: 0.85, weight: 1.5 })
        .addTo(cameraLayer)
        .bindPopup(`<b>${c.name}</b><br>${c.district} · ${c.id}<br>Status: ${c.health}<br>Scene: ${c.scene}`);
    });
    return () => {
      cameraLayer.remove();
    };
  }, [data, scopeCameras]);

  // Handle ?focus=CAM-xxxx from Registry
  useEffect(() => {
    const focusId = searchParams.get("focus");
    if (focusId && data && mapRef.current) {
      const cam = data.find((c) => c.id === focusId);
      if (cam) mapRef.current.setView([cam.lat, cam.lon], 14);
    }
  }, [searchParams, data]);

  // Handle ?trace=PLATE from an Alert's "Trace on map"
  useEffect(() => {
    const trace = searchParams.get("trace");
    if (trace) {
      setSelectedPlate(trace);
      runTrace(trace);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  function runTrace(plate: string) {
    setTraceStatus("Computing reachability + candidate path…");
    reconstructRoute(plate)
      .then((path: RouteStop[]) => {
        if (!mapRef.current) return;
        if (routeLayerRef.current) routeLayerRef.current.remove();
        const layer = L.layerGroup().addTo(mapRef.current);
        const latlngs: [number, number][] = path.map((p) => [p.lat, p.lon]);
        if (latlngs.length > 0) {
          L.polyline(latlngs, { color: "#5B8CFF", weight: 3, dashArray: "6,6" }).addTo(layer);
          path.forEach((p, i) => {
            L.circleMarker([p.lat, p.lon], { radius: 8, color: "#5B8CFF", fillColor: "#5B8CFF", fillOpacity: 0.9 })
              .addTo(layer)
              .bindPopup(`Stop ${i + 1}: ${p.name}<br>${formatTime(p.time)}`);
          });
          mapRef.current.fitBounds(L.latLngBounds(latlngs), { padding: [40, 40] });
        }
        routeLayerRef.current = layer;
        setTraceStatus(
          path.length > 0
            ? `Reconstructed ${path.length} stops for ${plate}. Confidence-weighted — verify each stop before operational action.`
            : `No corroborating sightings found for ${plate} in the current window.`
        );
      })
      .catch((err: Error) => setTraceStatus(`Route service unavailable: ${err.message}`));
  }

  return (
    <div style={{ position: "relative", height: "100%" }}>
      <div ref={containerRef} style={{ height: "100%", width: "100%" }} />

      <div
        style={{
          position: "absolute",
          top: 12,
          left: 12,
          zIndex: 400,
          background: "var(--panel)",
          border: "1px solid var(--line)",
          borderRadius: 6,
          padding: 12,
          width: 280,
        }}
      >
        <div className="card-title" style={{ marginBottom: 8 }}>
          Route reconstruction
        </div>
        <select className="input" style={{ marginBottom: 8 }} value={selectedPlate} onChange={(e) => setSelectedPlate(e.target.value)}>
          {PLATES.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
        <button className="btn primary small" onClick={() => runTrace(selectedPlate)}>
          Reconstruct route
        </button>
        {traceStatus && <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 8 }}>{traceStatus}</div>}
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 12,
          left: 12,
          zIndex: 400,
          background: "var(--panel)",
          border: "1px solid var(--line)",
          borderRadius: 6,
          padding: "8px 12px",
          fontSize: 11,
          display: "flex",
          gap: 12,
        }}
      >
        <HealthBadge health="healthy" />
        <HealthBadge health="warning" />
        <HealthBadge health="critical" />
        <HealthBadge health="offline" />
      </div>
    </div>
  );
}
