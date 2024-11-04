import html from "../../utils/html.mjs";
/**
 *
 * @param props
 * @param children
 * @return {string|*}
 * @constructor
 */
export default function Signup(props, children) {
    return (
        html`<main id="signup">
                <section data-layout-variant="hero">
                    <form action="/signup" method="post">
                        <header>
                            <a href="/login">
                                <h4>Log In</h4>
                            </a>
                            <a href="/signup" aria-selected="true">
                                <h4>Sign Up</h4>
                            </a>
                        </header>
                        <ul>
                            <li>
                                <output name="generalErrorMsg">${props?.errorMessages?.generalErrorMsg}</output>
                            </li>
                            <li>
                                <fieldset name="userTypeToggle">
                                    <input type="radio" name="userType" value="Boat Renter" required
                                           ${!props?.values?.userType && 'checked'}
                                           ${props?.values?.userType === 'Boat Renter' && 'checked'}
                                           aria-label="Boat Renter">
                                    <input type="radio" name="userType" value="Boat Owner" required
                                           ${props?.values?.userType === 'Boat Owner' && 'checked'}
                                           aria-label="Boat Owner">
                                </fieldset>
                            </li>
                            <li>
                                <input type="text" name="email" id="email" placeholder="Email"
                                       autocomplete="email" aria-label="Email" required
                                       ${props?.errorMessages?.email && 'autofocus'} value=${props?.values?.email} >
                                <output for="email" name="emailErrorMsg">${props?.errorMessages?.email}</output>
                            </li>
                            <li>
                                <input type="text" name="username" id="username" placeholder="Username"
                                       autocomplete="username" aria-label="Username" required minlength="1"
                                       value=${props?.values?.username}>
                                <output for="username" name="usernameErrorMsg">${props?.errorMessages?.username}</output>
                            </li>
                            <li>
                                <input type="password" name="password"  id="password" placeholder="Password" 
                                       autocomplete="new-password" aria-label="Password" required minlength="8">
                                <button type="button" class="hide-show-toggle-pw"></button>
                                <output for="password" name="passwordErrorMsg">${props?.errorMessages?.password}</output>
                            </li>
                            <li>
                                <button type="submit">Register</button>
                            </li>
                        </ul>
                    </form>
                </section>
            </main>`
    )
}