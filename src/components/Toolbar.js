"use client";

import { useEffect, useState, useRef } from "react";
import { HexColorPicker } from "react-colorful";
import { FONT_FAMILIES } from "./Font";

export default function Toolbar({ canvasRef }) {
  const [activeText, setActiveText] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const pickerRef = useRef(null);

  /* ================= HELPERS ================= */
  const getCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || canvas.disposed) return null;
    return canvas;
  };

  const getActive = () => {
    const canvas = getCanvas();
    return canvas?.getActiveObject();
  };

  const sync = obj => {
    setActiveText({ ...obj });
  };

  /* ================= SELECTION TRACK ================= */
  useEffect(() => {
    const canvas = getCanvas();
    if (!canvas) return;

    const onSelect = e => {
      const obj = e?.selected?.[0];
      setActiveText(obj?.type === "i-text" ? { ...obj } : null);
      setShowColorPicker(false);
    };

    const onClear = () => {
      setActiveText(null);
      setShowColorPicker(false);
    };

    canvas.on("selection:created", onSelect);
    canvas.on("selection:updated", onSelect);
    canvas.on("selection:cleared", onClear);

    return () => {
      canvas.off("selection:created", onSelect);
      canvas.off("selection:updated", onSelect);
      canvas.off("selection:cleared", onClear);
    };
  }, []);

  /* ================= CLICK OUTSIDE (COLOR PICKER) ================= */
  useEffect(() => {
    const handleClick = e => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(e.target)
      ) {
        setShowColorPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  /* ================= BASIC ACTIONS ================= */
  const addText = () => {
    const canvas = getCanvas();
    if (!canvas) return;

    const text = new window.fabric.IText("Type here", {
      left: canvas.width / 2,
      top: canvas.height / 2,
      fontSize: 32,
      fill: "#000000",
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
    sync(text);
  };

  const clearCanvas = () => {
    const canvas = getCanvas();
    if (!canvas) return;

    canvas
      .getObjects()
      .filter(o => o.selectable)
      .forEach(o => canvas.remove(o));

    canvas.requestRenderAll();
    setActiveText(null);
  };

  /* ================= TEXT UPDATE ================= */
  const updateText = props => {
    const canvas = getCanvas();
    const obj = getActive();
    if (!canvas || !obj || obj.type !== "i-text") return;

    obj.set(props);
    obj.setCoords();
    canvas.requestRenderAll();
    sync(obj);
  };

  /* ================= COLOR ================= */
  const changeColor = color => {
    updateText({ fill: color });
  };

  /* ================= COPY / DELETE ================= */
  const copy = () => {
    const canvas = getCanvas();
    const obj = getActive();
    if (!canvas || !obj) return;

    obj.clone(clone => {
      clone.set({ left: obj.left + 20, top: obj.top + 20 });
      canvas.add(clone);
      canvas.setActiveObject(clone);
      canvas.requestRenderAll();
      sync(clone);
    });
  };

  const remove = () => {
    const canvas = getCanvas();
    const obj = getActive();
    if (!canvas || !obj) return;

    canvas.remove(obj);
    canvas.requestRenderAll();
    setActiveText(null);
  };

  /* ================= LAYER ================= */
  const bringFront = () => {
    const canvas = getCanvas();
    const obj = getActive();
    if (!canvas || !obj) return;
    canvas.bringToFront(obj);
    canvas.requestRenderAll();
  };

  const sendBack = () => {
    const canvas = getCanvas();
    const obj = getActive();
    if (!canvas || !obj) return;
    canvas.sendToBack(obj);
    canvas.requestRenderAll();
  };

  /* ================= UI ================= */
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
        padding: 10,
        marginBottom: 10,
        background: "#fff",
        border: "1px solid #ddd",
        alignItems: "center",
        position: "relative",
      }}
    >
      <button onClick={addText}>Text</button>
      <button onClick={clearCanvas}>Clear</button>

      {activeText && (
        <>
          {/* FONT FAMILY */}
          <select
            value={activeText.fontFamily}
            onChange={e => updateText({ fontFamily: e.target.value })}
          >
            {FONT_FAMILIES.map(font => (
              <option key={font} value={font}>{font}</option>
            ))}
          </select>

          {/* FONT SIZE */}
          <select
            value={activeText.fontSize ?? 32}
            onChange={e => updateText({ fontSize: +e.target.value })}
          >
            {[12,16,20,24,32,40,48,64].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* 🎨 COLOR */}
          <button onClick={() => setShowColorPicker(v => !v)}>
            🎨 Color
          </button>

          {showColorPicker && (
            <div
              ref={pickerRef}
              style={{
                position: "absolute",
                top: 50,
                left: 10,
                zIndex: 999,
                background: "#fff",
                padding: 10,
                border: "1px solid #ddd",
                borderRadius: 6,
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}
            >
              <HexColorPicker
                color={activeText.fill || "#000000"}
                onChange={changeColor}
              />
            </div>
          )}

          {/* B I U */}
          <button
            onClick={() =>
              updateText({
                fontWeight:
                  activeText.fontWeight === "bold" ? "normal" : "bold",
              })
            }
          >
            B
          </button>

          <button
            onClick={() =>
              updateText({
                fontStyle:
                  activeText.fontStyle === "italic" ? "normal" : "italic",
              })
            }
          >
            I
          </button>

          <button
            onClick={() =>
              updateText({ underline: !activeText.underline })
            }
          >
            U
          </button>

          {/* ALIGN */}
          <select
            value={activeText.textAlign}
            onChange={e => updateText({ textAlign: e.target.value })}
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>

          {/* LETTER SPACING */}
          <input
            type="number"
            value={activeText.charSpacing ?? 0}
            onChange={e => updateText({ charSpacing: +e.target.value })}
            style={{ width: 60 }}
          />

          {/* OPACITY */}
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={activeText.opacity ?? 1}
            onChange={e => updateText({ opacity: +e.target.value })}
          />

          {/* ROTATE */}
          <input
            type="number"
            value={Math.round(activeText.angle ?? 0)}
            onChange={e => updateText({ angle: +e.target.value })}
            style={{ width: 60 }}
          />

          {/* FLIP */}
          <button onClick={() => updateText({ flipX: !activeText.flipX })}>
            Flip H
          </button>

          {/* COPY / DELETE */}
          <button onClick={copy}>Copy</button>
          <button onClick={remove}>Delete</button>

          {/* LAYER */}
          <button onClick={bringFront}>Front</button>
          <button onClick={sendBack}>Back</button>
        </>
      )}
    </div>
  );
}
