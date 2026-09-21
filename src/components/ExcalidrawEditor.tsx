import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";

export default function ExcalidrawEditor() {
    return (
        <div style={{ height: "100vh", width: "100%" }}>
            <Excalidraw />
        </div>
    );
}