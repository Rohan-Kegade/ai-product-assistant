import { ProductList } from "./ProductList";
import { LoadingSpinner } from "../common/LoadingSpinner";

export function Sidebar({
  url,
  setUrl,
  products,
  loadingProduct,
  onAddProduct,
  onRemoveProduct,
}) {
  return (
    <aside className="hidden lg:flex w-[350px] bg-[#0b0f19] text-white flex-col relative overflow-hidden shrink-0">
      <div className="absolute -top-32 -left-32 w-72 h-72 bg-blue-600/20 blur-[100px] rounded-full" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-violet-600/10 blur-[100px] rounded-full" />

      <div className="relative z-10 flex flex-col h-full">
        <div className="px-6 pt-6 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg
                className="w-9 h-9 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M8 10h8M8 14h5m7-2a8 8 0 11-16 0 8 8 0 0116 0z"
                />
              </svg>
            </div>
            <h1 className="text-[17px] font-bold tracking-tight">ProductIQ</h1>
          </div>
        </div>

        <div className="mx-6 border-t border-white/[0.06]" />

        <div className="px-6 pt-6">
          <div className="mb-3">
            <h2 className="text-xs font-semibold text-slate-100 uppercase tracking-wider">
              Product Deck
            </h2>
            <p className="text-[11px] text-slate-400 mt-1">
              Add products to your research workspace
            </p>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13.828 10.172a4 4 0 010 5.656l-1.414 1.414a4 4 0 01-5.656-5.656l1.414-1.414m4.242-4.242l1.414-1.414a4 4 0 015.656 5.656l-1.414 1.414m-5.656 5.656l4.242-4.242"
                />
              </svg>
              <input
                value={url}
                disabled={loadingProduct}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onAddProduct()}
                placeholder="Paste Product URL..."
                className="w-full h-8 pl-10 pr-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-blue-500/60 focus:bg-white/[0.07] focus:ring-4 focus:ring-blue-500/10 disabled:opacity-50"
              />
            </div>

            <button
              onClick={onAddProduct}
              disabled={!url.trim() || loadingProduct}
              className="w-full h-11 rounded-xl bg-white text-slate-900 hover:bg-slate-100 active:bg-slate-200 font-semibold text-sm transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loadingProduct ? (
                <>
                  <LoadingSpinner size="sm" color="light" />
                  Adding product...
                </>
              ) : (
                "Add product"
              )}
            </button>
          </div>
        </div>

        <ProductList products={products} onRemoveProduct={onRemoveProduct} />
      </div>
    </aside>
  );
}
