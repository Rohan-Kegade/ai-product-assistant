export function LoadingSpinner({ size = "md", color = "light" }) {
  const sizeClasses = {
    sm: "w-3 h-3 border",
    md: "w-4 h-4 border-2",
    lg: "w-6 h-6 border-2",
  };

  const colorClasses = {
    light: "border-slate-300 border-t-slate-900",
    white: "border-white/30 border-t-white",
  };

  return (
    <span
      className={`rounded-full animate-spin ${sizeClasses[size]} ${colorClasses[color]}`}
    />
  );
}
