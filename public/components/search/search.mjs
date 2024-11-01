class Search extends HTMLElement {
    static {
        window.customElements.define('search-ahoi', this);
    }
    static get observedAttributes() {
        return ['max-years-ahead-reservation', 'location', 'date', 'boat-type', 'required-search-inputs'];
    }
    static #getCurrentDate(yearIncrementer=0) {
        const today = new Date();
        const year = today.getFullYear() + yearIncrementer;
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    #locationAttr
    #dateAttr;
    #boatTypeAttr;
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
            this.#dateAttr.max = Search.#getCurrentDate(this.maxYearsAheadReservation);
            this.#maxYearsAheadReservation = value;
        }
    }
    get location() {
        return this.getAttribute('location');
    }
    set location(value) {
        if (value === null || value === undefined || value?.trim() === '')  {
            this.removeAttribute('location');
            this.#locationAttr.value = '';
        } else {
            /* Reflecting property to attribute: When document.querySelector('search-ahoi').location property is
                changed using JS, its related HTML attribute (location='Chicago, IL') will also be changed.
                Info: https://web.dev/articles/custom-elements-v1#reflectattr
                */
            this.setAttribute('location', value);
            this.#locationAttr.value =  this.location; // Specific to this logic
        }
    }
    get boatType() {
        return this.getAttribute('boat-type');
    }
    set boatType(value) {
        if (value === null || value === undefined || value?.trim() === 'boatType' || value?.trim() === '')  {
            this.removeAttribute('boat-type');
            this.#boatTypeAttr.options.selectedIndex = 0;
            this.#boatTypeAttr.setAttribute('aria-visited', 'false');
        } else {
            /* Reflecting property to attribute: When document.querySelector('search-ahoi').location property is
                changed using JS, its related HTML attribute (boat-type='All') will also be changed.
                Info: https://web.dev/articles/custom-elements-v1#reflectattr
                */
            this.setAttribute('boat-type', value);
            for (let option of this.#boatTypeAttr.options) {
                if (option.value === value && option.value !== '') {
                    this.#boatTypeAttr.options.selectedIndex = option.index;
                    this.#firstChangeValueOnBoatTypeEventHandler();
                    break;
                }
            }
        }
    }
    get date() {
        return this.getAttribute('date');
    }
    set date(value) {
        if (value === null || value === undefined || value?.trim() === '')  {
            this.removeAttribute('date');
            this.#dateAttr.type = 'text';
            // this.#dateAttr.value = 'Date';
            this.#dateAttr.style.color = '#999';
        } else {
            /* Reflecting property to attribute: When document.querySelector('search-ahoi').location property is
                changed using JS, its related HTML attribute (date='2024-11-10') will also be changed.
                Info: https://web.dev/articles/custom-elements-v1#reflectattr
                */
            this.setAttribute('date', value);
            this.#firstClickOnDateEventHandler()
            this.#dateAttr.value =  this.date;
            this.#changeValueOfDateEventHandler();
        }
    }
    get requiredSearchInputs() {
        return this.hasAttribute('required-search-inputs');
    }
    set requiredSearchInputs(value) {
        if (value === 'true' || value?.trim() === '') {
            this.setAttribute('required-search-inputs', '');
            this.#locationAttr.required = true;
            this.#dateAttr.required = true;
            this.#boatTypeAttr.required = true;
        } else {
            this.removeAttribute('required-search-inputs');
            this.#locationAttr.required = false;
            this.#dateAttr.required = false;
            this.#boatTypeAttr.required = false;
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
        // -------------------------------------- DOM Manipulations--------------------------------------
        this.#locationAttr = this.shadowRoot.querySelector('input[name="location"]');
        this.#dateAttr = this.shadowRoot.querySelector('input[name="date"]');
        this.#boatTypeAttr = this.shadowRoot.querySelector('select[name="boatType"]');
        this.#dateAttr.min = Search.#getCurrentDate();
        this.#dateAttr.max = Search.#getCurrentDate(this.maxYearsAheadReservation);
        // -------------------------------------- Event Listeners ---------------------------------------
        this.#dateAttr.addEventListener('click', this.#firstClickOnDateEventHandler.bind(this), {once: true});
        this.#dateAttr.addEventListener('change', this.#changeValueOfDateEventHandler.bind(this));
        this.#boatTypeAttr.addEventListener('change', this.#firstChangeValueOnBoatTypeEventHandler.bind(this), {once: true});
    }
    #firstClickOnDateEventHandler(event) {
        this.#dateAttr.type = 'date';
    }
    #changeValueOfDateEventHandler(event) {
        if (this.#dateAttr.value === '') {
            this.#dateAttr.style.color = '#999';
        } else {
            this.#dateAttr.style.color = 'initial';
        }
    }
    #firstChangeValueOnBoatTypeEventHandler(event) {
        const selectedOption = this.#boatTypeAttr.options[this.#boatTypeAttr.selectedIndex];
        const selectedValue = selectedOption.value;
        if (selectedValue !== '') {
            this.#boatTypeAttr.setAttribute('aria-visited', 'true');
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
        this.#dateAttr.removeEventListener('click', this.#firstClickOnDateEventHandler);
        this.#dateAttr.removeEventListener('change', this.#changeValueOfDateEventHandler);
        this.#boatTypeAttr.removeEventListener('change', this.#firstChangeValueOnBoatTypeEventHandler);
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
            case 'location':
                this.location = newValue;
                break;
            case 'date':
                this.date = newValue;
                // console.log(this?.#dateAttr?.value); // 2024-11-15
                // console.log(this?.#dateAttr?.valueAsDate); // Thu Nov 14 2024 18:00:00 GMT-0600 (Central Standard Time)
                // console.log(this?.#dateAttr?.valueAsNumber); // 1731628800000
                break;
            case 'boat-type':
                this.boatType = newValue;
                break;
            case 'required-search-inputs':
                this.requiredSearchInputs = newValue;
                break;
            default:
                break;
        }
    }
}