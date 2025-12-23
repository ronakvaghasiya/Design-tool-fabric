"use client";

export default function Toolbar({ canvasRef }) {
  const getCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || canvas.disposed) return null;
    return canvas;
  };

  const addText = () => {
    const canvas = getCanvas();
    if (!canvas) return;

    const text = new window.fabric.IText("Type here", {
      left: canvas.width / 2,
      top: canvas.height / 2,
      fontSize: 32,
      fill: "#000",
      lockUniScaling: true,
      lockScalingFlip: true,
    });

    // ❌ no stretch handles
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

    const objects = canvas.getObjects().filter(o => o.selectable);
    console.log("🚀 ~ clearCanvas ~ objects:", objects)
    objects.forEach(o => canvas.remove(o));
    canvas.requestRenderAll();
  };

  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        marginBottom: 10,
        padding: 10,
        background: "#fff",
        border: "1px solid #ddd",
      }}
    >
      <button onClick={addText}>Text</button>
      <button onClick={clearCanvas}>Clear</button>
    </div>
  );
}
