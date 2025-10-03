import { Button, Card, Flex, Spin, Slider } from "antd";
import { UndoOutlined, ReloadOutlined } from "@ant-design/icons";
import * as React from "react";
import { useRef, useState, useEffect } from "react";
import * as ort from "onnxruntime-web";

ort.env.wasm.wasmPaths = "/";

export const DrawingCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const drawing = useRef(false);
  const [history, setHistory] = useState<string[]>([]);
  const [session, setSession] = useState<ort.InferenceSession | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [percentage, setPercentage] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [threshold, setThreshold] = useState(0.5);

  useEffect(() => {
    const loadModel = async () => {
      try {
        ort.env.wasm.wasmPaths = "/wasm/";
        const s = await ort.InferenceSession.create("cnn_mnist.onnx", {
          executionProviders: ["wasm"],
        });
        setSession(s);
      } catch (err) {
        console.error("Failed to load model", err);
      }
    };
    loadModel();
  }, []);

  const reCalculate = (value: number) => {
    setThreshold(value);
    if (result) runPredict();
  }

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
    saveState();
  };

  const saveState = () => {
    const c = canvasRef.current;
    if (!c) return;
    setHistory(prev => [...prev, c.toDataURL()]);
  };

  const startDraw = (e: React.PointerEvent) => {
    if (!ctxRef.current) initCanvas();
    drawing.current = true;
    canvasRef.current!.style.cursor = "crosshair";
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
    if (drawing.current) saveState();
    drawing.current = false;
    runPredict();
  };

  const undo = () => {
    const c = canvasRef.current;
    const ctx = ctxRef.current;
    if (!c || !ctx || history.length <= 1) return;
    const newHistory = [...history];
    newHistory.pop();
    const last = newHistory[newHistory.length - 1];
    const img = new Image();
    img.src = last;
    img.onload = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0);
      setHistory(newHistory);
      runPredict();
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
    setResult(null);
    setPercentage(null);
    setThreshold(0.5);
  };

  const preprocessCanvas = () => {
    const c = canvasRef.current;
    if (!c) return null;
    const ctx = c.getContext("2d");
    if (!ctx) return null;

    const temp = document.createElement("canvas");
    temp.width = 28;
    temp.height = 28;
    const tctx = temp.getContext("2d");
    if (!tctx) return null;
    tctx.drawImage(c, 0, 0, temp.width, temp.height);

    const imgData = tctx.getImageData(0, 0, temp.width, temp.height).data;
    const data = new Float32Array(1 * 1 * 28 * 28);
    for (let y = 0; y < 28; y++)
      for (let x = 0; x < 28; x++)
        data[y * 28 + x] = 1 - imgData[(y * 28 + x) * 4] / 255;

    return data;
  };

  const softmax = (arr: number[]) => {
    const max = Math.max(...arr);
    const exps = arr.map(v => Math.exp(v - max));
    const sum = exps.reduce((a, b) => a + b, 0);
    return exps.map(v => v / sum);
  };

  const interpretResult = (output: Float32Array, thresholdVal = 0.5): string => {
    const probs = softmax(Array.from(output));
    const maxProb = Math.max(...probs);
    const predClass = probs.indexOf(maxProb);
    if (maxProb < thresholdVal) {
      setPercentage(null);
      return "No idea... 🤔";
    }
    setPercentage(maxProb);
    return predClass.toString();
  };

  const runPredict = async () => {
    if (!session) return;
    const inputArray = preprocessCanvas();
    if (!inputArray) return;
    setLoading(true);

    const inputTensor = new ort.Tensor("float32", inputArray, [1, 1, 28, 28]);
    const output = await session.run({ input: inputTensor });
    const preds = output["output"].data as Float32Array;
    const prediction = interpretResult(preds, threshold);
    setResult(prediction);
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", justifyContent: "center", alignItems: "center", gap: 24, padding: 24 }}>
      <Card bodyStyle={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }} style={{ width: 520, height: 600, borderRadius: 12}}>
        <canvas
          ref={canvasRef}
          width={450}
          height={450}
          style={{ border: "2px dashed #1677ff", background: "#fff", marginBottom: 16, borderRadius: 8, touchAction: "none", cursor: "crosshair" }}
          onPointerDown={startDraw}
          onPointerMove={draw}
          onPointerUp={endDraw}
          onPointerLeave={endDraw}
        />
        <Flex style={{ width: "500px", gap: 12 }}>
          <Button block icon={<UndoOutlined />} onClick={undo}>Undo</Button>
          <Button block icon={<ReloadOutlined />} danger onClick={clearCanvas}>Reset</Button>
        </Flex>
        <div style={{ marginTop: 16, width: "80%", marginBottom: 8 }}>
          <p style={{marginBottom: 0, marginTop: 0, paddingBottom:0}}>Threshold: {(threshold*100).toFixed(0)}%</p>
          <Slider min={0} max={1} step={0.01} value={threshold} onChange={reCalculate} />
        </div>
      </Card>

      <Card style={{ width: 300, height: 200, borderRadius: 12, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <p style={{ textAlign: 'center', fontSize: 24, marginBottom: 0 }}>Prediction</p>
        {loading ? (
          <Spin size="large" />
        ) : result ? (
          <>
            <p style={{ fontSize: 20, textAlign: 'center', marginBottom: 0 }}>{result}</p>
            <p style={{ fontSize: 16, textAlign: 'center', color: 'gray', marginTop: 0 }}>
              {percentage && `${(percentage*100).toFixed(2)}%`}
            </p>
          </>
        ) : (
          <p style={{ color: 'gray' }}>Draw digits to see prediction</p>
        )}
      </Card>
    </div>
  );
};
