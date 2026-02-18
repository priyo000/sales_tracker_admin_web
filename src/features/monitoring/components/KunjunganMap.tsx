import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { VisitPoint } from '../types';

// Define the component props
interface KunjunganMapProps {
    points: VisitPoint[]; // All points to display
    focusPoints?: VisitPoint[]; // Points to zoom/pan to
    selectedEmployeeColor?: string; // Optional
    onMarkerClick?: (point: VisitPoint) => void;
}

// Map Updater Component to fit bounds
const FitBounds = ({ points, focusPoints }: { points: VisitPoint[], focusPoints?: VisitPoint[] }) => {
    const map = useMap();
    useEffect(() => {
        // Prioritize focusPoints if available and not empty
        const targetPoints = (focusPoints && focusPoints.length > 0) ? focusPoints : points;

        if (targetPoints.length > 0) {
            // Filter valid points
            const validPoints = targetPoints.filter(p => !isNaN(Number(p.pelanggan.latitude)) && !isNaN(Number(p.pelanggan.longitude)));
            
            if (validPoints.length > 0) {
                const latLngs = validPoints.map(p => [Number(p.pelanggan.latitude), Number(p.pelanggan.longitude)] as [number, number]);
                const bounds = L.latLngBounds(latLngs);
                try {
                    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
                } catch (e) {
                    console.error("Map fitBounds failed", e);
                }
            }
        }
    }, [points, focusPoints, map]);
    return null;
}

// Helper to create custom HTML for divIcon with Circle + Triangle Tail
const createCustomIcon = (color: string, status: string, isUnplanned: boolean, isOutOfRange: boolean, label?: string | number): L.DivIcon => {
    // Default (Pending): White background, Colored Border
    let backgroundColor = 'white';
    let borderColor = color;
    let textColor = color; // Text matches border for pending
    const borderWidth = '3px';
    const size = 22; // Slightly larger to fit text
    
    // Unplanned: Orange Border
    if (isUnplanned) {
        borderColor = '#F97316'; // Orange
    }

    // Visited: Fill with the border color
    if (status === 'visited') {
        backgroundColor = borderColor;
        textColor = 'white'; // White text on colored background
    }

    // Default no box shadow on the circle itself (moved to container filter)
    let circleBoxShadow = 'none';

    // Special handling for Out of Range
    // Add a red ring using box-shadow
    if (isOutOfRange) {
        circleBoxShadow = '0 0 0 3px rgba(239, 68, 68, 1)'; 
    }
    
    // Tail Color always matches Border Color
    const tailColor = borderColor;
    
    // Triangle dimensions
    const tailHeight = 8;
    const tailWidth = 6; // Half width

    const html = `
    <div style="
        display: flex; 
        flex-direction: column; 
        align-items: center; 
        filter: drop-shadow(0 3px 2px rgba(0,0,0,0.3));
        position: relative;
    ">
        <div style="
            background-color: ${backgroundColor}; 
            width: ${size}px; 
            height: ${size}px; 
            border-radius: 50%; 
            border: ${borderWidth} solid ${borderColor}; 
            box-shadow: ${circleBoxShadow};
            z-index: 10;
            display: flex;
            align-items: center;
            justify-content: center;
            color: ${textColor};
            font-size: 10px;
            font-weight: bold;
            font-family: sans-serif;
        ">
            ${label || ''}
        </div>
        <div style="
            width: 0; 
            height: 0; 
            border-left: ${tailWidth}px solid transparent;
            border-right: ${tailWidth}px solid transparent;
            border-top: ${tailHeight}px solid ${tailColor};
            margin-top: -3px; /* Pull up to merge behind circle */
            z-index: 0;
        "></div>
    </div>`;

    return L.divIcon({
        className: 'bg-transparent border-none',
        html: html,
        iconSize: [size + 10, size + tailHeight + 10], // Adjusted buffer
        iconAnchor: [(size + 10) / 2, size + tailHeight], // Anchor at bottom tip approx
        popupAnchor: [0, -(size + 4)] // Popup above
    });
};

