import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../db/data-source.js";
import { User } from "../db/entities/User.js";

const userRepository = () => AppDataSource.getRepository(User);

const BCRYPT_ROUNDS = 12;
const TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

export const AUTH_COOKIE_NAME = "token";

export const authCookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

// Compared against when the email is unknown, so a login takes as long
// whether or not the account exists.
const DUMMY_PASSWORD_HASH = bcrypt.hashSync("not-a-real-password", BCRYPT_ROUNDS);

function jwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) throw new Error("JWT_SECRET is not set");

  return secret;
}

export function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

export function toPublicUser({ id, name, email, createdAt }) {
  return { id, name, email, createdAt };
}

export async function findUserById(userId) {
  return userRepository().findOneBy({ id: userId });
}

export async function findUserByEmail(email) {
  return userRepository().findOneBy({ email: normalizeEmail(email) });
}

export async function createUser({ name, email, password }) {
  const user = userRepository().create({
    name: name.trim(),
    email: normalizeEmail(email),
    passwordHash: await bcrypt.hash(password, BCRYPT_ROUNDS),
  });

  return userRepository().save(user);
}

export async function updateUserName(userId, name) {
  await userRepository().update({ id: userId }, { name: name.trim() });

  return findUserById(userId);
}

export async function updateUserPassword(userId, password) {
  await userRepository().update(
    { id: userId },
    { passwordHash: await bcrypt.hash(password, BCRYPT_ROUNDS) },
  );
}

// FKs cascade: removes the user's conversations, their messages and product
// links. Scraped products are shared, so they are kept.
export async function deleteUser(userId) {
  await userRepository().delete({ id: userId });
}

export async function passwordMatches(user, password) {
  return bcrypt.compare(password, user.passwordHash);
}

// Resolves to the user when the credentials match, otherwise null.
export async function verifyCredentials(email, password) {
  const user = await findUserByEmail(email);
  const matches = await bcrypt.compare(
    password,
    user?.passwordHash ?? DUMMY_PASSWORD_HASH,
  );

  return user && matches ? user : null;
}

export function signToken(userId) {
  return jwt.sign({ sub: userId }, jwtSecret(), {
    expiresIn: TOKEN_TTL_SECONDS,
  });
}

// Resolves to the token's user id, or null if it is missing, expired or forged.
export function verifyToken(token) {
  try {
    return jwt.verify(token, jwtSecret()).sub ?? null;
  } catch {
    return null;
  }
}

export function setAuthCookie(res, userId) {
  res.cookie(AUTH_COOKIE_NAME, signToken(userId), {
    ...authCookieOptions,
    maxAge: TOKEN_TTL_SECONDS * 1000,
  });
}

export function clearAuthCookie(res) {
  res.clearCookie(AUTH_COOKIE_NAME, authCookieOptions);
}
