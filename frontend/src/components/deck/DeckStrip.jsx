import { useState } from "react";
import { LoadingSpinner } from "../common/LoadingSpinner";

function productTooltip(product, cached) {
  return [
    product.title || "Amazon Product",
    product.price,
    product.rating &&
      `${product.rating.replace(" out of 5 stars", "")}★${
        product.reviewCount ? ` ${product.reviewCount}` : ""
      }`,
    cached && "Loaded from cache",
  ]
    .filter(Boolean)
    .join(" · ");
}

export function DeckStrip({
  products,
  isLoadingConversation,
  productUrl,
  setProductUrl,
  isAddingProduct,
  removingProductIds,
  cachedProductIds,
  onAddProduct,
  onRemoveProduct,
}) {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const busy = isLoadingConversation || isAddingProduct;
  // An empty conversation needs its first product before anything else works,
  // so the URL box is always open then.
  const showForm = isFormOpen || (!isLoadingConversation && products.length === 0);

  return (
    <div className="shrink-0 border-b border-slate-200/70 bg-white/60 px-4 md:px-8 py-2.5">
      <div className="flex items-start gap-3">
        <span className="hidden sm:block shrink-0 pt-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Products
        </span>

        <div className="min-w-0 flex-1 flex flex-nowrap items-center gap-2 overflow-x-auto sm:flex-wrap sm:overflow-x-visible sm:max-h-24 sm:overflow-y-auto [scrollbar-width:none]">
          {isLoadingConversation ? (
            <span
              aria-busy="true"
              className="h-7 w-48 rounded-full bg-slate-200/70 animate-pulse"
            />
          ) : (
            products.map((product) => {
              const removing = removingProductIds.includes(product.id);
              const cached = cachedProductIds.includes(product.id);
              const title = product.title || "Amazon Product";

              return (
                <span
                  key={product.id}
                  title={productTooltip(product, cached)}
                  className={`group inline-flex shrink-0 items-center max-w-[240px] sm:max-w-[280px] rounded-full border border-slate-200 bg-white pl-3 pr-1 py-0.5 text-xs font-medium text-slate-700 transition ${
                    removing ? "opacity-50" : ""
                  }`}
                >
                  {product.url ? (
                    <a
                      href={product.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate hover:text-blue-600 transition"
                    >
                      {title}
                    </a>
                  ) : (
                    <span className="truncate">{title}</span>
                  )}

                  {cached && (
                    <span className="ml-2 shrink-0 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-600">
                      Cached
                    </span>
                  )}

                  <button
                    onClick={() => onRemoveProduct(product.id)}
                    disabled={removing || isLoadingConversation}
                    aria-label={`Remove ${title}`}
                    className="ml-1 w-6 h-6 sm:w-5 sm:h-5 shrink-0 rounded-full flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition disabled:cursor-not-allowed"
                  >
                    {removing ? (
                      <LoadingSpinner size="sm" color="light" />
                    ) : (
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2.5"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    )}
                  </button>
                </span>
              );
            })
          )}

          {!isLoadingConversation && !showForm && (
            <button
              onClick={() => setIsFormOpen(true)}
              className="inline-flex shrink-0 items-center gap-1 rounded-full border border-dashed border-slate-300 px-3 py-1 text-xs font-semibold text-slate-500 hover:border-blue-400 hover:text-blue-600 transition"
            >
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M12 5v14M5 12h14"
                />
              </svg>
              Add product
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="mt-2 flex items-center gap-2">
          <input
            autoFocus={products.length > 0}
            value={productUrl}
            disabled={busy}
            onChange={(e) => setProductUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onAddProduct();
              if (e.key === "Escape" && products.length > 0) setIsFormOpen(false);
            }}
            placeholder="Paste an Amazon product URL..."
            aria-label="Product URL"
            className="min-w-0 flex-1 h-10 sm:h-9 px-3 rounded-lg bg-white border border-slate-200 text-base sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60"
          />
          <button
            onClick={onAddProduct}
            disabled={!productUrl.trim() || busy}
            className="h-10 sm:h-9 px-4 rounded-lg bg-slate-900 hover:bg-blue-600 text-white text-xs font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isAddingProduct ? (
              <>
                <LoadingSpinner size="sm" color="white" />
                Adding...
              </>
            ) : (
              "Add"
            )}
          </button>
          {products.length > 0 && (
            <button
              onClick={() => setIsFormOpen(false)}
              className="h-10 sm:h-9 px-2 text-xs font-semibold text-slate-400 hover:text-slate-700 transition"
            >
              Close
            </button>
          )}
        </div>
      )}
    </div>
  );
}
