import { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  AuthField,
  AuthLayout,
  AuthSubmitButton,
  authLinkClass,
} from "../components/auth/AuthLayout";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

function validate({ name, email, password, confirmPassword }) {
  const errors = {};
  if (!name.trim()) errors.name = "Enter your name.";
  if (!EMAIL_PATTERN.test(email.trim())) errors.email = "Enter a valid email.";
  if (password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (confirmPassword !== password) {
    errors.confirmPassword = "Passwords don't match.";
  }
  return errors;
}

export function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
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
      title="Create your account"
      subtitle="Start asking AI about the products you're considering."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className={authLinkClass}>
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <AuthField
          label="Name"
          autoComplete="name"
          placeholder="Your name"
          value={form.name}
          onChange={updateField("name")}
          error={errors.name}
        />
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
          autoComplete="new-password"
          placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
          value={form.password}
          onChange={updateField("password")}
          error={errors.password}
        />
        <AuthField
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          placeholder="Repeat your password"
          value={form.confirmPassword}
          onChange={updateField("confirmPassword")}
          error={errors.confirmPassword}
        />
        <AuthSubmitButton isSubmitting={isSubmitting}>
          Create account
        </AuthSubmitButton>
      </form>
    </AuthLayout>
  );
}
