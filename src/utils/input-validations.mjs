import {ACCOUNT_TYPES, STATES} from './constants.mjs';


const validation = {
    // Number type validations
    number(varName=validation.isRequired('varName'),
           varVal=validation.isRequired('varVal'),
           canBeNegative=false) {
        if (varVal === undefined) {
            throw new TypeError(`${varName} must be provided.`);
        }
        if (typeof varVal !== 'number' || isNaN(varVal) || !isFinite(varVal)) {
            throw new TypeError(`${varName} must be a number.`);
        }
        if (varVal < 0 && (!canBeNegative)) {
            throw new RangeError(`${varName} cannot be a negative number.`);
        }
        return varVal;
    },

    // Boolean type validations
    boolean(varName=validation.isRequired('varName'),
            varVal=validation.isRequired('varVal')) {
        if (varVal === undefined) {
            throw new TypeError(`${varName} must be provided.`);
        }
        if (typeof varVal !== 'boolean') {
            throw new TypeError(`${varName} must be true or false.`);
        }
        return varVal;
    },
    booleanString(varName=validation.isRequired('varName'),
                  varVal=validation.isRequired('varVal')) {
        if (varVal === undefined) {
            throw new TypeError(`${varName} must be provided.`);
        }
        if (typeof varVal !== 'string') {
            throw new TypeError(`${varName} must be a string.`);
        }
        varVal = varVal.trim();
        if (!(varVal === 'true' || varVal === 'false')) {
            throw new TypeError(`Value of ${varName} must be either true or false.`);
        }
        return varVal === 'true';
    },

    // String type validations
    string(varName=validation.isRequired('varName'),
           varVal=validation.isRequired('varVal')) {
        if (varVal === undefined) {
            throw new TypeError(`${varName} must be provided.`);
        }
        if (typeof varVal !== 'string') {
            throw new TypeError(`${varName} must be a string.`);
        }
        if (varVal.trim() === '') {
            throw new RangeError(`${varName} can not be an empty string.`);
        }
        return varVal.trim();
    },
    email(emailVarName=validation.isRequired('emailVarName'),
          email=validation.isRequired('email')) {
        email = this.string(emailVarName, email);
        const regexEmailAddress = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i; // i -> case insensitive
        if (!regexEmailAddress.test(email)) {
            throw new RangeError(`${emailVarName} must be a properly formatted email address`);
        }
        return email.toLowerCase();
    },
    password(passwordVarName=validation.isRequired('passwordVarName'),
             password=validation.isRequired('password'), minLength=8) {
        if (/\s/.test(password)) {
            throw new RangeError(`${passwordVarName} cannot have whitespace characters.`);
        }
        const regexPassword  = /(?=.*[a-zA-Z])(?=.*\d)(?=.*[^0-9a-zA-Z\s])/;
        if (!regexPassword.test(password)) {
            throw new RangeError(`${passwordVarName} must include at least one special character, at least one number, and at least one letter.`);
        }
        password = this.string(passwordVarName, password);
        if (password.length < minLength) {
            throw new RangeError(`${passwordVarName} must be at least ${minLength} characters long.`);
        }
        return password;
    },
    comparePasswords(passwordAVarName=validation.isRequired('passwordAVarName'),
                     passwordA=validation.isRequired('passwordA'),
                     passwordBVarName=validation.isRequired('passwordBVarName'),
                     passwordB=validation.isRequired('passwordB')) {
        if (passwordA !== passwordB) {
            throw new Error(`${passwordAVarName} and ${passwordBVarName} must be equal.`);
        }
    },
    zip(zipVarName=validation.isRequired('zipVarName'),
        zip=validation.isRequired('zip')) {
        zip = this.string(zipVarName, zip);
        // If zip is not a string that contains 5 numbers, the method should throw. (only 5-digit zip but
        // represented as a string, because leading 0's are valid in zip codes, yet JS drops leading 0's)
        const regexZip = /^[0-9]{5}$/;
        if (!regexZip.test(zip)) {
            throw new RangeError(`${zipVarName} must have 5-digits.`);
        }
        return zip;
    },
    state(stateVarName=validation.isRequired('stateVarName'),
          state=validation.isRequired('state')) {
        state = this.string(stateVarName, state);
        state = state.toUpperCase();
        if(!STATES.includes(state)) {
            throw new RangeError(`${stateVarName} must be a two-letter state abbreviation, such as "NY" or "NJ"`);
        }
        return state;
    },
    userType(userTypeVarName=validation.isRequired('varName'),
           userType=validation.isRequired('varVal')) {
        userType = this.string(userType);
        if(!Object.values(ACCOUNT_TYPES).includes(userType)) {
            throw new RangeError(`${userTypeVarName} must be either ${ACCOUNT_TYPES.BOAT_RENTER} or ${ACCOUNT_TYPES.BOAT_OWNER}`);
        }
        return userType.trim();
    },
    /**
     *
     * @param varName
     * @return {*}
     */
    isRequired: (varName) => {
        throw new TypeError(`${varName} is required`)
    },
};
export default validation;