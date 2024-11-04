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
export default function MyBoats(props, children) {
    let boatCardTemplatePath, boatCardTemplate;
    let boatModalTemplatePath, boatModalTemplate;
    try {
        boatCardTemplatePath = path.resolve('public/components/boat-card/boat-card.html');
        boatCardTemplate = fs.readFileSync(boatCardTemplatePath, { encoding: 'utf8' });
        boatModalTemplatePath = path.resolve('public/components/boat-modal/boat-modal.html');
        boatModalTemplate = fs.readFileSync(boatModalTemplatePath, { encoding: 'utf8' });
    } catch (err) {
        console.error(err);
    }
    // FIXME: The is HTML attribute (is="boat-modal") is not compatible with IOS devices so the dialog does not render when clicked in iphone, iphad, ..
    return (
        html`
            <main id="boats">
                <section>
                    <header>
                        <h3 data-num-boats="${props?.myBoatsData?.length}">${props?.myBoatsData?.length > 0 ?
                                `${props?.myBoatsData?.length} boat${props?.myBoatsData?.length > 1 ? `s` : ''}`
                                : 'You have not posted any boat yet'}
                        </h3>
                        <button type="button" command="show-modal" commandfor="#boat-modal">Post New Boat</button>
                    </header>
                    <dialog is="boat-modal" id="boat-modal"></dialog>
                    ${boatModalTemplate}
                    <section id="boat-cards">
                        ${props?.myBoatsData?.map(boat => `
                        <boat-card edit-enabled>
                            <img slot="boat-image" src="/uploads/images/${boat?.imageId}" alt="${boat?.boatType} image">
                            <p slot="price-per-hour"><strong>$${boat?.pricePerHour}</strong><sub>/hour</sub></p>
                            <p slot="boat-location">${boat?.city?.toUpperCase()}, ${boat?.state?.toUpperCase()}</p>
                            <p slot="boat-description">${boat?.description}</p>
                        </boat-card>`)}
                    </section>
                    ${boatCardTemplate}
                </section>
            </main>
        `
    )
}