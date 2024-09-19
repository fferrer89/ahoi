/**
 * Tagged template literal function for coercing certain values to what we would expected for a more JSX-like syntax.
 * Function used to construct HTML dynamically based on data.
 *
 * SEE EXAMPLE BELOW at the end of this module.
 *
 * For values that we don't want to coerce, we just skip outputting them
 * Example:
 *   `class="${variable}"`
 * If the value of my variable was one of these types I don't want JavaScript to coerce, then I'd get this:
 *   'class=""'
 *
 * @see: https://blog.jim-nielsen.com/2019/jsx-like-syntax-for-tagged-template-literals
 *
 * const name = 'kiko';
 * const firstName = 'John';
 * const lastName = 'Rush';
 * html`Hello ${name}. My name is ${firstName} ${lastName}`
 *
 * @param strings an array of string values. ['Hello', '. My name is']
 * @param values an array of the variable's values passed. ['kiko', 'John', 'Rush']
 * @return {string}
 */
export default function html(strings, ...values) {
    let out = "";
    strings.forEach((string, i) => {
        const value = values[i];
        if (Array.isArray(value)) {
            // Array – Join to string and output with value. ONLY array of strings are allowed (array of objects or other complex structues are not allowed)
            out += string + value.join("");
        } else if (typeof value === 'object' &&  value !== null && !Array.isArray(value)) {
            // Object – Handle as HTML attribute (key-value pairs)
            const attributes = Object.entries(value)
                .map(([key, val]) => `${key}="${val}"`)
                .join(" ");
            out += string + `${attributes}`;
        } else if (typeof value === "string") {
            // String – Output with value
            out += string + value;
        } else if (typeof value === "number" && !isNaN(value) && isFinite(value)) {
            // Number – Coerce to string and output with value
            out += string + String(value);
        } else if (typeof value === "boolean") {
            out += string; // TODO: Newly added. Verify that it is correct for boolean values
        } else {
            // undefined, null, boolean?, NaN, Infinity, or function – Don't output a value.
            out += string;
            if (value !== undefined) {
                console.warn(`Cannot construct HTML from undefined, null, boolean?, NaN, Infinity, or function (${typeof value})`);
            }
        }
    });
    return out;
}