import React, { useState, useEffect } from 'react';
import { gsap } from 'gsap';

const CountdownTimer = ({ duration, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      onComplete();
    }
  }, [timeLeft, onComplete]);

  useEffect(() => {
    gsap.to('#countdown-circle', {
      strokeDashoffset: 0,
      duration: duration,
      ease: 'linear'
    });
  }, [duration]);

  return (
    <div className="flex items-center justify-center">
      <svg className="w-32 h-32" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="#e0e0e0"
          strokeWidth="10"
        />
        <circle
          id="countdown-circle"
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="#3b82f6"
          strokeWidth="10"
          strokeDasharray="283"
          strokeDashoffset="283"
          transform="rotate(-90 50 50)"
        />
        <text
          x="50"
          y="50"
          textAnchor="middle"
          dy=".3em"
          className="text-4xl font-bold"
        >
          {timeLeft}
        </text>
      </svg>
    </div>
  );
};

export default CountdownTimer;