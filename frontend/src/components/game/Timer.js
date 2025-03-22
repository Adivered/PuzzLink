import React, { useEffect, useState } from 'react';

const Timer = ({ timer, setTimer }) => {
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [setTimer]);

  return <div className="text-lg font-semibold">Time: {timer}s</div>;
};

export default Timer;