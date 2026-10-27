// Shared by signup and the account settings endpoints. Each returns an error
// message, or null when the value is valid.

const MAX_NAME_LENGTH = 100;
const MIN_PASSWORD_LENGTH = 8;
// bcrypt ignores everything past 72 bytes.
const MAX_PASSWORD_BYTES = 72;

export function validateName(name) {
  if (typeof name !== "string" || !name.trim()) return "Name is required.";
  if (name.trim().length > MAX_NAME_LENGTH) {
    return `Name must be at most ${MAX_NAME_LENGTH} characters.`;
  }

  return null;
}

export function validatePassword(password) {
  if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (Buffer.byteLength(password) > MAX_PASSWORD_BYTES) {
    return "Password is too long.";
  }

  return null;
}
