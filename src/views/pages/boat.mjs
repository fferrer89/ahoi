import html from "../../utils/html.mjs";
import path from "node:path";
import fs from "node:fs";

/**
 *
 * @param props
 * @param children
 * @return {string|*}
 * @constructor
 */
export default function Boat(props, children) {
    let imageGalleryTemplatePath, imageGalleryTemplate;
    try {
        imageGalleryTemplatePath = path.resolve('public/components/image-gallery/image-gallery.html');
        imageGalleryTemplate = fs.readFileSync(imageGalleryTemplatePath, { encoding: 'utf8' });
    } catch (err) {
        console.error(err);
    }
    return (
        html`
            <main id="boat">
                <section>
                    <h3>${props?.boatData?.title}</h3>
                    <image-gallery num-imgs="${props?.boatData?.images?.length}">
                        ${props?.boatData?.images?.map((image, index) => {
                            return (index < 5) ?
                                    `<img slot="boat-image" src="${image.directory}/${image.id}" alt="${props.boatData?.boatType}">` :
                                    `<img slot="boat-image" src="${image.directory}/${image.id}" alt="${props.boatData?.boatType}" fetchpriority="low" loading="lazy" hidden>`
                        })}
                        ${imageGalleryTemplate}
                    </image-gallery>
                    <section>
                        <h4>${props?.boatData?.boatType} at ${props?.boatData?.city}, ${props?.boatData?.state}</h4>
                        <figure>
                            <img src="/tasks/uploads/images/28" alt="Profile picture of user">
                            <figcaption>
                                <hgroup>
                                    <h5>Owned by ${props?.boatData?.username}</h5>
                                    <p><small>Superowner – 1 year renting</small></p>
                                </hgroup>
                            </figcaption>
                        </figure>
                        <p>${props?.boatData?.description}</p>
                        <reservation-card price-per-hour="${props?.boatData?.pricePerHour}"></reservation-card>
                    </section>
                </section>
            </main>`
    )
}