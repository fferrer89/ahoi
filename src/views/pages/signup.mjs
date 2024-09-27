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
        html`
            <main id="signup">
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
                                <fieldset>
                                    <input type="radio" name="user-type" value="boat-owner" checked aria-label="Boat Owner">
                                    <input type="radio" name="user-type" value="boat-renter" aria-label="Boat Renter">
                                </fieldset>
                            </li>
                            <li>
                                <input type="email" placeholder="Email" aria-label="Email">
                            </li>
                            <li>
                                <input type="text" placeholder="Username" aria-label="Username">
                            </li>
                            <li>
                                <input type="password" placeholder="Password" aria-label="Password">
                            </li>
                            <li>
                                <button>Register</button>
                            </li>
                        </ul>
                    </form>
                </section>
            </main>
        `
    )
}