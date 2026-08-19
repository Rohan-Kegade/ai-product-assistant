import { ProductCard } from "./ProductCard";

export function ProductList({ products, onRemoveProduct }) {
  return (
    <div className="flex-1 min-h-0 px-6 pt-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold text-slate-100 tracking-wider">
          Product Count
        </h2>
        <div className="min-w-7 h-7 px-2 rounded-lg bg-white/[0.06] border border-white/[0.06] flex items-center justify-center">
          <span className="text-xs font-semibold text-slate-400">
            {products.length}
          </span>
        </div>
      </div>

      <div className="space-y-2 overflow-y-auto max-h-[calc(100%-55px)] pr-1">
        {products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/[0.08] p-5 text-center">
            <div className="w-10 h-10 mx-auto rounded-xl bg-white/[0.04] flex items-center justify-center mb-3">
              <svg
                className="w-5 h-5 text-slate-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M20 13V7a2 2 0 00-2-2h-4l-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2h5"
                />
              </svg>
            </div>
            <p className="text-xs text-slate-500">
              Your research deck is empty
            </p>
          </div>
        ) : (
          products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              index={index}
              onRemove={onRemoveProduct}
            />
          ))
        )}
      </div>
    </div>
  );
}
