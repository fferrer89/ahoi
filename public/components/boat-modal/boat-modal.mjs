import BoatCard from "/public/components/boat-card/boat-card.mjs";
class BoatModal extends HTMLDialogElement {
    static {
        window.customElements.define('boat-modal', this, { extends: 'dialog' });
    }
    static get observedAttributes() {
    }

    #form;
    /**
     * In the class constructor, you can set up initial state and default values, register event listeners, ...
     * Do NOT try to access the DOM of this element (search-ahoi) in the constructor, so 'document.createElement("span")'
     * must NOT be done in the constructor.
     *
     * Useful for initializing state, setting up event listeners, or creating a shadow dom.
     *
     * In the constructor, the element is created in memory, but it has not been added to the DOM yet.
     *
     * You can initialize this class in two ways:
     *   - const boatCard = new Search();
     *   - <boat-card></boat-card>
     */
    constructor() {
        super();
        const templateContent = document.querySelector('template#boat-modal-template')?.content;
        this.appendChild(templateContent.cloneNode(true));
    }

    /**
     * connectedCallback() gets automatically executed by the browser after it has added/mounted/attached this custom
     * component to the DOM. It can contain DOM manipulations, event listeners, database connections and manipulations
     *  (query, insert, update, delete), open a connection to IndexedDB, HTTP requests, ...
     * Function called by the browser each time the element is added to the document. The specification recommends that,
     * as far as possible, developers should implement custom element setup in this callback rather than the constructor().
     * Can be called many times if an element is repeatedly added/removed, and it contains the custom element setup.
     *
     * Useful for running setup code, such as fetching resources or rendering. Generally, you should try to delay work
     * until this time.
     */
    connectedCallback() {
        this.#form = this.querySelector('form');
        const closeModalBtn = this.querySelector('button[command=close]');
        const state = this.querySelector('select#state');
        const city = this.querySelector('select#city');
        closeModalBtn.addEventListener('click', this.#closeModalEventHandler.bind(this));
        this.addEventListener("submit", this);
    }

    /**
     * Event handlers
     * @see https://thathtml.blog/2023/07/handleevent-is-mindblowing/
     * @param event
     */
    async handleEvent(event) {
        if (event.type === "submit") {
            await this.#submitFormEventHandler(event);
        }
    }
    async #submitFormEventHandler(event) {
        console.info(`You submitted this custom HTML web component: ${this.constructor.name}`);
        event.preventDefault(); // Prevent default behavior when submitting a from inside a dialog element
        // Create a FormData object to handle file uploads
        const formData = new FormData(this.#form);
        // Send form data to server
        const response = await window.fetch('/my-boats', {
            method: 'POST',
            body: formData
        })
        const responseBody = await response.json()
        // Create a boat-card and append it to the end of the boar-cards section
        // TODO: Include the 'edit-enabled' attribute
        const boatImage = document.createElement('img');
        boatImage.src = `/uploads/images/${responseBody?.imageId}`;
        boatImage.alt = `${responseBody?.type} image`;
        boatImage.slot = 'boat-image';

        const pricePerHour = document.createElement('p');
        const price = document.createElement('strong');
        price.textContent = `$${responseBody?.pricePerHour}`;
        pricePerHour.appendChild(price);
        const subTime = document.createElement('sub');
        subTime.textContent = '/hour';
        pricePerHour.appendChild(subTime);
        pricePerHour.slot = 'price-per-hour';

        const location = document.createElement('p');
        location.textContent = `${responseBody?.address?.city?.toUpperCase()}, ${responseBody?.address?.state?.toUpperCase()}`;
        location.slot = 'boat-location';

        const description = document.createElement('p');
        description.textContent = `${responseBody?.description}`;
        description.slot = 'boat-description';

        const boatCards = document.querySelector('section#boat-cards');
        const boatCard = document.createElement('boat-card');
        boatCard.appendChild(boatImage);
        boatCard.appendChild(pricePerHour);
        boatCard.appendChild(location);
        boatCard.appendChild(description);
        boatCards.appendChild(boatCard);

        // Update the h3 with correct number of boats (data-num-boats) and with appropriate text
        const headingNumBoats = document.querySelector('h3[data-num-boats]');
        const numOfBoatsCur = headingNumBoats?.dataset?.numBoats;
        const numOfBoatsNew = parseInt(numOfBoatsCur) + 1;
        headingNumBoats.dataset.numBoats = String(numOfBoatsNew);
        headingNumBoats.textContent = (numOfBoatsNew > 1) ? `${numOfBoatsNew} boats` : `${numOfBoatsNew} boat`;
        this.#form.reset();
        this.close();
    }
    #closeModalEventHandler(event) {
        this.#form.reset();
        this.close();
    }

    /**
     * disconnectedCallback() gets automatically executed by the browser after it has detached/unmounted this custom
     * component from the DOM.
     * This method is where we put all the cleanup work, such as closing the database connection, cancelling pending
     * HTTP requests, removing EVENT LISTENERS from the DOM, send log messages, send analytics messages, close a
     * connection to IndexedDB, ...
     *
     * The browser calls this function each time the element is removed from the document/DOM. You can't rely on your
     * element being removed from the DOM in all circumstances. For example, disconnectedCallback() will never be
     * called if the user closes the tab.
     */
    disconnectedCallback() {
        this.removeEventListener('submit', this.#submitFormEventHandler);
        this.removeEventListener('click', this.#closeModalEventHandler);
    }

    /**
     * attributeChangedCallback() gets automatically executed by the browser whenever an HTML attribute whose name is
     * listed in the element's observedAttributes property (static observedAttributes = ["size"]) is added, modified,
     * removed, or replaced from the DOM.
     *
     * Note: If someone calls el.setAttribute() on your element, the browser will immediately call attributeChangedCallback()
     *
     * Note: only attributes listed in the observedAttributes property will receive this callback. When users change a
     * common attribute like 'style' or 'class', you don't want to be spammed with tons of callbacks.
     *
     * This method is useful to update the data and the DOM of this custom web component when some attribute
     * (e.g.: size="100") changes.
     *
     * If the element's HTML declaration includes an observed attribute (e.g.: <custom-tooltip size="100"></custom-tooltip>),
     * attributeChangedCallback() will be called after the attribute is initialized, when the element's declaration is
     * PARSED for the first time.
     *
     * @param name the name of the attribute which changed
     * @param oldValue the attribute's old value
     * @param newValue the attribute's new value
     */
    attributeChangedCallback(name, oldValue, newValue) {
    }
}