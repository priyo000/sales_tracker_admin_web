import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, MapPin, Loader2 } from 'lucide-react';
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

const LocationMarker = ({ lat, lng, onChange }: { lat: number, lng: number, onChange: any }) => {
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
                    const state = data.address.state || "";
                    onChange(newLat, newLng, data.display_name, city, district, state);
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
                const state = address.state || "";
                
                onChange(newLat, newLon, result.display_name, city, district, state);
            }
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className={hideSearch ? "h-full w-full" : "space-y-3"}>
            {!hideSearch && (
                <div className="flex space-x-2">
                    <div className="relative flex-1 group">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10">
                            <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        </div>
                        <Input
                            type="text"
                            className="pl-10 h-10 bg-white border-border/50 text-sm font-semibold focus-visible:ring-primary shadow-sm"
                            placeholder="Cari lokasi (contoh: Purwokerto)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
                        />
                        {isSearching && (
                            <div className="absolute inset-y-0 right-3 flex items-center">
                                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                            </div>
                        )}
                    </div>
                    <Button
                        type="button"
                        onClick={handleSearch}
                        disabled={isSearching}
                        className="h-10 px-6 bg-primary hover:bg-primary/90 text-white font-bold text-[10px] uppercase tracking-wider rounded-lg shadow-md shadow-primary/20"
                    >
                        {isSearching ? '...' : 'Cari Lokasi'}
                    </Button>
                </div>
            )}

            <div className={`${height} w-full rounded-xl overflow-hidden border-2 border-border/50 z-0 relative shadow-inner`}>
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
                {!hideSearch && (
                    <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-xl border border-border/50 flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-muted-foreground">Koordinat:</span>
                        <span className="text-primary font-mono">{lat.toFixed(6)}, {lng.toFixed(6)}</span>
                    </div>
                )}
            </div>
            {!hideSearch && (
                <div className="flex items-center gap-2 px-1">
                    <MapPin className="h-3 w-3 text-primary/60" />
                    <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-tight italic">
                        *Klik di peta untuk memindah pin secara presisi
                    </p>
                </div>
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
