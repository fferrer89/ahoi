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
export default function Myboats(props, children) {
    let boatModalTemplatePath, boatModalTemplate;
    try {
        boatModalTemplatePath = path.resolve('public/components/boat-modal/boat-modal.html');
        boatModalTemplate = fs.readFileSync(boatModalTemplatePath, { encoding: 'utf8' });
    } catch (err) {
        console.error(err);
    }
    return (
        html`<main id="boats">
                <section>
                    <header>
                        <h3 data-num-boats="${props?.numOfBoats}">${props?.numOfBoats > 0 ?
                                `${props?.numOfBoats} boat${props?.numOfBoats > 1 ? `s` : ''}`
                                : 'You have not posted any boat yet'}
                        </h3>
                        <button type="button" command="show-modal" commandfor="#boat-modal">Post New Boat</button>
                    </header>
                    <boat-modal id="boat-modal">
                        ${boatModalTemplate}
                    </boat-modal>
                    <section id="boat-cards">
                        ${children.map(component => html`${component}`)}
                    </section>
                </section>
            </main>`
    )
}