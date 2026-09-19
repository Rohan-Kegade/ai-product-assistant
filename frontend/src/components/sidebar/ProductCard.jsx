import { LoadingSpinner } from "../common/LoadingSpinner";

export function ProductCard({ product, index, removing, cached, onRemove }) {
  const title = product.title || "Amazon Product";

  return (
    <div
      className={`group relative rounded-xl border border-white/[0.06] bg-white/[0.035] hover:bg-white/[0.06] transition p-3 ${
        removing ? "opacity-50" : ""
      }`}
    >
      <div className="flex gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shrink-0">
          <span className="text-[11px] font-bold text-slate-400">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        <div className="min-w-0 flex-1 pr-5">
          {product.url ? (
            <a
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              title={title}
              className="block text-xs font-medium text-slate-300 hover:text-white leading-5 line-clamp-2 transition"
            >
              {title}
            </a>
          ) : (
            <p className="text-xs font-medium text-slate-300 leading-5 line-clamp-2">
              {title}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
            {product.price && (
              <span className="text-xs text-slate-300 font-semibold">
                {product.price}
              </span>
            )}
            {product.rating && (
              <span className="text-[11px] text-slate-500">
                {product.rating.replace(" out of 5 stars", "")}★
                {product.reviewCount ? ` ${product.reviewCount}` : ""}
              </span>
            )}
            {cached && (
              <span
                title="Already scraped - loaded instantly from the database"
                className="text-[10px] font-semibold uppercase tracking-wide text-emerald-400 bg-emerald-400/10 rounded px-1.5 py-0.5"
              >
                Cached
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => onRemove(product.id)}
          disabled={removing}
          aria-label="Remove Product"
          className={`absolute top-3 right-3 text-slate-600 hover:text-red-400 transition disabled:cursor-not-allowed ${
            removing ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          {removing ? (
            <LoadingSpinner size="sm" color="light" />
          ) : (
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
          )}
        </button>
      </div>
    </div>
  );
}
