import fs from "node:fs";
import path from "node:path";
import html from "../utils/html.mjs";
/**
 *
 * @param props
 * @param children
 * @return {string|*}
 * @constructor
 */
export default function BoatCard(props, children) {
    let boatCardTemplatePath, boatCardTemplate;
    try {
        boatCardTemplatePath = path.resolve('public/components/boat-card/boat-card.html');
        boatCardTemplate = fs.readFileSync(boatCardTemplatePath, { encoding: 'utf8' });
    } catch (err) {
        console.error(err);
    }
    return (
        html`<boat-card boat-id="${props?.boatObj?.boatId}" ${props?.editEnabled && 'edit-enabled'}>
                ${props?.boatObj?.images?.map((image, index) => {
                    switch (index) {
                        case 0:
                            return html`<img slot="boat-image" src="${image.directory}/${image.id}" alt="${props?.boatObj?.boatType} image" fetchpriority="high">`
                        case 1:
                            return html`<img slot="boat-image" src="${image.directory}/${image.id}" alt="${props?.boatObj?.boatType} image" fetchpriority="low" hidden>`
                        default:
                            return html`<img slot="boat-image" src="${image.directory}/${image.id}" alt="${props?.boatObj?.boatType} image" fetchpriority="low" loading="lazy" hidden>`
                    }
                })}
                <p slot="price-per-hour"><strong>$${props?.boatObj?.pricePerHour}</strong><sub>/hour</sub></p>
                <p slot="boat-location">${props?.boatObj?.city?.toUpperCase()}, ${props?.boatObj?.state?.toUpperCase()}</p>
                <p slot="boat-title">${props?.boatObj?.title}</p>
                ${boatCardTemplate}
            </boat-card>`
    )
}