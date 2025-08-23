import bcrypt from 'bcrypt';


/**
 * 
 * @param password 
 * @param rePassword
 * Step 1 : compare password and rePassword
 * Step 2 : If !isMatch return false
 * Step 3 : else return true
 * @returns true or false
 */
export const checkPassword = async (password: string, rePassword: string) => {
    try {
        const isMatch = await bcrypt.compare(password,rePassword);
        if (!isMatch)
            return false;
        else {
            return true;
        }
    } catch (error) {
        throw new Error(error);
    }
}