import fs from "node:fs";
import path from "node:path";
import html from "../../utils/html.mjs";
import HowItWorks from "../how-it-works.mjs";
import FindYourCrew from "../find-your-crew.mjs";
/**
 *
 * @param props
 * @param children
 * @return {string|*}
 * @constructor
 */
export default function Home(props, children) {
    const howItWorks = HowItWorks();
    const findYourCrew = FindYourCrew();
    let searchTemplatePath;
    let searchTemplate;
    try {
        searchTemplatePath = path.resolve('public/components/search/search.html');
        searchTemplate = fs.readFileSync(searchTemplatePath, { encoding: 'utf8' });
    } catch (err) {
        console.error(err);
    }
    // ${searchTemplate && `<script type="module" src="/public/components/search/search.mjs"></script>`}
    return (
        html`<main id="home">
                <section data-layout-variant="hero">
                    <h1>Rent a boat in your favorite city</h1>
                    <search-ahoi max-years-ahead-reservation="4">
                        ${searchTemplate}
                    </search-ahoi>   
                </section>
                ${howItWorks}
                ${findYourCrew}
            </main>`
    )
}