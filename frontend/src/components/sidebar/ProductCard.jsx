export function ProductCard({ product, index, onRemove }) {
  return (
    <div className="group relative rounded-xl border border-white/[0.06] bg-white/[0.035] hover:bg-white/[0.06] transition p-3">
      <div className="flex gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shrink-0">
          <span className="text-[11px] font-bold text-slate-400">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        <div className="min-w-0 flex-1 pr-5">
          <p className="text-xs font-medium text-slate-300 leading-5 line-clamp-2">
            {product.title || "Amazon Product"}
          </p>
          {product.price && (
            <p className="text-xs text-slate-300 font-semibold mt-1">
              {product.price}
            </p>
          )}
        </div>

        <button
          onClick={() => onRemove(product.id)}
          aria-label="Remove Product"
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
