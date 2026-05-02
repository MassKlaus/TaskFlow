import bcrypt from 'bcryptjs';
import user from "../db/user.js";

/**
 * 
 * @param {string} email s
 * @param {string} password 
 * @param {string} fullName 
 * @returns {object} user object if all goes well | throws error if email exists
 */
export async function createUser(email, password, fullName) {
    //bcryptjs is already part of nodejs
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt);


    const newUser = new user({ email, passwordHash, fullName });
    return await newUser.save();
}

export async function updateUser(userId, email, fullName) {
    const existingUser = await user.findById(userId);

    if (!existingUser) {
        throw new Error("User not found");
    }

    existingUser.email = email || existingUser.email;
    existingUser.fullName = fullName || existingUser.fullName;
    existingUser.updatedAt = Date.now();

    return await existingUser.save();
}
/**
 * 
 * @param {string} email 
 * @returns {object | null} user object if found, null if not found
 */
export async function getUserByEmail(email) {
    return await user.findOne({ email });
}

/**
 * 
 * @param {string} email 
 * @param {string} password 
 * @returns {object | false} false if invalid user, user object if valid user 
 */
export async function checkUserPasswordByEmail(email, password) {
    const user = await getUserByEmail(email);

    if (!user) {
        return false;
    }

    if (await bcrypt.compare(password, user.passwordHash)) {
        return user;
    }

    return false;
}

