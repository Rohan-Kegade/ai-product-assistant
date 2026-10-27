import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { api } from "../../services/api";
import { LoadingSpinner } from "../common/LoadingSpinner";

const MIN_PASSWORD_LENGTH = 8;

const pathProps = {
  strokeLinecap: "round",
  strokeLinejoin: "round",
  strokeWidth: 2,
};

const SECTIONS = [
  {
    id: "profile",
    label: "Profile",
    icon: <path {...pathProps} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
  },
  {
    id: "password",
    label: "Password",
    icon: <path {...pathProps} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />,
  },
  {
    id: "products",
    label: "My products",
    icon: <path {...pathProps} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />,
  },
  {
    id: "delete",
    label: "Delete account",
    danger: true,
    icon: <path {...pathProps} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />,
  },
];

function formatDate(value) {
  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function Icon({ className = "w-4 h-4", children }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {children}
    </svg>
  );
}

function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-bold text-slate-900">{title}</h3>
      <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
    </div>
  );
}

function Field({ label, hint, error, trailing, ...inputProps }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-slate-700">{label}</span>
      <span className="relative mt-1.5 block">
        <input
          {...inputProps}
          aria-invalid={Boolean(error)}
          className={`w-full h-10 rounded-lg border px-3 text-base sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:ring-4 disabled:bg-slate-50 disabled:text-slate-500 ${
            trailing ? "pr-10" : ""
          } ${
            error
              ? "border-red-300 focus:border-red-400 focus:ring-red-500/10"
              : "border-slate-200 focus:border-blue-400 focus:ring-blue-500/10"
          }`}
        />
        {trailing && (
          <span className="absolute inset-y-0 right-3 flex items-center text-slate-400">
            {trailing}
          </span>
        )}
      </span>
      {error ? (
        <span className="mt-1.5 block text-xs text-red-600">{error}</span>
      ) : (
        hint && <span className="mt-1.5 block text-xs text-slate-400">{hint}</span>
      )}
    </label>
  );
}

function SubmitButton({ isSubmitting, disabled, danger, children }) {
  return (
    <button
      type="submit"
      disabled={isSubmitting || disabled}
      className={`h-10 px-4 rounded-lg text-white text-xs font-semibold flex items-center gap-2 transition disabled:opacity-40 disabled:cursor-not-allowed ${
        danger ? "bg-red-600 hover:bg-red-700" : "bg-slate-900 hover:bg-blue-600"
      }`}
    >
      {isSubmitting && <LoadingSpinner size="sm" color="white" />}
      {children}
    </button>
  );
}

function StatusMessage({ status }) {
  if (!status) return null;

  return (
    <p
      role={status.type === "error" ? "alert" : "status"}
      className={`rounded-lg border px-3 py-2 text-xs font-medium ${
        status.type === "error"
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-700"
      }`}
    >
      {status.message}
    </p>
  );
}

