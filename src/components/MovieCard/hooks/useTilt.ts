import { useState, PointerEvent } from "react";

// How strongly the card leans: bigger number = gentler tilt (same as the reference)
const TILT_SOFTNESS = 50;

// How "deep" the 3D looks (like the distance to a camera), in px. Smaller = stronger 3D.
// It's part of the transform itself, so the card needs no extra wrapper for it
const PERSPECTIVE = 500;

// Follows the mouse and returns the transform that leans the card toward it
export default function useTilt() {
  const [state, setState] = useState({ rotateX: 0, rotateY: 0, active: false });

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    // Only for a mouse (a finger has no "hover"), and never with reduced motion
    if (e.pointerType !== "mouse") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left; // mouse position inside the card, in px
    const y = e.clientY - rect.top;

    setState({
      // Mouse below the middle → top edge leans back; right of middle → right edge leans back
      rotateX: (y - rect.height / 2) / TILT_SOFTNESS,
      rotateY: (rect.width / 2 - x) / TILT_SOFTNESS,
      active: true,
    });
  }

  function onPointerLeave() {
    setState({ rotateX: 0, rotateY: 0, active: false });
  }

  return {
    onPointerMove,
    onPointerLeave,
    // perspective() is always there, also when not tilted: the flip inside needs it to look 3D
    transform: state.active
      ? `perspective(${PERSPECTIVE}px) rotateX(${state.rotateX}deg) rotateY(${state.rotateY}deg) scale3d(1.05, 1.05, 1.05)`
      : `perspective(${PERSPECTIVE}px)`,
  };
}
