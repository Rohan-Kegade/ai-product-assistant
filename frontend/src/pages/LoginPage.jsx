import { useState } from "react";
import { Link } from "react-router";
import { useAuth } from "../hooks/useAuth";
import {
  AuthField,
  AuthFormError,
  AuthLayout,
  AuthSubmitButton,
  authLinkClass,
} from "../components/auth/AuthLayout";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate({ email, password }) {
  const errors = {};
  if (!EMAIL_PATTERN.test(email.trim())) errors.email = "Enter a valid email.";
  if (!password) errors.password = "Enter your password.";
  return errors;
}

export function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  // On success the route guard moves the now logged-in user into the app.
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    const nextErrors = validate(form);
    setErrors(nextErrors);
    setSubmitError(null);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);

    try {
      await login({ email: form.email, password: form.password });
    } catch (err) {
      setSubmitError(err.message || "Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to continue to your conversations."
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/signup" className={authLinkClass}>
            Sign up
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <AuthFormError message={submitError} />
        <AuthField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={updateField("email")}
          error={errors.email}
        />
        <AuthField
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="Your password"
          value={form.password}
          onChange={updateField("password")}
          error={errors.password}
        />
        <AuthSubmitButton isSubmitting={isSubmitting}>Log in</AuthSubmitButton>
      </form>
    </AuthLayout>
  );
}