export const KunjunganMap = ({ points, focusPoints, selectedEmployeeColor, onMarkerClick }: KunjunganMapProps) => {
    // Default center Jakarta
    const defaultCenter: [number, number] = [-6.2088, 106.8456];
    
    // Bounds for Indonesia (Approximate)
    // SouthWest: -11, 94
    // NorthEast: 6, 141
    const indonesiaBounds: L.LatLngBoundsExpression = [
        [-11.0, 94.0], 
        [6.0, 141.0]
    ];

    // Pre-calculate visit sequence for each employee
    const visitSequenceMap = useMemo(() => {
        const sequences: Record<string, Record<number, number>> = {};
        
        // Group points by employee
        const empGroups: Record<string, VisitPoint[]> = {};
        points.forEach(p => {
            const empId = p.employee?.id || '0'; // Use '0' for points without employee
            if (!empGroups[empId]) empGroups[empId] = [];
            empGroups[empId].push(p);
        });

        // For each employee, sort their visited points by check-in time
        Object.keys(empGroups).forEach(empId => {
            const visited = empGroups[empId]
                .filter(p => (p.status === 'visited' || p.type === 'unplanned') && p.visit?.waktu_check_in)
                .sort((a, b) => {
                    const timeA = new Date(a.visit!.waktu_check_in).getTime();
                    const timeB = new Date(b.visit!.waktu_check_in).getTime();
                    return timeA - timeB;
                });
            
            sequences[empId] = {};
            visited.forEach((p, idx) => {
                sequences[empId][p.pelanggan.id] = idx + 1;
            });
        });

        return sequences;
    }, [points]);

    return (
        <MapContainer 
            center={defaultCenter}
            zoom={13} 
            minZoom={5}
            maxBounds={indonesiaBounds}
            maxBoundsViscosity={1.0}
            style={{ height: '100%', width: '100%', zIndex: 0 }}
            zoomControl={false}
        >
             <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {points.map((point) => {
                const lat = Number(point.pelanggan.latitude);
                const lng = Number(point.pelanggan.longitude);

                // Skip invalid points
                if (isNaN(lat) || isNaN(lng)) return null;

                const isUnplanned = point.type === 'unplanned';
                // Check if visited and valid distance exists and > 100
                const isOutOfRange = (point.visit?.jarak_validasi ?? 0) > 100;
                
                // Use point color if available, else fallback to selectedEmployeeColor or default Blue
                const pointColor = point.employee?.color || selectedEmployeeColor || '#3B82F6';

                // Get sequence label
                const empId = point.employee?.id || '0';
                const sequence = visitSequenceMap[empId]?.[point.pelanggan.id];

                const icon = createCustomIcon(
                    pointColor, 
                    point.status, 
                    isUnplanned, 
                    isOutOfRange,
                    sequence // Pass sequence as label
                );
                
                // Format checkin time
                const checkInTime = point.visit && point.visit.waktu_check_in
                    ? new Date(point.visit.waktu_check_in).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})
                    : null;

                return (
                    <Marker
                        key={`marker-${point.pelanggan.id}-${point.type}`}
                        position={[lat, lng]}
                        icon={icon}
                        eventHandlers={{
                            click: () => {
                                onMarkerClick?.(point);
                            },
                        }}
                    >
                        <Popup>
                            <div className="p-1 min-w-[180px]">
                                <h3 className="text-sm font-bold text-gray-900 mb-1">{point.pelanggan.nama_toko}</h3>
                                <div className="text-xs text-gray-500 mb-2 line-clamp-2">{point.pelanggan.alamat}</div>
                                
                                {point.employee && (
                                    <div className="mb-2 text-[10px]">
                                        <span 
                                            className="inline-block px-1.5 py-0.5 rounded text-white" 
                                            style={{ backgroundColor: point.employee.color }}
                                        >
                                            {point.employee.nama_lengkap}
                                        </span>
                                    </div>
                                )}

                                <div className="flex flex-wrap gap-1 mb-2">
                                    {point.status === 'visited' ? (
                                        <div className="px-2 py-0.5 rounded bg-green-100 text-green-700 text-[10px] font-bold border border-green-200">
                                            Dikunjungi
                                        </div>
                                    ) : (
                                        <div className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-[10px] font-bold border border-gray-200">
                                            Belum
                                        </div>
                                    )}

                                    {isUnplanned && (
                                        <div className="px-2 py-0.5 rounded bg-orange-100 text-orange-700 text-[10px] font-bold border border-orange-200">
                                            Unplanned
                                        </div>
                                    )}

                                    {isOutOfRange && (
                                        <div className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-bold border border-red-200">
                                            Out of Range ({Math.round(point.visit?.jarak_validasi || 0)}m)
                                        </div>
                                    )}
                                </div>

                                {checkInTime ? (
                                    <div className="pt-2 border-t border-gray-100 flex justify-between items-center text-[10px]">
                                        <span className="text-gray-500">Check-in:</span>
                                        <span className="font-medium text-gray-900">{checkInTime}</span>
                                    </div>
                                ) : (
                                    <div className="pt-2 border-t border-gray-100">
                                        <div className="text-[10px] text-gray-400 italic text-center">
                                            Belum dikunjungi
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                );
            })}
            <FitBounds points={points} focusPoints={focusPoints} />
        </MapContainer>
    );
};
