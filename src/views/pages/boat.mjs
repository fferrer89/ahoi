import html from "../../utils/html.mjs";

/**
 *
 * @param props
 * @param children
 * @return {string|*}
 * @constructor
 */
export default function Boat(props, children) {
    return (
        html`
            <main id="boat">
                <style>
                    main#boat {
                        max-width: var(--main-content-width);
                        margin: 100px auto 5px;
                        & h3, & figure, & figure + section {
                            padding-inline: var(--padding-inline-layout);
                        }
                        & figure[data-num-imgs] {
                            margin-inline: 0;
                            display: grid;
                            grid-template-columns: 2fr 1fr 1fr;
                            grid-template-rows: 250px 250px;

                            align-content: center; /*grid- (vertical) y-axis*/
                            align-items: stretch; /*grid element- (vertical) y-axis*/

                            justify-content: center; /*grid- (horizontal) x-axis*/
                            justify-items: stretch; /*grid element- (horizontal) x-axis*/
                            gap: 8px;
                            &[data-num-imgs="1"] {
                                grid-template-columns: 1fr;
                                grid-template-rows: 500px;
                                gap: 0;
                            }
                            &[data-num-imgs="2"] {
                                grid-template-columns: 2fr 1fr;
                                grid-template-rows: 500px;
                                row-gap: 0;
                            }
                            &[data-num-imgs="3"] {
                                grid-template-columns: 2fr 1fr;
                            }
                            &[data-num-imgs="4"] {
                                > img:nth-of-type(4) {
                                    grid-column-start: 2;
                                    grid-column-end: 4;
                                }
                            }
                            & img {
                                object-fit: cover;
                                object-position: center center;
                            }
                            &:has(img:nth-of-type(3)) {
                                & img {
                                    object-fit: cover;
                                    object-position: center center;
                                    &:first-of-type {
                                        grid-row-start: 1;
                                        grid-row-end: 3;
                                    }
                                }
                            }
                        }
                        @media (max-width: 720px) {
                            /*This rule-set applies when the browser's viewport width <= 720px*/
                            & figure[data-num-imgs] {
                                height: 500px;
                                display: flex;
                                flex-direction: row;
                                justify-content: center;
                                padding-inline: 0;
                                gap: 0;
                                transform: translateX(0);
                                transition: transform 0.5s ease-in-out;
                                & img:not(:first-of-type) {
                                    overflow: hidden;
                                }
                            }
                        }
                    }
                </style>
                <section>
                    <h3>${props?.boatData?.title}</h3>
                    <figure data-num-imgs="${props?.boatData?.images?.length}">
                        ${props?.boatData?.images?.map((image, index) => {
                            return (index < 5) ?
                                    `<img src="${image.directory}/${image.id}" alt="${props.boatData?.boatType}">` :
                                    `<img src="${image.directory}/${image.id}" alt="${props.boatData?.boatType}" fetchpriority="low" loading="lazy" hidden>`
                        })}
                    </figure>
                    <section>
                        <p>${props?.boatData?.boatType} at ${props?.boatData?.city}, ${props?.boatData?.state}</p>
                        <p>Owned by ${props?.boatData?.username}</p>
                        <p>${props?.boatData?.description}</p>
                        <reservation-card price-per-hour="${props?.boatData?.pricePerHour}"></reservation-card>
                    </section>
                </section>
            </main>`
    )
}