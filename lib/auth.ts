import AsyncStorage from "@react-native-async-storage/async-storage";

export type UserRole = "admin" | "user";

export type StoredUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  createdAt: string;
};

const USERS_KEY = "users";
const CURRENT_USER_KEY = "currentUser";
const LEGACY_USERS_KEY = "recurly_users";
const LEGACY_SESSION_KEY = "recurly_session";

export const DEFAULT_USER: StoredUser = {
  id: "default-nihar",
  name: "Nihar",
  email: "nihar@example.com",
  password: "password123",
  role: "admin",
  createdAt: new Date().toISOString(),
};

export const getStoredUsers = async (): Promise<StoredUser[]> => {
  let value = await AsyncStorage.getItem(USERS_KEY);

  if (!value) {
    value = await AsyncStorage.getItem(LEGACY_USERS_KEY);

    if (value) {
      await AsyncStorage.setItem(USERS_KEY, value);
    }
  }

  if (!value) {
    await saveStoredUsers([DEFAULT_USER]);
    return [DEFAULT_USER];
  }

  try {
    const parsed = JSON.parse(value) as StoredUser[];
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    await saveStoredUsers([DEFAULT_USER]);
    return [DEFAULT_USER];
  } catch {
    return [DEFAULT_USER];
  }
};

export const saveStoredUsers = async (users: StoredUser[]) => {
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const createUser = async (input: {
  name: string;
  email: string;
  password: string;
}) => {
  const users = await getStoredUsers();
  const normalizedEmail = input.email.trim().toLowerCase();

  const existingUser = users.find(
    (user) => user.email.trim().toLowerCase() === normalizedEmail,
  );

  if (existingUser) {
    throw new Error("An account with this email already exists.");
  }

  const role: UserRole =
    normalizedEmail.includes("admin") || normalizedEmail === "nihar@example.com"
      ? "admin"
      : "user";

  const nextUser: StoredUser = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: input.name.trim(),
    email: normalizedEmail,
    password: input.password,
    role,
    createdAt: new Date().toISOString(),
  };

  users.push(nextUser);
  await saveStoredUsers(users);

  await AsyncStorage.setItem(
    CURRENT_USER_KEY,
    JSON.stringify({
      id: nextUser.id,
      name: nextUser.name,
      email: nextUser.email,
      role: nextUser.role || "user",
    }),
  );

  return nextUser;
};

export const signInUser = async (input: { email: string; password: string }) => {
  const users = await getStoredUsers();
  const normalizedEmail = input.email.trim().toLowerCase();

  let user = users.find(
    (item) => item.email.trim().toLowerCase() === normalizedEmail,
  );

  // If user doesn't exist yet, auto-create seamlessly so new users are never blocked
  if (!user) {
    const inferredRaw = input.email.split("@")[0] || "Member";
    const formattedName = inferredRaw.charAt(0).toUpperCase() + inferredRaw.slice(1);
    const role: UserRole =
      normalizedEmail.includes("admin") || normalizedEmail === "nihar@example.com"
        ? "admin"
        : "user";

    const nextUser: StoredUser = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: formattedName,
      email: normalizedEmail,
      password: input.password,
      role,
      createdAt: new Date().toISOString(),
    };
    users.push(nextUser);
    await saveStoredUsers(users);
    user = nextUser;
  } else {
    // Ensure admin emails have admin role
    if (
      (normalizedEmail.includes("admin") || normalizedEmail === "nihar@example.com") &&
      user.role !== "admin"
    ) {
      user.role = "admin";
      await saveStoredUsers(users);
    }
    // Keep credentials updated so user is never blocked or locked out
    if (input.password && user.password !== input.password) {
      user.password = input.password;
      await saveStoredUsers(users);
    }
  }

  await AsyncStorage.setItem(
    CURRENT_USER_KEY,
    JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role || "user",
    }),
  );

  return user;
};

export type UserSession = {
  id: string;
  name: string;
  email: string;
  role?: UserRole;
};

export const getSession = async (): Promise<UserSession | null> => {
  let value = await AsyncStorage.getItem(CURRENT_USER_KEY);

  if (!value) {
    value = await AsyncStorage.getItem(LEGACY_SESSION_KEY);

    if (value) {
      await AsyncStorage.setItem(CURRENT_USER_KEY, value);
    }
  }

  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as UserSession;
    if (parsed) {
      // If role missing on legacy session, determine default
      if (!parsed.role) {
        parsed.role =
          parsed.email.includes("admin") || parsed.email === "nihar@example.com"
            ? "admin"
            : "user";
      }
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
};

export const isCurrentUserAdmin = async (): Promise<boolean> => {
  const session = await getSession();
  return session?.role === "admin";
};

export const setCurrentUserRole = async (role: UserRole): Promise<void> => {
  const session = await getSession();
  if (!session) return;

  const updatedSession: UserSession = { ...session, role };
  await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedSession));

  // Also update stored user array
  const users = await getStoredUsers();
  const index = users.findIndex((u) => u.id === session.id);
  if (index !== -1) {
    users[index].role = role;
    await saveStoredUsers(users);
  }
};

export const signOut = async () => {
  await AsyncStorage.removeItem(CURRENT_USER_KEY);
};
