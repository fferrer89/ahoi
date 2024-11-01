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
                    <h3>${props?.boatsData?.length > 0 ?
                            `${props?.boatsData?.length} boats ${props?.searchValues?.location ? `in ${props?.searchValues?.location}` : ''}`
                            : 'We did not find a match'}
                    </h3>
                    <section id="boat-cards">
                        ${props?.boatsData.map(boat => `
                        <boat-card available liked>
                            <img slot="boat-image" src="/uploads/images/${boat?.boatId}" alt="${boat?.boatType} image">
                            <p slot="price-per-hour"><strong>$${boat?.pricePerHour}</strong><sub part="abc">/hour</sub></p>
                            <p slot="boat-location">${boat?.city.toUpperCase()}, ${boat?.state.toUpperCase()}</p>
                            <p slot="boat-description">${boat?.description}</p>
                        </boat-card>
                        `
                        )}
                    </section>
                    ${boatCardTemplate}
                </section>
            </main>
        `
    )
}