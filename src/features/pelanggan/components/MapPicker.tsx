import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, Loader2, AlertCircle } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
    onChange: (lat: number, lng: number, address?: string, city?: string, district?: string, state?: string) => void;
    hideSearch?: boolean;
    height?: string;
}

const LocationMarker = ({ lat, lng, onChange }: { 
    lat: number, 
    lng: number, 
    onChange: (lat: number, lng: number, address?: string, city?: string, district?: string, state?: string) => void 
}) => {
    const map = useMap();
    
    useMapEvents({
        async click(e) {
            const newLat = e.latlng.lat;
            const newLng = e.latlng.lng;
            onChange(newLat, newLng);
            
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLat}&lon=${newLng}&addressdetails=1`
                );
                const data = await response.json();
                if (data && data.address) {
                    const city = data.address.city || data.address.town || data.address.county || data.address.city_district || "";
                    const district = data.address.suburb || data.address.village || data.address.municipality || "";
                    const state = data.address.state || "";
                    onChange(newLat, newLng, data.display_name, city, district, state);
                }
            } catch {
                // silently fail
            }
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    return <Marker position={[lat, lng]} />;
};

const MapPicker: React.FC<MapPickerProps> = ({ lat, lng, onChange, hideSearch = false, height = "h-full" }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [noResults, setNoResults] = useState(false);

    const handleSearch = async () => {
        if (!searchQuery) return;
        setIsSearching(true);
        setNoResults(false);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&addressdetails=1&countrycodes=id`
            );
            const data = await response.json();
            if (data && data.length > 0) {
                const result = data[0];
                const newLat = parseFloat(result.lat);
                const newLon = parseFloat(result.lon);
                
                const address = result.address || {};
                const city = address.city || address.town || address.county || address.city_district || "";
                const district = address.suburb || address.village || address.municipality || "";
                const state = address.state || "";
                
                onChange(newLat, newLon, result.display_name, city, district, state);
            } else {
                setNoResults(true);
                setTimeout(() => setNoResults(false), 3000);
            }
        } catch {
            // silently fail
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className={`relative w-full overflow-hidden ${height} min-h-[300px] rounded-xl border-2 border-border/50 shadow-inner group font-sans`}>
            {/* Map Container */}
            <div className="absolute inset-0 z-0">
                <MapContainer
                    center={[lat, lng]}
                    zoom={13}
                    minZoom={5}
                    maxBounds={[
                        [-11, 94],
                        [6, 141]
                    ]}
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
            </div>

            {/* Overlays */}
            {!hideSearch && (
                <>
                    {/* Floating Search Bar - Now Moved to Bottom */}
                    <div className="absolute bottom-4 left-4 right-4 z-1000 space-y-2">
                        {noResults && (
                            <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg border border-amber-200 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-300 text-[10px] font-bold uppercase tracking-wider mx-auto w-fit">
                                <AlertCircle className="h-3.5 w-3.5" /> Lokasi Tidak Ditemukan di Indonesia
                            </div>
                        )}
                        <div className="flex gap-2">
                            <div className="relative flex-1 group shadow-2xl">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10">
                                    {isSearching ? (
                                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                    ) : (
                                        <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    )}
                                </div>
                                <Input
                                    type="text"
                                    className="pl-10 h-9 bg-card/95 backdrop-blur-md border-none text-sm font-semibold focus-visible:ring-2 focus-visible:ring-primary shadow-xl rounded-lg dark:bg-slate-900/95 dark:text-slate-100"
                                    placeholder="Cari nama lokasi atau alamat toko..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
                                />
                            </div>
                            <Button
                                type="button"
                                onClick={handleSearch}
                                disabled={isSearching}
                                className="h-9 px-4 bg-primary hover:bg-primary/90 text-white font-bold text-[9px] uppercase tracking-widest rounded-lg shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                Cari
                            </Button>
                        </div>
                    </div>
                </>
            )}
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
