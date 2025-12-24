"use client";

import { useEffect, useRef, useState } from "react";
import Toolbar from "@/components/Toolbar";
import { loadGoogleFonts, FONT_FAMILIES } from "@/components/Font";

/* ================= SIZE PRESETS ================= */
const SIZE_MAP = {
  "2x3": { w: 600, h: 900 },
  "3x2": { w: 900, h: 600 },
  "3x5": { w: 900, h: 1500 },
  "5x3": { w: 1500, h: 900 },
  "3x4": { w: 900, h: 1200 },
  "4x3": { w: 1200, h: 900 },
  "3x6": { w: 900, h: 1800 },
  "6x3": { w: 1800, h: 900 },
  "4x6": { w: 1200, h: 1800 },
  "6x4": { w: 1800, h: 1200 },
  "4x8": { w: 1200, h: 2400 },
  "8x4": { w: 2400, h: 1200 },
  "4x10": { w: 1200, h: 3000 },
  "6x8": { w: 1800, h: 2400 },
  "6x10": { w: 1800, h: 3000 },
};

/* ================= AUTO FIT ================= */
const autoFitTextInsideSafety = (text, canvas) => {
  if (!text || !canvas?.safetyRect) return;

  const safety = canvas.safetyRect.getBoundingRect(true);

  if (!text.baseFontSize) {
    text.baseFontSize = text.fontSize;
  }

  text.setCoords();
  let bounds = text.getBoundingRect(true);
  let fontSize = text.fontSize;

  if (bounds.width > safety.width || bounds.height > safety.height) {
    text.set({ fontSize: Math.max(fontSize - 1, 6) });
    text.setCoords();
  } else if (fontSize < text.baseFontSize) {
    text.set({ fontSize: fontSize + 1 });
    const test = text.getBoundingRect(true);
    if (test.width > safety.width || test.height > safety.height) {
      text.set({ fontSize });
    }
  }

  bounds = text.getBoundingRect(true);

  if (bounds.left < safety.left) text.left += safety.left - bounds.left;
  if (bounds.top < safety.top) text.top += safety.top - bounds.top;
  if (bounds.left + bounds.width > safety.left + safety.width)
    text.left -= bounds.left + bounds.width - (safety.left + safety.width);
  if (bounds.top + bounds.height > safety.top + safety.height)
    text.top -= bounds.top + bounds.height - (safety.top + safety.height);

  text.setCoords();
};

export default function Page() {
  const canvasElRef = useRef(null);
  const fabricRef = useRef(null);
  const [ready, setReady] = useState(false);

  /* LOAD FONTS */
  useEffect(() => {
    loadGoogleFonts(FONT_FAMILIES);
  }, []);

  /* INIT CANVAS */
  useEffect(() => {
    if (!window.fabric || !canvasElRef.current || fabricRef.current) return;

    const INIT_W = 900;
    const INIT_H = 500;
    const BLEED = 20;
    const SAFETY = 40;

    const canvas = new window.fabric.Canvas(canvasElRef.current, {
      width: INIT_W + BLEED * 2,
      height: INIT_H + BLEED * 2,
      backgroundColor: "#f5f5f5",
      preserveObjectStacking: true,
    });

    fabricRef.current = canvas;
    setReady(true);

    const artboard = new window.fabric.Rect({
      left: BLEED,
      top: BLEED,
      width: INIT_W,
      height: INIT_H,
      fill: "#fff",
      selectable: false,
      evented: false,
    });
    artboard.name = "artboard";

    const bleed = new window.fabric.Rect({
      left: BLEED,
      top: BLEED,
      width: INIT_W,
      height: INIT_H,
      fill: "transparent",
      stroke: "#7b61ff",
      strokeDashArray: [4, 4],
      selectable: false,
      evented: false,
    });
    bleed.name = "bleed";

    const safety = new window.fabric.Rect({
      left: BLEED + SAFETY,
      top: BLEED + SAFETY,
      width: INIT_W - SAFETY * 2,
      height: INIT_H - SAFETY * 2,
      fill: "transparent",
      stroke: "red",
      strokeDashArray: [6, 4],
      selectable: false,
      evented: false,
    });
    safety.name = "safety";

    canvas.add(artboard, bleed, safety);
    canvas.sendToBack(artboard);
    canvas.safetyRect = safety;

    canvas.on("text:changed", e => {
      if (e.target?.type === "i-text") {
        autoFitTextInsideSafety(e.target, canvas);
        canvas.requestRenderAll();
      }
    });

    return () => canvas.dispose();
  }, []);

  const changeCanvasSize = sizeKey => {
    const canvas = fabricRef.current;
    if (!canvas || !SIZE_MAP[sizeKey]) return;

    const { w, h } = SIZE_MAP[sizeKey];
    const BLEED = 20;
    const SAFETY = 40;

    const artboard = canvas.getObjects().find(o => o.name === "artboard");
    const bleed = canvas.getObjects().find(o => o.name === "bleed");
    const safety = canvas.getObjects().find(o => o.name === "safety");

    const oldSafety = safety.getBoundingRect(true);

    canvas.setWidth(w + BLEED * 2);
    canvas.setHeight(h + BLEED * 2);

    artboard.set({ left: BLEED, top: BLEED, width: w, height: h });
    bleed.set({ left: BLEED, top: BLEED, width: w, height: h });
    safety.set({
      left: BLEED + SAFETY,
      top: BLEED + SAFETY,
      width: w - SAFETY * 2,
      height: h - SAFETY * 2,
    });

    canvas.safetyRect = safety;
    canvas.requestRenderAll();
  };

  return (
    <>
      <select onChange={e => changeCanvasSize(e.target.value)} defaultValue="4x6">
        {Object.keys(SIZE_MAP).map(s => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <canvas ref={canvasElRef} width={940} height={540} />

      {ready && <Toolbar canvasRef={fabricRef} />}
    </>
  );
}
