class ReservationCard extends HTMLElement {
    static {
        window.customElements.define('reservation-card', this);
    }
    static get observedAttributes() {
        return ['price-per-hour'];
    }

    constructor() {
        super();
    }

    get pricePerHour() {
        return this.getAttribute('price-per-hour');
    }
    set pricePerHour(value) {
        if (value === null || value === undefined || value?.trim() === '')  {
            this.removeAttribute('price-per-hour');
        } else {
            this.setAttribute('price-per-hour', value);
        }
    }
    connectedCallback() {
        this.shadowRoot.addEventListener("submit", this);
    }
    handleEvent(event) {
        if (event.type === "submit") {
            this.#submitReservationEventHandler(event);
        }
    }
    #submitReservationEventHandler(event) {
        event.preventDefault();
        console.log('Reservation Submitted!')
    }
    disconnectedCallback() {
        this.removeEventListener('submit', this.#submitReservationEventHandler);
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) {
            return;
        }
        switch (name) {
            case 'price-per-hour':
                this.pricePerHour = newValue;
                break;
            default:
                break;
        }
    }
}