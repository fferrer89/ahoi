import fs from "node:fs";
import path from "node:path";
import html from "../../utils/html.mjs";
/**
 *
 * @param props
 * @param children
 * @return {string|*}
 * @constructor
 */
export default function Boats(props, children) {
    let searchTemplatePath, searchTemplate;
    try {
        searchTemplatePath = path.resolve('public/components/search/search.html');
        searchTemplate = fs.readFileSync(searchTemplatePath, { encoding: 'utf8' });
    } catch (err) {
        console.error(err);
    }
    return (
        html`<main id="boats">
                <section>
                    <search-ahoi max-years-ahead-reservation="4"
                                 location="${props?.searchValues?.location}"
                                 date="${props?.searchValues?.date}"
                                 boat-type="${props?.searchValues?.boatType}">
                        ${searchTemplate}
                    </search-ahoi>
                </section>
                <section>
                    <h3>${props?.numOfBoats > 0 ?
                            `${props?.numOfBoats} boat${props?.numOfBoats > 1 ? `s` : ''} ${props?.searchValues?.location ? `in ${props?.searchValues?.location}` : ''}`
                            : 'We did not find a match'}
                    </h3>
                    <section id="boat-cards">
                        ${children.map(component => html`${component}`)}
                    </section>
                </section>
            </main>`
    )
}