import { useEffect, useRef } from "react";
import { setupCanvas, drawStroke } from "./canvas";
import { socket } from "./socket";

export default function CanvasBoard() {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  const drawing = useRef(false);
  const prev = useRef(null);

  useEffect(() => {
  ctxRef.current = setupCanvas(canvasRef.current);

  socket.on("init_state", (strokes) => {
    strokes.forEach(s => drawStroke(ctxRef.current, s));
  });

  socket.on("draw", (stroke) => {
    drawStroke(ctxRef.current, stroke);
  });

  socket.on("replay", (strokes) => {
    ctxRef.current.clearRect(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
    strokes.forEach(s => drawStroke(ctxRef.current, s));
  });

  return () => {
    socket.off("init_state");
    socket.off("draw");
    socket.off("replay");
  };
}, []);


  function getCoords(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  function handleDown() {
    drawing.current = true;
  }

  function handleUp() {
    drawing.current = false;
    prev.current = null;
  }

  function handleMove(e) {
    if (!drawing.current) return;

    const curr = getCoords(e);

    if (prev.current) {
      const stroke = {
        start: prev.current,
        end: curr,
        color: "#000",
        width: 4,
        userId: socket.id
      };

      drawStroke(ctxRef.current, stroke);
      socket.emit("draw", stroke);
    }
    prev.current = curr;
  }

  return (
    <>
      <button onClick={() => socket.emit("undo")}>Undo</button>
      <canvas
        ref={canvasRef}
        onMouseDown={handleDown}
        onMouseUp={handleUp}
        onMouseMove={handleMove}
      />
    </>
  );
}
