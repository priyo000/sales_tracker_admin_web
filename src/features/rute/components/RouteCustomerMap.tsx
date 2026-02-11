import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Pelanggan } from '../../pelanggan/types';
import { MapPin } from 'lucide-react';

interface RouteCustomerMapProps {
    customers: Pelanggan[];
    selectedIds: number[];
    onToggle: (id: number) => void;
    height?: string;
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

const RouteCustomerMap: React.FC<RouteCustomerMapProps> = ({ customers, selectedIds, onToggle, height = "h-[500px]" }) => {
    // Determine center (average of all customers or default Jakarta)
    const validCustomers = useMemo(() => customers.filter(c => c.latitude && c.longitude), [customers]);
    
    const center: [number, number] = useMemo(() => {
        if (validCustomers.length === 0) return [-6.200000, 106.816666]; // Jakarta Default
        
        const lat = validCustomers.reduce((sum, c) => sum + (c.latitude || 0), 0) / validCustomers.length;
        const lng = validCustomers.reduce((sum, c) => sum + (c.longitude || 0), 0) / validCustomers.length;
        
        return [lat, lng];
    }, [validCustomers]);

    const locations = useMemo(() => validCustomers.map(c => [c.latitude!, c.longitude!] as [number, number]), [validCustomers]);

    const createCustomIcon = (isSelected: boolean) => {
        const colorClass = isSelected ? 'bg-indigo-600' : 'bg-gray-500';
        const ringClass = isSelected ? 'ring-indigo-300' : 'ring-gray-300';
        
        // Using a simple HTML structure for the pin
        return L.divIcon({
            className: 'custom-marker-icon', // Use this class to remove default leaflet styles if needed
            html: `
                <div class="relative group">
                    <div class="w-8 h-8 rounded-full ${colorClass} border-2 border-white shadow-lg flex items-center justify-center ring-2 ${ringClass} transition-transform transform group-hover:scale-110">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                            <circle cx="12" cy="10" r="3"/>
                        </svg>
                    </div>
                    ${isSelected ? `<div class="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>` : ''}
                </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 30], // Center bottom-ish
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

                {validCustomers.map(customer => {
                    const isSelected = selectedIds.includes(customer.id);
                    
                    return (
                        <Marker 
                            key={customer.id} 
                            position={[customer.latitude!, customer.longitude!]}
                            icon={createCustomIcon(isSelected)}
                            eventHandlers={{
                                // We remove the click toggle here to prevent conflict with Popup.
                                // Users should verify info in popup then click functionality, OR
                                // we can make the marker click toggle if we didn't have a popup.
                                // For now, let's keep Popup as the primary interaction for clarity.
                            }}
                        >
                            <Popup>
                                <div className="p-1 min-w-[200px]">
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-50 text-gray-500'}`}>
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-sm">{customer.nama_toko}</h3>
                                            <p className="text-gray-500 text-xs mt-0.5 leading-tight">{customer.alamat_usaha}</p>
                                        </div>
                                    </div>
                                    
                                    <button 
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation(); // prevent map click bubbling
                                            onToggle(customer.id);
                                        }}
                                        className={`w-full py-2 px-3 rounded-md text-xs font-semibold shadow-sm transition-all active:scale-95 ${
                                            isSelected 
                                                ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100' 
                                                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
                                        }`}
                                    >
                                        {isSelected ? 'Hapus dari Rute' : 'Tambahkan ke Rute'}
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
};

export default RouteCustomerMap;
