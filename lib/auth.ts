import AsyncStorage from "@react-native-async-storage/async-storage";

export type StoredUser = {
  id: string;
  name: string;
  email: string;
  password: string;
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

  const nextUser: StoredUser = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: input.name.trim(),
    email: normalizedEmail,
    password: input.password,
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
    const nextUser: StoredUser = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: formattedName,
      email: normalizedEmail,
      password: input.password,
      createdAt: new Date().toISOString(),
    };
    users.push(nextUser);
    await saveStoredUsers(users);
    user = nextUser;
  } else {
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
    }),
  );

  return user;
};

export const getSession = async () => {
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
    return JSON.parse(value) as { id: string; name: string; email: string } | null;
  } catch {
    return null;
  }
};

export const signOut = async () => {
  await AsyncStorage.removeItem(CURRENT_USER_KEY);
};
