import { useCallback, useEffect, useRef } from "react";

const useAnimationFrame = callback => {
  const requestRef = useRef();
  const ticking = useRef(false);
  useEffect(() => {
    return () => cancelAnimationFrame(requestRef.current);
  }, []);
  const result = useCallback(() => {
    if (!ticking.current) {
      requestRef.current = requestAnimationFrame(() => {
        callback();
        ticking.current = false;
      });
    }
    ticking.current = true;
  }, [callback]);
  return result;
};

export {
  useAnimationFrame,
};
