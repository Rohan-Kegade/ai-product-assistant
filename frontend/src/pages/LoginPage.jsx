import { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  AuthField,
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
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    // The backend has no auth endpoints yet, so a valid form goes straight
    // into the app.
    setIsSubmitting(true);
    navigate("/app");
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
