import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";

const CountdownTimer = ({ duration, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const circleRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    gsap.to(circleRef.current, {
      strokeDashoffset: 0,
      duration: duration,
      ease: "linear",
    });

    return () => clearInterval(timer);
  }, [duration, onComplete]);

  const circumference = 2 * Math.PI * 120; // Larger circle for full-page popup

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="relative w-64 h-64">
        <svg className="w-full h-full" viewBox="0 0 260 260">
          <circle
            cx="130"
            cy="130"
            r="120"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="12"
          />
          <circle
            ref={circleRef}
            cx="130"
            cy="130"
            r="120"
            fill="none"
            stroke="#10b981"
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            className="transform -rotate-90 origin-center"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-6xl font-bold text-white">{timeLeft}</span>
        </div>
      </div>
      <p className="mt-6 text-2xl font-semibold text-white animate-pulse">
        Get Ready! Game Starting Soon...
      </p>
    </div>
  );
};

export default CountdownTimer;