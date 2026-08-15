import { useEffect, useState } from "react";

export function useCountUp(target, duration = 800) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (typeof target !== "number") {
      setValue(target);
      return;
    }

    let start = null;

    const step = (timestamp) => {
      if (start === null) start = timestamp;

      const progress = Math.min((timestamp - start) / duration, 1);

      const current = progress * target;

      setValue(
        Number.isInteger(target) ? Math.round(current) : Math.round(current * 10) / 10
      );

      if (progress < 1) requestAnimationFrame(step);
    };

    const frame = requestAnimationFrame(step);

    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}