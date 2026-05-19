import React from "react";
import { X, Loader } from "lucide-react";

/**
 * Toast notification component
 */
export const Toast = ({ message, onClose, type = "success" }) => {
  const baseClass =
    "fixed bottom-4 right-4 left-4 sm:left-auto sm:w-96 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium animate-in slide-in-from-bottom-5 duration-300 z-50";

  const typeClass = {
    success: "bg-emerald-600",
    error: "bg-red-600",
    warning: "bg-yellow-600",
    info: "bg-blue-600",
  }[type] || "bg-slate-600";

  return (
    <div className={`${baseClass} ${typeClass}`}>
      <div className="flex items-center justify-between gap-3">
        <span>{message}</span>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

/**
 * Modal component
 */
export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  isLoading = false,
  loadingText = "Loading...",
  maxWidth = "md",
}) => {
  if (!isOpen) return null;

  const maxWidthClass = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  }[maxWidth] || "max-w-md";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className={`bg-white rounded-2xl w-full ${maxWidthClass} max-h-[85vh] flex flex-col shadow-2xl overflow-hidden relative`}>
        {isLoading && (
          <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm flex items-center justify-center flex-col">
            <Loader className="w-8 h-8 text-emerald-500 animate-spin mb-2" />
            <span className="text-xs font-bold text-emerald-700">
              {loadingText}
            </span>
          </div>
        )}

        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
          <h2 className="font-bold text-lg text-slate-800">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};

/**
 * Loading spinner component
 */
export const LoadingSpinner = ({ text = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center py-12 gap-3">
    <Loader className="w-8 h-8 text-emerald-500 animate-spin" />
    <p className="text-sm text-slate-500 font-medium">{text}</p>
  </div>
);

/**
 * Empty state component
 */
export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  actionLabel,
}) => (
  <div className="flex flex-col items-center justify-center text-center py-12 px-4">
    {Icon && (
      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-10 h-10 text-slate-400" />
      </div>
    )}
    <h3 className="font-bold text-slate-700 text-lg mb-2">{title}</h3>
    {description && (
      <p className="text-sm text-slate-500 max-w-xs mb-4">{description}</p>
    )}
    {action && actionLabel && (
      <button
        onClick={action}
        className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-sm transition-colors"
      >
        {actionLabel}
      </button>
    )}
  </div>
);

/**
 * Badge component
 */
export const Badge = ({ children, variant = "default", className = "" }) => {
  const variants = {
    default: "bg-slate-100 text-slate-700",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-yellow-100 text-yellow-700",
    error: "bg-red-100 text-red-700",
    primary: "bg-blue-100 text-blue-700",
  };

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

/**
 * Button component (responsive)
 */
export const Button = ({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  fullWidth = false,
  className = "",
  ...props
}) => {
  const variants = {
    primary: "bg-emerald-600 hover:bg-emerald-700 text-white",
    secondary: "bg-slate-100 hover:bg-slate-200 text-slate-900",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    ghost: "text-slate-600 hover:bg-slate-100",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        font-semibold rounded-lg transition-all
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

/**
 * Card component
 */
export const Card = ({ children, className = "", onClick = null }) => (
  <div
    onClick={onClick}
    className={`
      bg-white rounded-xl border border-slate-200 shadow-sm
      hover:shadow-md transition-shadow
      ${onClick ? "cursor-pointer" : ""}
      ${className}
    `}
  >
    {children}
  </div>
);
