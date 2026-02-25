import { What3wordsMap } from "@what3words/react-components";

const W3W_API_KEY = import.meta.env.VITE_W3W_API_KEY as string;
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;
const W3W_ADDRESS = "listed.wisdom.dividers";

export function What3WordsMap() {
    return (
        <div style={{ width: "100%", height: "100%" }}>
            <What3wordsMap
                api-key={W3W_API_KEY}
                google-api-key={GOOGLE_MAPS_API_KEY}
                words={W3W_ADDRESS}
                map-type="satellite"
                zoom={17}
            />
        </div>
    );
}
