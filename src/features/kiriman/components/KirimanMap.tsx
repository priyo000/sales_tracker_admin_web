import React, { useMemo, memo, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import MarkerClusterGroup from "react-leaflet-cluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import type { KirimanDetail } from "../types";

interface KirimanMapProps {
  details: KirimanDetail[];
  /** Klik pin → sorot baris di daftar (dan sebaliknya via focusDetailId). */
  onMarkerClick?: (detailId: number) => void;
  /** id detail yang disorot (dari klik baris di daftar). */
  focusDetailId?: number | null;
  height?: string;
}

/** fitBounds begitu daftar titik berubah. */
const MapBoundsUpdater: React.FC<{ locations: [number, number][] }> = ({
  locations,
}) => {
  const map = useMap();

  useEffect(() => {
    if (locations.length > 0) {
      map.fitBounds(L.latLngBounds(locations), { padding: [50, 50] });
    }
  }, [map, locations]);

  return null;
};

/** setView ke titik yang disorot dari daftar. */
const MapFocusUpdater: React.FC<{
  target: { lat: number; lng: number; timestamp: number } | null;
}> = ({ target }) => {
  const map = useMap();

  useEffect(() => {
    if (target) {
      map.setView([target.lat, target.lng], 16, { animate: true, duration: 1 });
    }
  }, [map, target]);

  return null;
};

/**
 * Peta pin pelanggan kiriman dengan nomor urut sesuai daftar.
 * Peta polos (tanpa pin) bila daftar masih kosong — sesuai alur
 * "buat kiriman": pin baru muncul setelah rute/pelanggan ditambahkan.
 */
const KirimanMap: React.FC<KirimanMapProps> = ({
  details,
  onMarkerClick,
  focusDetailId,
  height = "h-full",
}) => {
  const validDetails = useMemo(
    () =>
      details
        .map((d, index) => ({ detail: d, urut: index + 1 }))
        .filter(
          ({ detail }) =>
            detail.pelanggan?.latitude != null &&
            detail.pelanggan?.longitude != null,
        ),
    [details],
  );

  const center: [number, number] = useMemo(() => {
    if (validDetails.length === 0) return [-6.2, 106.816666]; // default Jakarta
    const lat =
      validDetails.reduce(
        (sum, { detail }) => sum + (detail.pelanggan?.latitude ?? 0),
        0,
      ) / validDetails.length;
    const lng =
      validDetails.reduce(
        (sum, { detail }) => sum + (detail.pelanggan?.longitude ?? 0),
        0,
      ) / validDetails.length;
    return [lat, lng];
  }, [validDetails]);

  const locations = useMemo(
    () =>
      validDetails.map(
        ({ detail }) =>
          [detail.pelanggan!.latitude!, detail.pelanggan!.longitude!] as [
            number,
            number,
          ],
      ),
    [validDetails],
  );

  const focusTarget = useMemo(() => {
    if (!focusDetailId) return null;
    const found = validDetails.find(({ detail }) => detail.id === focusDetailId);
    if (!found) return null;
    return {
      lat: found.detail.pelanggan!.latitude!,
      lng: found.detail.pelanggan!.longitude!,
      timestamp: Date.now(),
    };
  }, [focusDetailId, validDetails]);

  const createIcon = (urut: number, isFocused: boolean) =>
    L.divIcon({
      className: "custom-marker-icon",
      html: `
        <div class="relative">
          <div class="w-7 h-7 rounded-full ${isFocused ? "bg-amber-500" : "bg-primary"} border-2 border-white shadow-lg flex items-center justify-center">
            <span class="text-white text-[11px] font-bold leading-none">${urut}</span>
          </div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -16],
    });

  return (
    <div className={`${height} w-full bg-gray-100 relative z-0`}>
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {validDetails.length > 0 && <MapBoundsUpdater locations={locations} />}
        <MapFocusUpdater target={focusTarget} />

        <MarkerClusterGroup chunkedLoading maxClusterRadius={50}>
          {validDetails.map(({ detail, urut }) => (
            <Marker
              key={detail.id}
              position={[
                detail.pelanggan!.latitude!,
                detail.pelanggan!.longitude!,
              ]}
              icon={createIcon(urut, detail.id === focusDetailId)}
              eventHandlers={{ click: () => onMarkerClick?.(detail.id) }}
            >
              <Tooltip direction="top" offset={[0, -16]} opacity={1}>
                <div className="p-1">
                  <h3 className="font-bold text-gray-900 text-xs">
                    {urut}. {detail.pelanggan?.nama_toko}
                  </h3>
                  <p className="text-[10px] text-gray-500 max-w-[180px]">
                    {detail.pelanggan?.alamat_usaha}
                  </p>
                  {detail.rute_asal && (
                    <span className="inline-block mt-1 px-1 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[8px] font-bold">
                      dari rute: {detail.rute_asal.nama_rute}
                    </span>
                  )}
                </div>
              </Tooltip>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
};

export default memo(KirimanMap);
