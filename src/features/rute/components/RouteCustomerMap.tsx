import React, { useMemo, memo } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Pelanggan } from '../../pelanggan/types';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

interface RouteCustomerMapProps {
    customers: Pelanggan[];
    selectedIds: Set<number> | number[];
    onToggle: (id: number) => void;
    height?: string;
    focusLocation?: { lat: number, lng: number, timestamp: number } | null;
}

// Component to update map bounds based on markers
const MapBoundsUpdater: React.FC<{ locations: [number, number][]; }> = ({ locations }) => {
    const map = useMap();
    
    useMemo(() => {
        if (locations.length > 0) {
            const bounds = L.latLngBounds(locations);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [map, locations]);

    return null;
};

const MapFocusUpdater: React.FC<{ focusLocation: { lat: number, lng: number, timestamp: number } | null }> = ({ focusLocation }) => {
    const map = useMap();
    
    React.useEffect(() => {
        if (focusLocation) {
            map.setView([focusLocation.lat, focusLocation.lng], 16, {
                animate: true,
                duration: 1
            });
        }
    }, [map, focusLocation]);

    return null;
};

const RouteCustomerMap: React.FC<RouteCustomerMapProps> = ({ customers, selectedIds, onToggle, height = "h-[500px]", focusLocation }) => {
    // Determine center (average of all customers or default Jakarta)
    const validCustomers = useMemo(() => customers.filter(c => c.latitude && c.longitude), [customers]);
    
    const center: [number, number] = useMemo(() => {
        if (validCustomers.length === 0) return [-6.200000, 106.816666]; // Jakarta Default
        
        const lat = validCustomers.reduce((sum, c) => sum + (c.latitude || 0), 0) / validCustomers.length;
        const lng = validCustomers.reduce((sum, c) => sum + (c.longitude || 0), 0) / validCustomers.length;
        
        return [lat, lng];
    }, [validCustomers]);

    const locations = useMemo(() => validCustomers.map(c => [c.latitude!, c.longitude!] as [number, number]), [validCustomers]);

    const createCustomIcon = (isSelected: boolean, hasExistingRute: boolean) => {
        let colorClass = 'bg-gray-400'; // Default: No rute
        let ringClass = 'ring-gray-200';

        if (isSelected) {
            colorClass = 'bg-indigo-600'; // Selected for current route
            ringClass = 'ring-indigo-300';
        } else if (hasExistingRute) {
            colorClass = 'bg-amber-500'; // Already has another route
            ringClass = 'ring-amber-200';
        }

        // Using a simple HTML structure for the pin
        return L.divIcon({
            className: 'custom-marker-icon',
            html: `
                <div class="relative group">
                    <div class="w-8 h-8 rounded-full ${colorClass} border-2 border-white shadow-lg flex items-center justify-center ring-2 ${ringClass} transition-transform transform group-hover:scale-110">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                            <circle cx="12" cy="10" r="3"/>
                        </svg>
                    </div>
                </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 30],
            popupAnchor: [0, -32],
        });
    };

    return (
        <div className={`${height} w-full bg-gray-100 flex flex-col relative z-0`}>
             <MapContainer center={center} zoom={13} scrollWheelZoom={true} className="flex-1 w-full h-full z-0">
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {validCustomers.length > 0 && <MapBoundsUpdater locations={locations} />}
                <MapFocusUpdater focusLocation={focusLocation || null} />

                <MarkerClusterGroup
                    chunkedLoading
                    maxClusterRadius={50}
                    polygonOptions={{
                        fillColor: '#6366f1',
                        color: '#6366f1',
                        weight: 0.5,
                        opacity: 1,
                        fillOpacity: 0.1,
                    }}
                >
                    {validCustomers.map(customer => {
                        const isSelected = selectedIds instanceof Set 
                            ? selectedIds.has(customer.id) 
                            : selectedIds.includes(customer.id);
                        
                        const existingRutes = customer.details_rute?.map(dr => dr.rute?.nama_rute).filter(Boolean) || [];
                        const hasExistingRute = existingRutes.length > 0;

                        return (
                            <Marker 
                            key={customer.id} 
                            position={[customer.latitude!, customer.longitude!]}
                            icon={createCustomIcon(isSelected, hasExistingRute)}
                            eventHandlers={{
                                click: () => onToggle(customer.id)
                            }}
                        >
                            <Tooltip direction="top" offset={[0, -32]} opacity={1}>
                                <div className="p-1">
                                    <h3 className="font-bold text-gray-900 text-xs">{customer.nama_toko}</h3>
                                    <p className="text-[10px] text-gray-500 truncate max-w-[150px]">{customer.alamat_usaha}</p>
                                    
                                    {hasExistingRute && (
                                        <div className="mt-1 flex flex-wrap gap-1">
                                            {existingRutes.map((r, i) => (
                                                <span key={i} className="px-1 py-0.5 rounded bg-amber-100 text-amber-800 text-[8px] font-bold">
                                                    Rute: {r}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <p className="text-[9px] mt-1 font-bold text-indigo-600">
                                        {isSelected ? '✓ Terpilih (Klik untuk hapus)' : 'Klik untuk pilih'}
                                    </p>
                                </div>
                            </Tooltip>
                        </Marker>
                        );
                    })}
                </MarkerClusterGroup>
            </MapContainer>
        </div>
    );
};

export default memo(RouteCustomerMap);
