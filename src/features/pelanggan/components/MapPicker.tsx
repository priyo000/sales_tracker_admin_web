import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, MapPin } from 'lucide-react';

// Fix for default marker icon in Leaflet + Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapPickerProps {
    lat: number;
    lng: number;
    onChange: (lat: number, lng: number, address?: string, city?: string, district?: string) => void;
    hideSearch?: boolean;
    height?: string;
}

const LocationMarker = ({ lat, lng, onChange }: MapPickerProps) => {
    const map = useMap();
    
    useMapEvents({
        async click(e) {
            const newLat = e.latlng.lat;
            const newLng = e.latlng.lng;
            
            // Set coordinate immediately
            onChange(newLat, newLng);
            
            // Try to get address detail (Reverse Geocoding)
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLat}&lon=${newLng}&addressdetails=1`
                );
                const data = await response.json();
                if (data && data.address) {
                    const city = data.address.city || data.address.town || data.address.county || data.address.city_district || "";
                    const district = data.address.suburb || data.address.village || data.address.municipality || "";
                    onChange(newLat, newLng, data.display_name, city, district);
                }
            } catch (err) {
                console.error("Reverse Geocoding failed:", err);
            }
            
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    return (
        <Marker position={[lat, lng]} />
    );
};

const MapPicker: React.FC<MapPickerProps> = ({ lat, lng, onChange, hideSearch = false, height = "h-64" }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async () => {
        if (!searchQuery) return;
        setIsSearching(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&addressdetails=1`
            );
            const data = await response.json();
            if (data && data.length > 0) {
                const result = data[0];
                const newLat = parseFloat(result.lat);
                const newLon = parseFloat(result.lon);
                
                const address = result.address || {};
                const city = address.city || address.town || address.county || address.city_district || "";
                const district = address.suburb || address.village || address.municipality || "";
                
                onChange(newLat, newLon, result.display_name, city, district);
            }
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className={hideSearch ? "" : "space-y-3"}>
            {!hideSearch && (
                <div className="flex space-x-2">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            placeholder="Cari lokasi atau alamat..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
                        />
                    </div>
                    <button
                        type="button"
                        onClick={handleSearch}
                        disabled={isSearching}
                        className="inline-flex items-center rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-indigo-600 disabled:opacity-50"
                    >
                        {isSearching ? '...' : 'Cari'}
                    </button>
                </div>
            )}

            <div className={`${height} w-full rounded-lg overflow-hidden border border-gray-200 z-0 relative`}>
                <MapContainer
                    center={[lat, lng]}
                    zoom={13}
                    scrollWheelZoom={true}
                    className="h-full w-full"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker lat={lat} lng={lng} onChange={onChange} />
                    <Updater lat={lat} lng={lng} />
                </MapContainer>
                {!hideSearch && (
                    <div className="absolute bottom-2 left-2 z-1000 bg-white/90 px-2 py-1 rounded text-[10px] font-mono shadow-sm border border-gray-200">
                        <MapPin className="h-3 w-3 inline mr-1 text-red-500" />
                        {lat.toFixed(6)}, {lng.toFixed(6)}
                    </div>
                )}
            </div>
            {!hideSearch && <p className="text-[10px] text-gray-400 italic">*Klik pada peta untuk mengubah koordinat secara presisi.</p>}
        </div>
    );
};

const Updater = ({ lat, lng }: { lat: number, lng: number }) => {
    const map = useMap();
    useEffect(() => {
        map.setView([lat, lng]);
    }, [lat, lng, map]);
    return null;
};

export default MapPicker;
