import html from "../../utils/html.mjs";

/**
 *
 * @param props
 * @param children
 * @return {string|*}
 * @constructor
 */
export default function Notfound(props, children) {
    return (
        html`<main>
                <section data-layout-variant="hero">
                    <h1>Page Not Found</h1>
                    <p>The page you're trying to access doesn't exist</p>
                </section>
            </main>`
    )
}