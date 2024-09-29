import html from "../../utils/html.mjs";
/**
 *
 * @param props
 * @param children
 * @return {string|*}
 * @constructor
 */
export default function Login(props, children) {
    props = {
        errorMessages: {
            // generalErrorMsg: '',
            // email: '',
            // password: 'Passwords must be at least 10 characters long and should include at least one special character, one number, and one letter'
        },
        values: {
            // email: 'jown@me.com'
        }
    }
    return (
        html`
            <main id="login">
                <section data-layout-variant="hero">
                    <form action="/login" method="post">
                        <header>
                            <a href="/login" aria-selected="true">
                                <h4>Log In</h4>
                            </a>
                            <a href="/signup">
                                <h4>Sign Up</h4>
                            </a>
                        </header>
                        <ul>
                            <li>
                                <output for="email password" name="credentialsErrorMsg">${props?.errorMessages?.generalErrorMsg}</output>
                                <!--e.g.: Incorrect credentials provided-->
                            </li>
                            <li>
                                <input type="email" name="email" id="email" placeholder="Email" autocomplete="email" 
                                       aria-label="Email" ${props?.errorMessages?.email && 'autofocus'}>
                                <output for="email" name="emailErrorMsg">${props?.errorMessages?.email}</output>
                                <!--e.g.: Please provide a properly formatted email address-->
                            </li>
                            <li>
                                <input type="password" name="password" id="password" placeholder="Password"
                                       ${props?.errorMessages?.password && 'autofocus'}
                                       autocomplete="current-password" aria-label="Password">
                                <button type="button" class="hide-show-toggle-pw"></button>
                                <output for="password" name="passwordErrorMsg">${props?.errorMessages?.password}</output>
                            </li>
                            <li hidden>
                                <input type="checkbox" name="remember-credentials" id="remember-credentials"
                                       checked>
                                <label for="remember-credentials">Remember Me</label>
                            </li>
                            <li hidden>
                                <a href="/login/reset-password">Trouble signing in?</a>
                            </li>
                            <li>
                                <button type="submit">Log in</button>
                            </li>
                        </ul>
                    </form>
                </section>
            </main>
        `
    )
}