function ProfileSection() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user.name);
  const [status, setStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const trimmed = name.trim();
  const unchanged = trimmed === user.name;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting || unchanged) return;

    if (!trimmed) {
      setStatus({ type: "error", message: "Name is required." });
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    try {
      await updateProfile({ name: trimmed });
      setName(trimmed);
      setStatus({ type: "success", message: "Profile updated." });
    } catch (err) {
      setStatus({ type: "error", message: err.message || "Failed to update profile." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <SectionHeader title="Profile" subtitle="Your name and the email you log in with." />

      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 shrink-0 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-base font-bold uppercase">
          {user.name[0]}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
          {user.createdAt && (
            <p className="text-xs text-slate-400">
              Member since {formatDate(user.createdAt)}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <Field
          label="Name"
          autoComplete="name"
          maxLength={100}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setStatus(null);
          }}
        />
        <Field
          label="Email"
          type="email"
          value={user.email}
          disabled
          hint="Your email can't be changed."
          trailing={
            <Icon>
              <path {...pathProps} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </Icon>
          }
        />
        <StatusMessage status={status} />
        <div className="flex justify-end">
          <SubmitButton isSubmitting={isSubmitting} disabled={unchanged}>
            Save changes
          </SubmitButton>
        </div>
      </div>
    </form>
  );
}

const EMPTY_PASSWORDS = { currentPassword: "", newPassword: "", confirmPassword: "" };

function validatePasswords({ currentPassword, newPassword, confirmPassword }) {
  const errors = {};
  if (!currentPassword) errors.currentPassword = "Enter your current password.";
  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    errors.newPassword = `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (confirmPassword !== newPassword) errors.confirmPassword = "Passwords don't match.";
  return errors;
}

function PasswordSection() {
  const [form, setForm] = useState(EMPTY_PASSWORDS);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setStatus(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    const nextErrors = validatePasswords(form);
    setErrors(nextErrors);
    setStatus(null);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);

    try {
      await api.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setForm(EMPTY_PASSWORDS);
      setStatus({ type: "success", message: "Password changed." });
    } catch (err) {
      setStatus({ type: "error", message: err.message || "Failed to change password." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <SectionHeader
        title="Password"
        subtitle="Change the password you use to log in."
      />
      <div className="space-y-4">
        <Field
          label="Current password"
          type="password"
          autoComplete="current-password"
          value={form.currentPassword}
          onChange={updateField("currentPassword")}
          error={errors.currentPassword}
        />
        <Field
          label="New password"
          type="password"
          autoComplete="new-password"
          value={form.newPassword}
          onChange={updateField("newPassword")}
          error={errors.newPassword}
          hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
        />
        <Field
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          value={form.confirmPassword}
          onChange={updateField("confirmPassword")}
          error={errors.confirmPassword}
        />
        <StatusMessage status={status} />
        <div className="flex justify-end">
          <SubmitButton isSubmitting={isSubmitting}>Update password</SubmitButton>
        </div>
      </div>
    </form>
  );
}

function ProductsSection({ onProductsChanged }) {
  const [products, setProducts] = useState(null);
  const [error, setError] = useState(null);
  const [removingIds, setRemovingIds] = useState([]);
  // Two-step remove, like conversation delete in the sidebar.
  const [confirmingId, setConfirmingId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    api
      .listMyProducts()
      .then((list) => !cancelled && setProducts(list))
      .catch((err) => {
        if (cancelled) return;
        setProducts([]);
        setError(err.message || "Failed to load products.");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const removeProduct = async (id) => {
    setConfirmingId(null);
    setError(null);
    setRemovingIds((prev) => [...prev, id]);

    try {
      await api.removeMyProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      onProductsChanged();
    } catch (err) {
      setError(err.message || "Failed to remove product.");
    } finally {
      setRemovingIds((prev) => prev.filter((pid) => pid !== id));
    }
  };

  return (
    <div>
      <SectionHeader
        title="My products"
        subtitle="Every product you've added to a conversation. Removing one takes it out of all your conversations."
      />

      {error && (
        <div className="mb-4">
          <StatusMessage status={{ type: "error", message: error }} />
        </div>
      )}

      {products === null ? (
        <div className="space-y-2" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-14 rounded-lg bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">
          You haven't added any products yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {products.map((product) => {
            const title = product.title || "Amazon Product";
            const removing = removingIds.includes(product.id);
            const confirming = confirmingId === product.id;

            return (
              <li
                key={product.id}
                className={`flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5 transition ${
                  removing ? "opacity-50" : ""
                }`}
              >
                <div className="min-w-0 flex-1">
                  {product.url ? (
                    <a
                      href={product.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={title}
                      className="block truncate text-xs font-semibold text-slate-800 hover:text-blue-600 transition"
                    >
                      {title}
                    </a>
                  ) : (
                    <p title={title} className="truncate text-xs font-semibold text-slate-800">
                      {title}
                    </p>
                  )}
                  <p className="mt-0.5 text-[11px] text-slate-400 truncate">
                    {[
                      product.price,
                      product.rating && `${product.rating.replace(" out of 5 stars", "")}★`,
                      `In ${product.conversationCount} ${
                        product.conversationCount === 1 ? "conversation" : "conversations"
                      }`,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>

                {confirming ? (
                  <div className="flex items-center gap-2 shrink-0 text-[11px] font-semibold">
                    <button
                      onClick={() => removeProduct(product.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                    <button
                      onClick={() => setConfirmingId(null)}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmingId(product.id)}
                    disabled={removing}
                    aria-label={`Remove ${title}`}
                    title="Remove from all conversations"
                    className="w-8 h-8 shrink-0 rounded-md flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition disabled:cursor-not-allowed"
                  >
                    {removing ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <Icon>
                        <path {...pathProps} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </Icon>
                    )}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function DeleteAccountSection() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canDelete = password && confirmText === "DELETE";

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting || !canDelete) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await api.deleteAccount({ password });
      // Leave the protected page first, so the route guard doesn't bounce to
      // /login, then clear the local session.
      navigate("/", { replace: true });
      logout();
    } catch (err) {
      setError(err.message || "Failed to delete account.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <SectionHeader
        title="Delete account"
        subtitle="Permanently delete your account and all of your conversations."
      />

      <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700 leading-5">
        This can't be undone. Your conversations, messages and product lists
        will be deleted, and you'll be logged out.
      </div>

      <div className="space-y-4">
        <Field
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError(null);
          }}
        />
        <Field
          label='Type "DELETE" to confirm'
          autoComplete="off"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
        />
        <StatusMessage status={error && { type: "error", message: error }} />
        <div className="flex justify-end">
          <SubmitButton isSubmitting={isSubmitting} disabled={!canDelete} danger>
            Delete my account
          </SubmitButton>
        </div>
      </div>
    </form>
  );
}

export function SettingsModal({ onClose, onProductsChanged }) {
  const [activeSection, setActiveSection] = useState("profile");

  useEffect(() => {
    const onKeyDown = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKeyDown);

    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-[2px] sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        className="w-full sm:max-w-3xl h-[90dvh] sm:h-[600px] sm:max-h-[90dvh] flex flex-col rounded-t-2xl sm:rounded-2xl bg-white text-slate-900 shadow-2xl overflow-hidden"
      >
        <header className="h-14 shrink-0 flex items-center justify-between border-b border-slate-200 px-5">
          <h2 id="settings-title" className="text-sm font-bold">
            Settings
          </h2>
          <button
            onClick={onClose}
            aria-label="Close settings"
            className="w-9 h-9 -mr-2 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <Icon className="w-5 h-5">
              <path {...pathProps} d="M6 18L18 6M6 6l12 12" />
            </Icon>
          </button>
        </header>

        <div className="flex-1 min-h-0 flex flex-col sm:flex-row">
          <nav className="shrink-0 sm:w-52 border-b sm:border-b-0 sm:border-r border-slate-200 bg-slate-50/60 p-2 sm:p-3 flex sm:flex-col gap-1 overflow-x-auto [scrollbar-width:none]">
            {SECTIONS.map((section) => {
              const isActive = section.id === activeSection;

              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  aria-current={isActive ? "page" : undefined}
                  className={`shrink-0 flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                    isActive
                      ? "bg-white shadow-sm border border-slate-200"
                      : "border border-transparent hover:bg-white/80"
                  } ${
                    section.danger
                      ? "text-red-600"
                      : isActive
                        ? "text-blue-600"
                        : "text-slate-600"
                  }`}
                >
                  <Icon>{section.icon}</Icon>
                  {section.label}
                </button>
              );
            })}
          </nav>

          <section className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6">
            {activeSection === "profile" && <ProfileSection />}
            {activeSection === "password" && <PasswordSection />}
            {activeSection === "products" && (
              <ProductsSection onProductsChanged={onProductsChanged} />
            )}
            {activeSection === "delete" && <DeleteAccountSection />}
          </section>
        </div>
      </div>
    </div>
  );
}
