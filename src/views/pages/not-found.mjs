import html from "../../utils/html.mjs";

/**
 *
 * @param props
 * @param children
 * @return {string|*}
 * @constructor
 */
export default function NotFound(props, children) {
    // ${searchTemplate && `<script type="module" src="/public/components/search/search.mjs"></script>`}
    return (
        html`
            <main>
                <section data-layout-variant="hero">
                    <h1>Page Not Found</h1>
                    <p>The page you're trying to access doesn't exist</p>
                </section>
            </main>
        `
    )
}