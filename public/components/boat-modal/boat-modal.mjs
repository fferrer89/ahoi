// import BoatCard from "/public/components/boat-card/boat-card.mjs";
// import styleSheet from '/public/components/boat-modal/boat-modal.css' with { type: 'css' };
class BoatModal extends HTMLElement {
    static {
        window.customElements.define('boat-modal', this);
    }
    // static get observedAttributes() {}
    #dialog;
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
        this.#form = this.shadowRoot.querySelector('form');
        this.#dialog = this.shadowRoot.querySelector('dialog');
        const openModalBtn = document.querySelector('main#boats button[command=show-modal]');
        const closeModalBtn = this.shadowRoot.querySelector('button[command=close]');
        openModalBtn.addEventListener('click', this.#openModalEventHandler.bind(this));
        this.shadowRoot.addEventListener("submit", this);
        closeModalBtn.addEventListener('click', this.#closeModalEventHandler.bind(this));
    }

    /**
     * Event handlers
     * @see https://thathtml.blog/2023/07/handleevent-is-mindblowing/
     * @param event
     */
    async handleEvent(event) {
        if (event.type === "submit") {
            await this.#submitFormEventHandler(event); // Events bubbles up from submit <dialog> to <boat-modal>
        }
    }
    async #submitFormEventHandler(event) {
        console.info(`You submitted this custom HTML web component: ${this.constructor.name}`);
        event.preventDefault(); // Prevent default behavior when submitting a from inside a dialog element
        // Create a FormData object to handle file uploads
        const formData = new FormData(this.#form);
        // Send form data to server
        // FIXME: Error handling when the there is an error in the fetch() or json()
        const response = await window.fetch('/myboats', {
            method: 'POST',
            headers: {
                'Accept': 'text/plain'
            },
            body: formData
        })
        const responseBody = await response.text()
        const boatCardHtmlDoc = Document.parseHTMLUnsafe(responseBody);
        const boatCard = boatCardHtmlDoc?.body?.firstChild;
        const boatCards = window.document.querySelector('section#boat-cards');
        boatCards.appendChild(boatCard);
        // Update the h3 with correct number of boats (data-num-boats) and with appropriate text
        const headingNumBoats = document.querySelector('h3[data-num-boats]');
        const numOfBoatsCur = headingNumBoats?.dataset?.numBoats;
        const numOfBoatsNew = parseInt(numOfBoatsCur) + 1;
        headingNumBoats.dataset.numBoats = String(numOfBoatsNew);
        headingNumBoats.textContent = (numOfBoatsNew > 1) ? `${numOfBoatsNew} boats` : `${numOfBoatsNew} boat`;
        this.#form.reset();
        this.#dialog.close();
    }
    #closeModalEventHandler(event) {
        this.#form.reset();
        this.#dialog.close();
    }
    #openModalEventHandler(event) {
        this.#form.reset();
        // Use the .showModal() method to display a modal dialog and the .show() method to display a non-modal dialog.
        this.#dialog.showModal();
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
        this.removeEventListener('click', this.#openModalEventHandler);
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