import argon2 from "argon2";
export const encryptPassword = async (password) => {
    // Implement your password encryption logic here
    // For example, you can use bcrypt or any other hashing library
    const hashedPassword = await argon2.hash(password);
    return hashedPassword;
};
export const verifyPassword = async (hashedPassword, plainPassword) => {
    return await argon2.verify(hashedPassword, plainPassword);
};
//# sourceMappingURL=password.js.map