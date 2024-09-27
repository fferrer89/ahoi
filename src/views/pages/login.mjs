import html from "../../utils/html.mjs";
/**
 *
 * @param props
 * @param children
 * @return {string|*}
 * @constructor
 */
export default function Login(props, children) {
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
                                <input type="email" placeholder="Email" aria-label="Email">
                            </li>
                            <li>
                                <input type="password" placeholder="Password" aria-label="Password">
                            </li>
                            <li>
                                <button>Sign In</button>
                            </li>
                        </ul>
                    </form>
                </section>
            </main>
        `
    )
}