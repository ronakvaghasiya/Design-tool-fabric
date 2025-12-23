"use client";

import { useEffect, useRef, useState } from "react";
import Toolbar from "@/components/Toolbar";

export default function Page() {
  const canvasElRef = useRef(null);
  const fabricRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!window.fabric) return;
    if (!canvasElRef.current) return;
    if (fabricRef.current) return;

    const FINAL_W = 900;
    const FINAL_H = 500;
    const BLEED = 20;
    const SAFETY = 40;

    const canvas = new window.fabric.Canvas(canvasElRef.current, {
      width: FINAL_W + BLEED * 2,
      height: FINAL_H + BLEED * 2,
      backgroundColor: "#f5f5f5",
      preserveObjectStacking: true,
    });

    fabricRef.current = canvas;
    setReady(true);

    /* -------- Artboard -------- */
    const artboard = new window.fabric.Rect({
      left: BLEED,
      top: BLEED,
      width: FINAL_W,
      height: FINAL_H,
      fill: "#fff",
      selectable: false,
      evented: false,
    });

    /* -------- Bleed -------- */
    const bleed = new window.fabric.Rect({
      left: BLEED,
      top: BLEED,
      width: FINAL_W,
      height: FINAL_H,
      fill: "transparent",
      stroke: "#7b61ff",
      strokeDashArray: [4, 4],
      selectable: false,
      evented: false,
    });

    /* -------- Safety -------- */
    const safety = new window.fabric.Rect({
      left: BLEED + SAFETY,
      top: BLEED + SAFETY,
      width: FINAL_W - SAFETY * 2,
      height: FINAL_H - SAFETY * 2,
      fill: "transparent",
      stroke: "red",
      strokeDashArray: [6, 4],
      selectable: false,
      evented: false,
    });

    canvas.add(artboard, bleed, safety);
    canvas.sendToBack(artboard);

    // 🔑 attach safety to canvas (IMPORTANT)
    canvas.safetyRect = safety;

    /* =====================================================
       🔒 KEEP TEXT INSIDE SAFETY (MOVE / SCALE / TYPE)
    ===================================================== */

    const keepTextInsideSafety = (text) => {
      if (!text || !canvas.safetyRect) return;

      text.setCoords();

      const textBounds = text.getBoundingRect(true);
      const safetyBounds = canvas.safetyRect.getBoundingRect(true);

      let fontSize = text.fontSize;

      // 1️⃣ shrink text if larger than safety
      while (
        (textBounds.width > safetyBounds.width ||
          textBounds.height > safetyBounds.height) &&
        fontSize > 6
      ) {
        fontSize -= 1;
        text.set({ fontSize });
        text.setCoords();
      }

      const updatedBounds = text.getBoundingRect(true);

      // LEFT
      if (updatedBounds.left < safetyBounds.left) {
        text.left += safetyBounds.left - updatedBounds.left;
      }

      // TOP
      if (updatedBounds.top < safetyBounds.top) {
        text.top += safetyBounds.top - updatedBounds.top;
      }

      // RIGHT
      if (
        updatedBounds.left + updatedBounds.width >
        safetyBounds.left + safetyBounds.width
      ) {
        text.left -=
          updatedBounds.left +
          updatedBounds.width -
          (safetyBounds.left + safetyBounds.width);
      }

      // BOTTOM
      if (
        updatedBounds.top + updatedBounds.height >
        safetyBounds.top + safetyBounds.height
      ) {
        text.top -=
          updatedBounds.top +
          updatedBounds.height -
          (safetyBounds.top + safetyBounds.height);
      }

      text.setCoords();
    };

    const autoFitTextInsideSafety = (text) => {
  if (!text || !canvas.safetyRect) return;

  const safetyBounds = canvas.safetyRect.getBoundingRect(true);

  // 🔑 remember original size
  if (!text.baseFontSize) {
    text.baseFontSize = text.fontSize;
  }

  let fontSize = text.fontSize;

  text.setCoords();
  let bounds = text.getBoundingRect(true);

  /* ---------------- SHRINK (SOFT) ---------------- */
  if (
    bounds.width > safetyBounds.width ||
    bounds.height > safetyBounds.height
  ) {
    text.set({
      fontSize: Math.max(fontSize - 1, 6), // 🔥 only -1 per event
    });
    text.setCoords();
  }

  /* ---------------- GROW BACK (SOFT) ---------------- */
  else if (fontSize < text.baseFontSize) {
    text.set({
      fontSize: fontSize + 1, // 🔥 only +1 per event
    });
    text.setCoords();

    const testBounds = text.getBoundingRect(true);

    // agar grow karne se overflow ho jaye → revert
    if (
      testBounds.width > safetyBounds.width ||
      testBounds.height > safetyBounds.height
    ) {
      text.set({ fontSize });
      text.setCoords();
    }
  }

  /* ---------------- POSITION CLAMP ---------------- */
  bounds = text.getBoundingRect(true);

  if (bounds.left < safetyBounds.left) {
    text.left += safetyBounds.left - bounds.left;
  }

  if (bounds.top < safetyBounds.top) {
    text.top += safetyBounds.top - bounds.top;
  }

  if (
    bounds.left + bounds.width >
    safetyBounds.left + safetyBounds.width
  ) {
    text.left -=
      bounds.left +
      bounds.width -
      (safetyBounds.left + safetyBounds.width);
  }

  if (
    bounds.top + bounds.height >
    safetyBounds.top + safetyBounds.height
  ) {
    text.top -=
      bounds.top +
      bounds.height -
      (safetyBounds.top + safetyBounds.height);
  }

  text.setCoords();
};

    /* -------- MOVE -------- */
canvas.on("text:changed", (e) => {
  const obj = e.target;
  if (!obj || obj.type !== "i-text") return;

  autoFitTextInsideSafety(obj);
  canvas.requestRenderAll();
});

canvas.on("object:moving", (e) => {
  if (e.target?.type === "i-text") {
    autoFitTextInsideSafety(e.target);
  }
});

canvas.on("object:scaling", (e) => {
  const obj = e.target;
  if (!obj || obj.type !== "i-text") return;

  obj.scaleX = obj.scaleY;
  autoFitTextInsideSafety(obj);
});

    /* -------- TYPING (MAIN FIX) -------- */
    canvas.on("text:changed", (e) => {
      console.log("🚀 ~ Page ~ e:", e)
      const obj = e.target;
      if (!obj || obj.type !== "i-text") return;

      keepTextInsideSafety(obj);
      canvas.requestRenderAll();
    });

    return () => {
      canvas.dispose();
      fabricRef.current = null;
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasElRef}
        width={940}
        height={540}
        style={{ border: "1px solid #ccc" }}
        />
        {ready && <Toolbar canvasRef={fabricRef} />}

    </>
  );
}
