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
    let bookingCardTemplatePath, bookingCardTemplate;
    try {
        imageGalleryTemplatePath = path.resolve('public/components/image-gallery/image-gallery.html');
        imageGalleryTemplate = fs.readFileSync(imageGalleryTemplatePath, { encoding: 'utf8' });
        bookingCardTemplatePath = path.resolve('public/components/booking-card/booking-card.html');
        bookingCardTemplate = fs.readFileSync(bookingCardTemplatePath, { encoding: 'utf8' })
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
                        <section id="boat-info">
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
                        </section>
                        <booking-card price-per-hour="${props?.boatData?.pricePerHour}" 
                                      service-fee="5"
                                      boat-id="${props?.boatData?.boatId}"
                                      user-id="${props?.user?.id}">
                            <h4 slot="price-per-hour"><strong>$${props?.boatData?.pricePerHour}</strong><sub>/hour</sub></h4>
<!--                            <input slot="check-in" id="check-in" name="checkIn" type="datetime-local" step="3600">-->
                            ${bookingCardTemplate}
                        </booking-card>
                    </section>
                </section>
            </main>`
    )
}