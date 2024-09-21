import html from "../utils/html.mjs";

export default function HowItWorks(props, children) {
    return (
        html`
            <section id="how-it-works">
                <h2>How It Works</h2>
                <section>
                    <h3>Boat Renter</h3>
                    <hgroup>
                        <h4>Search</h4>
                        <p>Explore our privately owned fleet of boats for rent</p>
                    </hgroup>
                    <hgroup>
                        <h4>Connect</h4>
                        <p>Message the boat owner with any questions</p>
                    </hgroup>
                    <hgroup>
                        <h4>Book</h4>
                        <p>Reserve a boat for a date and duration, with or without a skipper</p>
                    </hgroup>
                    <hgroup>
                        <h4>Cruise</h4>
                        <p>Grab your crew and enjoy your time out on the water!</p>
                    </hgroup>
                </section>
                <section>
                    <h3>Boat Owner</h3>
                    <hgroup>
                        <h4>List</h4>
                        <p>Create your boat listing and set your availability and price</p>
                    </hgroup>
                    <hgroup>
                        <h4>Connect</h4>
                        <p>Review booking inquires and requests</p>
                    </hgroup>
                    <hgroup>
                        <h4>Manage</h4>
                        <p>Manage booking logistics on our site</p>
                    </hgroup>
                    <hgroup>
                        <h4>Collect</h4>
                        <p>Collect your boat rent to offset your cost of boat ownership</p>
                    </hgroup>
                </section>
            </section>
        `
    )
}