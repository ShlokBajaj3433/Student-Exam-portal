import { useState, useEffect, useRef } from 'react';

/**
 * useCountdown
 *
 * Counts down from `durationMinutes` to zero, ticking every second.
 * Calls `onExpire` exactly once when the countdown reaches 0:00.
 * Cleans up the interval on unmount.
 *
 * @param {number} durationMinutes  Total duration in minutes
 * @param {() => void} onExpire     Callback fired when the timer hits 0
 * @returns {{ minutes: number, seconds: number, isExpired: boolean }}
 */
function useCountdown(durationMinutes, onExpire) {
  const [timeLeft, setTimeLeft] = useState(() => Math.max(0, durationMinutes * 60));
  const onExpireRef = useRef(onExpire);
  const expiredRef = useRef(false);

  // Keep the callback ref current so callers don't need to memoize it
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (!expiredRef.current) {
        expiredRef.current = true;
        onExpireRef.current?.();
      }
      return;
    }

    const id = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          clearInterval(id);
          if (!expiredRef.current) {
            expiredRef.current = true;
            // Schedule callback after state update to avoid calling during render
            setTimeout(() => onExpireRef.current?.(), 0);
          }
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(id);
    // Only re-run if the initial duration changes (e.g. attempt loaded after mount)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [durationMinutes]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isExpired = timeLeft <= 0;

  return { minutes, seconds, isExpired };
}

export default useCountdown;
