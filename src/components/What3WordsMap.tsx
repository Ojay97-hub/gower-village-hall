// Coordinates for ///listed.wisdom.dividers (Penmaen Parish Hall, Gower)
const LAT = 51.575396;
const LNG = -4.129141;
const W3W_ADDRESS = "listed.wisdom.dividers";

export function What3WordsMap() {
    return (
        <div style={{ position: "relative", width: "100%", height: "100%", minHeight: "400px", borderRadius: "0.5rem", overflow: "hidden" }}>
            {/* Free Google Maps Iframe Embed with Satellite View */}
            <iframe
                title={`///${W3W_ADDRESS} — Penmaen Parish Hall`}
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: "400px" }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://maps.google.com/maps?q=${LAT},${LNG}&t=k&z=17&output=embed`}
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
