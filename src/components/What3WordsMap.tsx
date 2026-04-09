import { useState } from "react";
import { MapPin } from "lucide-react";

// Coordinates for ///listed.wisdom.dividers (Penmaen Parish Hall, Gower)
const LAT = 51.575396;
const LNG = -4.129141;
const W3W_ADDRESS = "listed.wisdom.dividers";

export function What3WordsMap() {
    const [mapLoaded, setMapLoaded] = useState(false);

    return (
        <div style={{ position: "relative", width: "100%", height: "100%", minHeight: "400px", borderRadius: "0.5rem", overflow: "hidden" }}>
            {mapLoaded ? (
                <iframe
                    title={`///${W3W_ADDRESS} — Penmaen Parish Hall`}
                    width="100%"
                    height="100%"
                    style={{ border: 0, minHeight: "400px" }}
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://maps.google.com/maps?q=${LAT},${LNG}&t=k&z=17&output=embed`}
                />
            ) : (
                <button
                    onClick={() => setMapLoaded(true)}
                    className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-primary-200 hover:bg-primary-300 transition-colors group cursor-pointer"
                    aria-label="Load interactive map of Penmaen Parish Hall"
                >
                    <MapPin className="w-10 h-10 text-primary-700 mb-3 group-hover:scale-110 transition-transform" />
                    <span className="text-primary-800 font-medium text-sm">Click to load map</span>
                    <span className="text-primary-800 text-xs mt-1">Penmaen Parish Hall, Gower</span>
                </button>
            )}
        </div>
    );
}
