export default class BoatCard extends HTMLElement {
    static {
        window.customElements.define('boat-card', this);
    }
    static get observedAttributes() {
        return ['boat-id', 'edit-enabled'];
    }

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
        // const templateContent = document.querySelector('template#boat-card-template')?.content;
        // this.attachShadow( {mode: 'open'} ); // Attaches a Shadow DOM tree to this element
        // this.shadowRoot.appendChild(templateContent.cloneNode(true));
    }

    #currentImageIndex = 0;
    #numOfImages;
    #imgCarousel;
    #movePhotoEnabled = true;
    #images;
    #prevPhotoBtn;
    #nextPhotoBtn;

    get boatId() {
        return this.getAttribute('boat-id');
    }
    set boatId(value) {
        if (value === null || value === undefined || value?.trim() === '')  {
            this.removeAttribute('boat-id');
        } else {
            this.setAttribute('boat-id', value);
        }
    }
    get editEnabled() {
        return this.hasAttribute('edit-enabled');
    }
    set editEnabled(value) {
        if (value === 'true' || value?.trim() === '') {
            this.setAttribute('edit-enabled', '');
        } else {
            this.removeAttribute('edit-enabled');
        }
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
        this.#images = this.querySelectorAll('img');
        this.#imgCarousel = this.shadowRoot.querySelector('section#image-carousel');
        this.#prevPhotoBtn = this.shadowRoot.querySelector('button#prev-photo');
        this.#nextPhotoBtn = this.shadowRoot.querySelector('button#next-photo');
        this.#numOfImages = this.#images.length;
        this.#removeChangeImgButtons(this.#numOfImages);
        this.shadowRoot.addEventListener("click", this);
        this.#prevPhotoBtn.addEventListener('click', this.#prevPhotoEventHandler.bind(this));
        this.#nextPhotoBtn.addEventListener('click', this.#nextPhotoEventHandler.bind(this));
        // console.log('edit enabled? ' + this.editEnabled);
        // console.log('boatId:  ' + this.boatId);
        if (!this.editEnabled) {
            // console.log('BoatCard is disabled');
        }
    }

    /**
     * Event handlers
     * @see https://thathtml.blog/2023/07/handleevent-is-mindblowing/
     * @param event
     */
    handleEvent(event) {
        if (event.type === "click") {
            // console.log(`event.bubbles? ${event.bubbles}`);
            // console.log(`event.target.tagName: ${event.target.tagName}`); // The HTML element that triggered the event (where the event started) - Event Bubbling
            // console.log(`event.currentTarget.tagName: ${event.currentTarget.tagName}`); // the HTML element in which the event handler is attached.
            if (event.target.tagName !== 'svg' && event.target.tagName !== 'path') {
                event.preventDefault();
                const boatsBaseUrl = `/boats/${this.boatId}`;
                // If date is not null, add query params to boat base url
                // window.location.href = this.editEnabled ? `/myboats/${this.boatId}` : `/boats/${this.boatId}`;
                window.location.href =  `/boats/${this.boatId}`;
                // TODO: Store the current date in local storage variable, which gets picked up (and deleted) when the booking-card component gets loaded (connectedCallback())
            }
        }
    }
    #prevPhotoEventHandler(event) {
        if (this.#movePhotoEnabled)  {
            this.#movePhotoEnabled = false; // Disable prev/next click
            this.#currentImageIndex = (--this.#currentImageIndex + this.#numOfImages) % this.#numOfImages;
            this.#imgCarousel.style.transform = `translateX(-${this.#currentImageIndex * 340}px)`;
            this.#toggleButtonDisable();
            window.setTimeout(() => this.#movePhotoEnabled = true, 400); // Enable next click after 0.4 seconds
        }
    }
    #nextPhotoEventHandler(event) {
        if (this.#movePhotoEnabled)  {
            this.#movePhotoEnabled = false; // Disable prev/next click
            this.#currentImageIndex = (++this.#currentImageIndex + this.#numOfImages) % this.#numOfImages;
            const nextImageIndex = ( this.#currentImageIndex + this.#numOfImages + 1) % this.#numOfImages;
            if (this.#images[this.#currentImageIndex].hidden) {
                this.#images[this.#currentImageIndex].hidden = false;
                this.#images[nextImageIndex].loading = 'eager';
            }
            this.#imgCarousel.style.transform = `translateX(-${this.#currentImageIndex * 340}px)`;
            this.#toggleButtonDisable();
            window.setTimeout(() => this.#movePhotoEnabled = true, 400);
        }
    }
    #toggleButtonDisable() {
        this.#prevPhotoBtn.disabled = this.#currentImageIndex === 0;
    }
    #removeChangeImgButtons(numOfImages) {
        if (numOfImages === 1) {
            this.#prevPhotoBtn.remove();
            this.#nextPhotoBtn.remove();
        }
    }

    /**
     * Usage:
     * const url = 'https://example.com';
     * const newUrl = addQueryParam(url, 'page', '2');
     * console.log(newUrl); // Output: https://example.com?page=2
     */
    #addQueryParam(url, param, value) {
        const urlObj = new URL(url);
        const params = new URLSearchParams(urlObj.search);
        params.set(param, value);
        urlObj.search = params.toString();
        return urlObj.toString();
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
        this.removeEventListener('click', this.handleEvent);
        this.removeEventListener('click', this.#prevPhotoEventHandler);
        this.removeEventListener('click', this.#nextPhotoEventHandler);
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
        if (oldValue === newValue) {
            return;
        }
        // Observing changes to attributes
        switch (name) {
            case 'boat-id':
                this.boatId = newValue;
                break;
            case 'edit-enabled':
                this.editEnabled = newValue;
                break;
            default:
                break;
        }
    }
}