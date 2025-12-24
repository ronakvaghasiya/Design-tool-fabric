"use client";

import { useEffect, useState } from "react";
import { FONT_FAMILIES } from "./Font";

export default function Toolbar({ canvasRef }) {
  const [activeText, setActiveText] = useState(null);

  const getCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || canvas.disposed) return null;
    return canvas;
  };

useEffect(() => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const onSelect = e => {
    const obj = e?.selected?.[0];
    setActiveText(obj?.type === "i-text" ? obj : null);
  };

  const onClear = () => setActiveText(null);

  canvas.on("selection:created", onSelect);
  canvas.on("selection:updated", onSelect);
  canvas.on("selection:cleared", onClear);

  return () => {
    canvas.off("selection:created", onSelect);
    canvas.off("selection:updated", onSelect);
    canvas.off("selection:cleared", onClear);
  };
}, []);


  const addText = () => {
    const canvas = getCanvas();
    if (!canvas) return;

    const text = new window.fabric.IText("Type here", {
      left: canvas.width / 2,
      top: canvas.height / 2,
      fontSize: 32,
      fill: "#000",
      fontFamily: "Arial",
      lockUniScaling: true,
      lockScalingFlip: true,
    });

    text.setControlsVisibility({
      mt: false,
      mb: false,
      ml: false,
      mr: false,
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.requestRenderAll();
  };

  const clearCanvas = () => {
    const canvas = getCanvas();
    if (!canvas) return;

    canvas
      .getObjects()
      .filter(o => o.selectable)
      .forEach(o => canvas.remove(o));

    canvas.requestRenderAll();
  };

 const changeFont = font => {
    const canvas = canvasRef.current;
    const obj = canvas?.getActiveObject();
    if (!obj || obj.type !== "i-text") return;

    obj.set("fontFamily", font);
    canvas.requestRenderAll();

    // 🔥 force React refresh
    setActiveText({ ...obj });
  };
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        padding: 10,
        marginBottom: 10,
        background: "#fff",
        border: "1px solid #ddd",
        alignItems: "center",
      }}
    >
      <button onClick={addText}>Text</button>
      <button onClick={clearCanvas}>Clear</button>

      {activeText && (
        <select
          value={activeText.fontFamily}
          onChange={e => changeFont(e.target.value)}
        >
          {FONT_FAMILIES.map(font => (
            <option key={font} value={font}>
              {font}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
