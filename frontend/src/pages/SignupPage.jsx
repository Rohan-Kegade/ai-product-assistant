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
  const { signup } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
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
      await signup({
        name: form.name,
        email: form.email,
        password: form.password,
      });
    } catch (err) {
      setSubmitError(err.message || "Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
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
        <AuthFormError message={submitError} />
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
