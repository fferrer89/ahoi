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
        html`<boat-card edit-enabled>
                <img slot="boat-image" src="/uploads/images/${props?.boatObj?.imageId}" alt="${props?.boatObj?.boatType} image">
                <p slot="price-per-hour"><strong>$${props?.boatObj?.pricePerHour}</strong><sub>/hour</sub></p>
                <p slot="boat-location">${props?.boatObj?.city?.toUpperCase()}, ${props?.boatObj?.state?.toUpperCase()}</p>
                <p slot="boat-description">${props?.boatObj?.description}</p>
                ${boatCardTemplate}
            </boat-card>`
    )
}