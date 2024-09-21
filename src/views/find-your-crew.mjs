import html from "../utils/html.mjs";

export default function FindYourCrew(props, children) {
    return (
        html`
            <section id="find-your-crew">
                <figure>
                    <img src="/public/assets/images/ocean-with-small-boats.png" alt="Ocean with small boats">
                    <figcaption>
                        <h2>Find Your Crew</h2>
                    </figcaption>
                </figure>
                <section>
                    <hgroup>
                        <h3>Are you an experienced skipper?</h3>
                        <p>Update your profile with your sailing experience and certifications, and offer to sail boats for renters</p>
                    </hgroup>
                    <hgroup>
                        <h3>Are you looking crew a sailboat?</h3>
                        <p>Want to go sailing and gain experience as crew? Update your profile and coordinate with skippers to crew a sailboat for renters with little or no sailing experience</p>
                    </hgroup>
                </section>
            </section>
        `
    )
}