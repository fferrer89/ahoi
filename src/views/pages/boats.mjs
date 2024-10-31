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
    let boatCardTemplatePath, boatCardTemplate;
    try {
        searchTemplatePath = path.resolve('public/components/search/search.html');
        searchTemplate = fs.readFileSync(searchTemplatePath, { encoding: 'utf8' });
        boatCardTemplatePath = path.resolve('public/components/boat-card/boat-card.html');
        boatCardTemplate = fs.readFileSync(boatCardTemplatePath, { encoding: 'utf8' });
    } catch (err) {
        console.error(err);
    }
    return (
        html`
            <main id="boats">
                <section>
                    <search-ahoi max-years-ahead-reservation="4" 
                                 location="${props?.searchValues?.location}"
                                 date="${props?.searchValues?.date}"
                                 boat-type="${props?.searchValues?.boatType}">
                    ${searchTemplate}
                </section>
                <section>
                    ${props?.boatsData.map(boat=> 
                            `<p>${boat.boatType} image</p><boat-card></boat-card>`
                    )}
                    ${boatCardTemplate}
                </section>
            </main>
        `
    )
}