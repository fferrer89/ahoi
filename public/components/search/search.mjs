class Search extends HTMLElement {
    static {
        window.customElements.define('search-ahoi', this);
    }
    static get observedAttributes() {
        return ['max-years-ahead-reservation'];
    }
    static #getCurrentDate(yearIncrementer=0) {
        const today = new Date();
        const year = today.getFullYear() + yearIncrementer;
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    #dateInput;
    #boatTypeInput;
    #maxYearsAheadReservation;
    #defaultMaxYearsAheadReservation = 3;

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
     *   - const searchAhoi = new Search();
     *   - <search-ahoi></search-ahoi>
     */
    constructor() {
        super();
        this.attachShadow({mode: 'open'}); // Attaches a Shadow DOM tree to this element
        const template = document.querySelector('template#search-template');
        const clonedTemplate = document.importNode(template.content, true);
        template.remove(); // Removes the <template> element from the final HTML document
        this.shadowRoot.appendChild(clonedTemplate);
    }

    /**
     * @return {number}
     */
    get maxYearsAheadReservation() {
        let maxYearsAheadReservation =  this.getAttribute('max-years-ahead-reservation');
        maxYearsAheadReservation = parseInt(maxYearsAheadReservation, 10);
        if (maxYearsAheadReservation === null || maxYearsAheadReservation === undefined ||
            Number.isNaN(maxYearsAheadReservation) || maxYearsAheadReservation < 1)  {
            return this.#defaultMaxYearsAheadReservation;
        } else {
            return maxYearsAheadReservation;
        }
    }

    /**
     * @param {number} value
     */
    set maxYearsAheadReservation(value) {
        // https://web.dev/articles/custom-elements-v1#reflectattr
        // Reflecting property to attribute
        if (value === null || value === undefined || Number.isNaN(value) || value < 1)  {
            // Reflecting the web component 'text' property to the HTML 'text' attribute
            this.removeAttribute('max-years-ahead-reservation');
        } else {
            this.setAttribute('max-years-ahead-reservation', value.toString());
            this.#dateInput.max = Search.#getCurrentDate(this.maxYearsAheadReservation);
            this.#maxYearsAheadReservation = value;
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
        this.#dateInput = this.shadowRoot.querySelector('input[name="date"]');
        this.#boatTypeInput = this.shadowRoot.querySelector('select[name="boatType"]');

        // -------------------------------------- DOM Manipulations--------------------------------------
        this.#dateInput.min = Search.#getCurrentDate();
        this.#dateInput.max = Search.#getCurrentDate(this.maxYearsAheadReservation);
        // -------------------------------------- Event Listeners ---------------------------------------
        this.#dateInput.addEventListener('click', this.#firstClickOnDateEventHandler.bind(this), {once: true});
        this.#dateInput.addEventListener('change', this.#changeValueOfDateEventHandler.bind(this));
        this.#boatTypeInput.addEventListener('change', this.#firstChangeValueOnBoatTypeEventHandler.bind(this), {once: true});
    }
    #firstClickOnDateEventHandler(event) {
        this.#dateInput.type = 'date';
    }
    #changeValueOfDateEventHandler(event) {
        if (this.#dateInput.value === '') {
            this.#dateInput.style.color = '#999';
        } else {
            this.#dateInput.style.color = 'initial';
        }
    }
    #firstChangeValueOnBoatTypeEventHandler(event) {
        const selectedOption = this.#boatTypeInput.options[this.#boatTypeInput.selectedIndex];
        const selectedValue = selectedOption.value;
        if (selectedValue !== 'boatType') {
            this.#boatTypeInput.setAttribute('aria-visited', 'true');
        }
    }

    /**
     * Event handlers
     * @see https://thathtml.blog/2023/07/handleevent-is-mindblowing/
     * @param event
     */
    handleEvent(event) {
        if (event.type === "click") {
            window.alert(`You clicked this custom HTML web component: ${this.constructor.name}`);
        }
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
        this.#dateInput.removeEventListener('click', this.#firstClickOnDateEventHandler);
        this.#dateInput.removeEventListener('change', this.#changeValueOfDateEventHandler);
        this.#boatTypeInput.removeEventListener('change', this.#firstChangeValueOnBoatTypeEventHandler);
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
            case 'max-years-ahead-reservation':
                const maxYearsAheadReservationInt = parseInt(newValue, 10);
                this.maxYearsAheadReservation = maxYearsAheadReservationInt;
                break;
            default:
                break;
        }
    }
}