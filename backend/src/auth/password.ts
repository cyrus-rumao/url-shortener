import argon2 from "argon2";
export const encryptPassword = async (password: string): Promise<string> => {
  // Implement your password encryption logic here
  // For example, you can use bcrypt or any other hashing library
  const hashedPassword = await argon2.hash(password);
  return hashedPassword;
};

export const verifyPassword = async (
  hashedPassword: string,
  plainPassword: string,
): Promise<boolean> => {
  return await argon2.verify(hashedPassword, plainPassword);
};
