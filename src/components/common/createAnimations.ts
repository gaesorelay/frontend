export const animationStyles = `
@keyframes float {
  0% { transform: translateY(0px) rotate(var(--base-rotation)); }
  50% { transform: translateY(-12px) rotate(calc(var(--base-rotation) + 6deg)); }
  100% { transform: translateY(0px) rotate(var(--base-rotation)); }
}
@keyframes floatReverse {
  0% { transform: translateY(0px) rotate(var(--base-rotation)); }
  50% { transform: translateY(12px) rotate(calc(var(--base-rotation) - 6deg)); }
  100% { transform: translateY(0px) rotate(var(--base-rotation)); }
}
@keyframes wiggle {
  0% { transform: rotate(calc(var(--base-rotation) - 4deg)); }
  50% { transform: rotate(calc(var(--base-rotation) + 4deg)); }
  100% { transform: rotate(calc(var(--base-rotation) - 4deg)); }
}

/* 지글지글 낙서(Jitter) */
@keyframes logoJitter {
  0% { transform: rotate(0deg); }
  25% { transform: rotate(2deg); }
  50% { transform: rotate(-1deg); }
  75% { transform: rotate(1deg); }
  100% { transform: rotate(0deg); }
}

.create-btn:active {
  transform: scale(0.98);
  box-shadow: 2px 2px 0px rgba(0, 0, 0, 0.25) !important;
}

.control-btn:active {
  filter: brightness(0.95);
  transform: scale(0.95);
}
`;
