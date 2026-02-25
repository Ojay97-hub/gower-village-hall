/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
    interface Window {
        google: any;
    }
}

import { useEffect, useRef, useState } from "react";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;

// Coordinates for ///listed.wisdom.dividers (Penmaen Parish Hall, Gower)
const LAT = 51.575396;
const LNG = -4.129141;
const W3W_ADDRESS = "listed.wisdom.dividers";

// Module-level promise — prevents duplicate <script> tags during HMR / re-mounts
let mapsLoadPromise: Promise<void> | null = null;

/** Polls until google.maps.Map is a constructor (handles partial-load during HMR) */
function waitForMapsReady(): Promise<void> {
    return new Promise((resolve) => {
        const check = () => {
            if (typeof window.google?.maps?.Map === "function") {
                resolve();
            } else {
                setTimeout(check, 50);
            }
        };
        check();
    });
}

function loadGoogleMapsApi(): Promise<void> {
    // Already fully loaded
    if (typeof window.google?.maps?.Map === "function") return Promise.resolve();

    // Return in-flight promise if one exists
    if (mapsLoadPromise) return mapsLoadPromise;

    // Script tag already in DOM (e.g. added by a previous render before HMR reset)
    const existing = document.querySelector('script[src*="maps.googleapis.com/maps/api"]');
    if (existing) {
        mapsLoadPromise = waitForMapsReady();
        return mapsLoadPromise;
    }

    mapsLoadPromise = new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
        script.async = true;
        script.defer = true;
        script.onload = () => waitForMapsReady().then(resolve);
        script.onerror = () => {
            mapsLoadPromise = null;
            reject(new Error("Failed to load Google Maps API"));
        };
        document.head.appendChild(script);
    });

    return mapsLoadPromise;
}

export function What3WordsMap() {
    const mapRef = useRef<HTMLDivElement>(null);
    const [mapLoaded, setMapLoaded] = useState(false);

    useEffect(() => {
        if (mapLoaded || !mapRef.current) return;

        let cancelled = false;

        loadGoogleMapsApi()
            .then(() => {
                if (cancelled || !mapRef.current) return;
                initMap();
            })
            .catch((err) => {
                console.error("Google Maps failed to load:", err);
            });

        return () => { cancelled = true; };
    }, [mapLoaded]);

    function initMap() {
        if (!mapRef.current || !window.google?.maps) return;

        const location = { lat: LAT, lng: LNG };

        const map = new window.google.maps.Map(mapRef.current, {
            center: location,
            zoom: 17,
            mapTypeId: "satellite",
            disableDefaultUI: true,
            zoomControl: true,
            fullscreenControl: true,
            gestureHandling: "cooperative",
        });

        new window.google.maps.Marker({
            position: location,
            map,
            title: `///${W3W_ADDRESS} — Penmaen Parish Hall`,
        });

        setMapLoaded(true);
    }

    return (
        <div style={{ position: "relative", width: "100%", height: "100%", minHeight: "400px" }}>
            {/* Google Map */}
            <div
                ref={mapRef}
                style={{ width: "100%", height: "100%", minHeight: "400px" }}
            />

            {/* Map Overlay Badges */}
            <div style={{
                position: "absolute",
                bottom: "16px",
                left: "16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                zIndex: 10,
            }}>
                {/* What3Words Badge */}
                <a
                    href={`https://what3words.com/${W3W_ADDRESS}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        background: "rgba(255, 255, 255, 0.95)",
                        backdropFilter: "blur(8px)",
                        borderRadius: "12px",
                        padding: "10px 16px",
                        boxShadow: "0 2px 12px rgba(0,0,0,0.25)",
                        textDecoration: "none",
                        color: "#e11f26",
                        fontWeight: 600,
                        fontSize: "14px",
                        transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.3)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.25)";
                    }}
                >
                    <svg width="20" height="20" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="64" height="64" rx="12" fill="#e11f26" />
                        <text x="32" y="44" textAnchor="middle" fill="white" fontSize="36" fontWeight="bold">///</text>
                    </svg>
                    <span style={{ color: "#333" }}>///</span>
                    <span>{W3W_ADDRESS}</span>
                </a>
            </div>
        </div>
    );
}
