import { Link } from "react-router";
import { Logo } from "../common/Logo";
import { LoadingSpinner } from "../common/LoadingSpinner";

// Shared shell for the login and signup pages: a dark brand panel on
// desktop and a centered form card.
export function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-dvh flex bg-[#f8fafc] text-slate-900">
      <aside className="hidden lg:flex w-[440px] shrink-0 flex-col justify-between bg-[#0b0f19] text-white p-10 relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-72 h-72 bg-blue-600/20 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-violet-600/15 blur-[100px] rounded-full" />

        <Link to="/" className="relative" aria-label="ProductIQ home">
          <Logo />
        </Link>

        <div className="relative">
          <p className="text-2xl font-bold tracking-tight leading-snug">
            Ask AI about any Amazon product, and compare them side by side.
          </p>
          <p className="mt-4 text-sm text-slate-400 leading-6">
            Paste a link, ask a question, and get a clear answer in seconds.
          </p>
        </div>

        <p className="relative text-xs text-slate-500">
          © {new Date().getFullYear()} ProductIQ
        </p>
      </aside>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        <Link to="/" className="lg:hidden mb-8" aria-label="ProductIQ home">
          <Logo size={36} tone="light" />
        </Link>

        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-slate-500">{subtitle}</p>

          <div className="mt-8">{children}</div>

          <p className="mt-6 text-sm text-slate-500 text-center">{footer}</p>
        </div>
      </main>
    </div>
  );
}

export function AuthField({ label, error, ...inputProps }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-slate-700">{label}</span>
      <input
        {...inputProps}
        aria-invalid={Boolean(error)}
        className={`mt-1.5 w-full h-11 rounded-xl border bg-white px-3.5 text-base sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:ring-4 ${
          error
            ? "border-red-300 focus:border-red-400 focus:ring-red-500/10"
            : "border-slate-200 focus:border-blue-400 focus:ring-blue-500/10"
        }`}
      />
      {error && (
        <span className="mt-1.5 block text-xs text-red-600">{error}</span>
      )}
    </label>
  );
}

export function AuthSubmitButton({ isSubmitting, children }) {
  return (
    <button
      type="submit"
      disabled={isSubmitting}
      className="w-full h-11 rounded-xl bg-slate-900 hover:bg-blue-600 text-white text-sm font-semibold flex items-center justify-center gap-2 transition disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {isSubmitting && <LoadingSpinner size="sm" color="white" />}
      {children}
    </button>
  );
}

export const authLinkClass =
  "font-semibold text-blue-600 hover:text-blue-700";

export function AuthFormError({ message }) {
  if (!message) return null;

  return (
    <p
      role="alert"
      className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700"
    >
      {message}
    </p>
  );
}
