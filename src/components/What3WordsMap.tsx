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


        </div>
    );
}
