import React, { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { removeToast } from "../../../app/store/toastSlice";
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, UserPlusIcon } from "@heroicons/react/24/outline";

const ToastContainer = () => {
  const dispatch = useDispatch();
  const toasts = useSelector((state) => state.toast.toasts);
  const timersRef = useRef(new Map());

  // Auto-remove toasts after their duration - only for new toasts
  useEffect(() => {
    toasts.forEach((toast) => {
      // Only create timer if we don't already have one for this toast
      if (!timersRef.current.has(toast.id)) {
        const timer = setTimeout(() => {
          dispatch(removeToast(toast.id));
          timersRef.current.delete(toast.id);
        }, toast.duration || 5000);
        
        timersRef.current.set(toast.id, timer);
      }
    });

    // Clean up timers for toasts that no longer exist
    const currentToastIds = new Set(toasts.map(t => t.id));
    for (const [toastId, timer] of timersRef.current.entries()) {
      if (!currentToastIds.has(toastId)) {
        clearTimeout(timer);
        timersRef.current.delete(toastId);
      }
    }

    // Cleanup function
    const timers = timersRef.current;
    return () => {
      if (timers) {
        timers.forEach(timer => clearTimeout(timer));
        timers.clear();
      }
    };
  }, [toasts, dispatch]);

  const handleManualRemove = (toastId) => {
    // Clear the timer if it exists
    const timer = timersRef.current.get(toastId);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(toastId);
    }
    dispatch(removeToast(toastId));
  };

  const getToastIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircleIcon className="w-5 h-5" />;
      case "error":
        return <XCircleIcon className="w-5 h-5" />;
      case "info":
        return <InformationCircleIcon className="w-5 h-5" />;
      case "invitation":
        return <UserPlusIcon className="w-5 h-5" />;
      default:
        return <InformationCircleIcon className="w-5 h-5" />;
    }
  };

  const getToastStyles = (type) => {
    switch (type) {
      case "success":
        return "bg-green-500 border-green-600";
      case "error":
        return "bg-red-500 border-red-600";
      case "info":
        return "bg-blue-500 border-blue-600";
      case "invitation":
        return "bg-purple-500 border-purple-600";
      default:
        return "bg-gray-500 border-gray-600";
    }
  };

  return (
    <div className="fixed top-4 right-4 space-y-2 z-50">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            px-4 py-3 rounded-lg shadow-lg text-white flex items-center justify-between
            border-l-4 min-w-[300px] max-w-[400px]
            transform transition-all duration-300 ease-in-out
            hover:scale-105 animate-slide-in-right
            ${getToastStyles(toast.type)}
          `}
        >
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {getToastIcon(toast.type)}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium leading-5">{toast.message}</p>
              {toast.timestamp && (
                <p className="text-xs opacity-75 mt-1">
                  {new Date(toast.timestamp).toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => handleManualRemove(toast.id)}
            className="ml-3 flex-shrink-0 text-white hover:text-gray-200 transition-colors duration-200"
            aria-label="Close notification"
          >
            <XCircleIcon className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;