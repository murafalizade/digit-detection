import {Header} from "./components/Header.tsx";
import { DrawingCanvas } from "./components/DrawingCanvas.tsx";


export default function App() {

    return (
        <div style={{ height: "100vh", width: "100vw", display: "flex", flexDirection: "column" }}>
            <Header />

            <div style={{ display: "flex", flex: 1 }}>
                <DrawingCanvas />
            </div>
        </div>
    );
}
