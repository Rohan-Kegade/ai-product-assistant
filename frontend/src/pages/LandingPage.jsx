import { Link } from "react-router";
import { Logo, LogoMark } from "../components/common/Logo";

const FEATURES = [
  {
    title: "Paste a link, get the details",
    description:
      "Drop in any Amazon product URL. ProductIQ fetches the title, price, specs and reviews for you.",
    icon: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1",
  },
  {
    title: "Ask anything",
    description:
      "Is it worth the price? What do reviewers complain about? Get clear answers in seconds.",
    icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z",
  },
  {
    title: "Compare side by side",
    description:
      "Add several products to one conversation and let AI break down the differences, in a table if you like.",
    icon: "M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2",
  },
];

const STEPS = [
  { title: "Add products", description: "Paste one or more Amazon links." },
  { title: "Ask a question", description: "Or pick a suggested prompt." },
  { title: "Decide", description: "Buy with confidence." },
];

function Icon({ d, className = "w-5 h-5" }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={d} />
    </svg>
  );
}

// A static mock of the chat screen for the hero section.
function ChatPreview() {
  return (
    <div className="relative">
      <div className="absolute -inset-6 bg-gradient-to-br from-blue-500/20 to-violet-500/20 blur-3xl rounded-full" />
      <div className="relative rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 overflow-hidden">
        <div className="h-10 border-b border-slate-100 flex items-center gap-1.5 px-4">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
          <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
          <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
        </div>

        <div className="flex gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50/60">
          {["Wireless Earbuds Pro", "SoundMax Buds 2"].map((name) => (
            <div
              key={name}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5"
            >
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-slate-200 to-slate-100" />
              <span className="text-[11px] font-medium text-slate-700 truncate">
                {name}
              </span>
            </div>
          ))}
        </div>

        <div className="space-y-4 p-4 text-xs">
          <div className="flex justify-end">
            <div className="rounded-2xl rounded-tr-sm bg-slate-900 text-white px-3.5 py-2">
              Which one is better value?
            </div>
          </div>
          <div className="flex gap-2.5">
            <LogoMark size={28} />
            <div className="rounded-2xl rounded-tl-sm border border-slate-200 bg-white px-3.5 py-2.5 text-slate-700 leading-5 space-y-1.5">
              <p>
                <span className="font-semibold text-slate-900">
                  SoundMax Buds 2
                </span>{" "}
                is the better value: similar sound quality and battery life
                at a lower price.
              </p>
              <p className="text-slate-500">
                Pick Earbuds Pro if noise cancellation matters most.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto h-16 px-4 md:px-8 flex items-center justify-between">
          <Link to="/" aria-label="ProductIQ home">
            <Logo size={34} tone="light" />
          </Link>
          <nav className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-3.5 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="px-3.5 py-2 rounded-xl text-sm font-semibold bg-slate-900 hover:bg-blue-600 text-white transition"
            >
              Sign up
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full" />
          <div className="absolute top-20 -right-40 w-96 h-96 bg-violet-500/10 blur-[120px] rounded-full" />

          <div className="relative max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-24 grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                AI shopping assistant
              </span>
              <h1 className="mt-5 text-4xl md:text-5xl font-bold tracking-tight leading-[1.1]">
                Shop smarter with{" "}
                <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                  AI answers
                </span>{" "}
                about any product
              </h1>
              <p className="mt-5 text-base text-slate-600 leading-7 max-w-lg">
                Paste an Amazon link, ask a question, and get a clear answer.
                Compare products side by side without reading hundreds of
                reviews.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold bg-slate-900 hover:bg-blue-600 text-white transition shadow-sm"
                >
                  Get started free
                  <Icon d="M5 12h14m-6-6l6 6-6 6" className="w-4 h-4" />
                </Link>
                <Link
                  to="/login"
                  className="px-5 py-3 rounded-xl text-sm font-semibold border border-slate-200 bg-white hover:border-blue-300 hover:text-blue-600 text-slate-800 transition shadow-xs"
                >
                  I have an account
                </Link>
              </div>
            </div>

            <ChatPreview />
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 md:px-8 py-16">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-center">
            Everything you need to decide
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {FEATURES.map(({ title, description, icon }) => (
              <div
                key={title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 text-white flex items-center justify-center">
                  <Icon d={icon} />
                </div>
                <h3 className="mt-4 text-sm font-bold">{title}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-6">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 md:px-8 py-16">
          <div className="rounded-3xl bg-[#0b0f19] text-white px-6 py-12 md:px-12 relative overflow-hidden">
            <div className="absolute -top-24 -left-24 w-72 h-72 bg-blue-600/20 blur-[100px] rounded-full" />
            <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-violet-600/20 blur-[100px] rounded-full" />

            <div className="relative">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                How it works
              </h2>
              <ol className="mt-8 grid gap-6 md:grid-cols-3">
                {STEPS.map(({ title, description }, index) => (
                  <li key={title} className="flex gap-4">
                    <span className="w-9 h-9 shrink-0 rounded-full border border-white/15 bg-white/[0.06] flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold">{title}</h3>
                      <p className="mt-1 text-sm text-slate-400">
                        {description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
              <Link
                to="/signup"
                className="mt-10 inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold bg-white text-slate-900 hover:bg-blue-50 transition"
              >
                Create your account
                <Icon d="M5 12h14m-6-6l6 6-6 6" className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200/70">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <Logo size={24} tone="light" />
          <p>© {new Date().getFullYear()} ProductIQ</p>
        </div>
      </footer>
    </div>
  );
}
