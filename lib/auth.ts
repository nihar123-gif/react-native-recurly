import AsyncStorage from "@react-native-async-storage/async-storage";

export type StoredUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
};

const USERS_KEY = "recurly_users";
const SESSION_KEY = "recurly_session";

export const getStoredUsers = async (): Promise<StoredUser[]> => {
  const value = await AsyncStorage.getItem(USERS_KEY);

  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as StoredUser[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
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

  return nextUser;
};

export const signInUser = async (input: { email: string; password: string }) => {
  const users = await getStoredUsers();
  const normalizedEmail = input.email.trim().toLowerCase();

  const user = users.find(
    (item) => item.email.trim().toLowerCase() === normalizedEmail,
  );

  if (!user) {
    throw new Error("No account found with this email.");
  }

  if (user.password !== input.password) {
    throw new Error("Incorrect password. Please try again.");
  }

  await AsyncStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email,
    }),
  );

  return user;
};

export const getSession = async () => {
  const value = await AsyncStorage.getItem(SESSION_KEY);

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
  await AsyncStorage.removeItem(SESSION_KEY);
};
