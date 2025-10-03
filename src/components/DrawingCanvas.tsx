import { Button, Card, Flex } from "antd";
import * as React from "react";
import { useRef, useState } from "react";
import Title from "antd/es/typography/Title";

export const DrawingCanvas = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const drawing = useRef(false);
    const [history, setHistory] = useState<string[]>([]);

    const initCanvas = () => {
        const c = canvasRef.current;
        if (!c) return;
        const ctx = c.getContext("2d");
        if (!ctx) return;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.lineWidth = 10;
        ctx.lineCap = "round";
        ctx.strokeStyle = "#222";
        ctxRef.current = ctx;
        saveState(); // initial blank state
    };

    const saveState = () => {
        const c = canvasRef.current;
        if (!c) return;
        const data = c.toDataURL();
        setHistory((prev) => [...prev, data]);
    };

    const startDraw = (e: React.PointerEvent) => {
        if (!ctxRef.current) initCanvas();
        drawing.current = true;
        const rect = canvasRef.current!.getBoundingClientRect();
        ctxRef.current!.beginPath();
        ctxRef.current!.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    };

    const draw = (e: React.PointerEvent) => {
        if (!drawing.current || !ctxRef.current) return;
        const rect = canvasRef.current!.getBoundingClientRect();
        ctxRef.current!.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctxRef.current!.stroke();
    };

    const endDraw = () => {
        if (drawing.current) saveState(); // save state after each stroke
        drawing.current = false;
    };

    const undo = () => {
        const c = canvasRef.current;
        const ctx = ctxRef.current;
        if (!c || !ctx || history.length <= 1) return;
        const newHistory = [...history];
        newHistory.pop(); // remove current
        const last = newHistory[newHistory.length - 1];
        const img = new Image();
        img.src = last;
        img.onload = () => {
            ctx.clearRect(0, 0, c.width, c.height);
            ctx.drawImage(img, 0, 0);
            setHistory(newHistory);
        };
    };

    const clearCanvas = () => {
        const c = canvasRef.current;
        const ctx = ctxRef.current;
        if (!c || !ctx) return;
        ctx.clearRect(0, 0, c.width, c.height);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, c.width, c.height);
        setHistory([c.toDataURL()]);
    };

    return (
        <div
            style={{
                flex: 1,
                background: "#f0f2f5",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <Card
                style={{ width: "90%", height: "90%", borderRadius: 12 }}
                bodyStyle={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Title level={4}>Draw here</Title>
                <canvas
                    ref={canvasRef}
                    width={500}
                    height={500}
                    style={{
                        border: "2px dashed #1677ff",
                        background: "#fff",
                        marginBottom: 16,
                        borderRadius: 8,
                        touchAction: "none",
                    }}
                    onPointerDown={startDraw}
                    onPointerMove={draw}
                    onPointerUp={endDraw}
                    onPointerLeave={endDraw}
                />
                <Flex style={{ width: "500px", gap: 12 }}>
                    <Button block onClick={undo}>
                        Undo
                    </Button>
                    <Button block danger onClick={clearCanvas}>
                        Reset
                    </Button>
                </Flex>
            </Card>
        </div>
    );
};
