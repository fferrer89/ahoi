class ReservationCard extends HTMLElement {
    static {
        window.customElements.define('reservation-card', this);
    }
    static get observedAttributes() {
        return ['price-per-hour', 'service-fee'];
    }
    #checkIn;
    #checkOut;
    #priceSummary;
    #hoursReserved;
    #priceOwner;
    #totalPrice;
    constructor() {
        super();
    }

    get pricePerHour() {
        const pricePerHourStr = this.getAttribute('price-per-hour');
        return parseInt(pricePerHourStr, 10);
    }
    set pricePerHour(value) {
        if (value === null || value === undefined || value?.trim() === '')  {
            this.removeAttribute('price-per-hour');
        } else {
            this.setAttribute('price-per-hour', value);
        }
    }
    get serviceFee() {
        const pricePerHourStr = this.getAttribute('service-fee');
        return parseInt(pricePerHourStr, 10);
    }
    set serviceFee(value) {
        if (value === null || value === undefined || value?.trim() === '')  {
            this.removeAttribute('service-fee');
        } else {
            this.setAttribute('service-fee', value);
        }
    }
    connectedCallback() {
        this.#checkIn = this.shadowRoot.querySelector('input[type="datetime-local"]#check-in');
        this.#checkOut = this.shadowRoot.querySelector('input[type="datetime-local"]#check-out');
        this.#priceSummary = this.shadowRoot.querySelector('footer#price-summary');
        this.#checkIn.addEventListener('change', this.#changeCheckInDateEventHandler.bind(this));
        this.#checkOut.addEventListener('change', this.#calculateReservationPriceEventHandler.bind(this));
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
    #changeCheckInDateEventHandler(event) {
        if (this.#checkIn?.validity?.valid) {
            const startTimeNew = new Date(this.#checkIn.valueAsNumber + (1000 * 60 * 60));
            console.log(startTimeNew.toISOString().slice(0, 16));
            this.#checkOut.min = startTimeNew.toISOString().slice(0, 16);
            this.#checkOut.value = startTimeNew.toISOString().slice(0, 16);
        }
        this.#calculateReservationPriceEventHandler(event);
    }
    #calculateReservationPriceEventHandler(event) {
        console.log('Checkout changed!')
        // console.log(this.#checkOut?.value); // 2024-11-10T00:26
        // console.log(this.#checkOut?.valueAsNumber); // 1731238200000 (timestamp (in milliseconds))
        const millisecondsDifference = (this.#checkOut?.valueAsNumber - this.#checkIn?.valueAsNumber);
        this.#hoursReserved = millisecondsDifference / (1000 * 60 * 60);
        if (this.#checkOut?.validity?.valid && this.#checkIn?.validity?.valid && this.#hoursReserved > 0) {
            const millisecondsDifference = (this.#checkOut?.valueAsNumber - this.#checkIn?.valueAsNumber);
            this.#hoursReserved = millisecondsDifference / (1000 * 60 * 60);
            this.#priceOwner = this.pricePerHour * this.#hoursReserved;
            this.#totalPrice = this.#priceOwner + this.serviceFee;
            console.log(this.#hoursReserved);
            console.log(this.#priceOwner);
            // Update the footer to include the price summary
            this.#createPriceSummaryFooter();
        } else {
            this.#priceSummary.hidden = true;
        }
    }
    #createPriceSummaryFooter() {
        const formatter = new Intl.NumberFormat('en-US'); // 'en-US' for US English locale
        const priceSummary = this.shadowRoot.querySelector('footer#price-summary');
        const priceOwnerHeader = this.shadowRoot.querySelector('tr#price-owner > th');
        const priceOwner = this.shadowRoot.querySelector('tr#price-owner > td');
        const serviceFee = this.shadowRoot.querySelector('tr#service-fee > td');
        const priceTotal = this.shadowRoot.querySelector('tr#total-price > td');

        // Price Owner Header
        priceOwnerHeader.innerHTML = '';
        // Create the currency symbol span
        let currencySymbol = document.createElement('span');
        currencySymbol.classList.add('currency-symbol');
        currencySymbol.textContent = '$';

        // Create the hourly rate and hours worked elements
        const hourlyRateElement = document.createElement('span');
        hourlyRateElement.textContent = this.pricePerHour.toString();

        const hoursWorkedElement = document.createElement('sub');
        hoursWorkedElement.textContent = `/hour`;

        const multiplicationElement = document.createElement('span');
        multiplicationElement.textContent = ` x ${this.#hoursReserved} hours`;
        // Append the elements to the th
        priceOwnerHeader.appendChild(currencySymbol);
        priceOwnerHeader.appendChild(hourlyRateElement);
        priceOwnerHeader.appendChild(hoursWorkedElement);
        priceOwnerHeader.appendChild(multiplicationElement);

        // Price Owner
        priceOwner.innerHTML = '';
        currencySymbol = document.createElement('span');
        currencySymbol.classList.add('currency-symbol');
        currencySymbol.textContent = '$';
        const ownerPriceElement = document.createElement('span');
        ownerPriceElement.textContent = formatter.format(this.#priceOwner);
        priceOwner.appendChild(currencySymbol);
        priceOwner.appendChild(ownerPriceElement);

        // Service Fee
        serviceFee.innerHTML = '';
        currencySymbol = document.createElement('span');
        currencySymbol.classList.add('currency-symbol');
        currencySymbol.textContent = '$';
        const serviceFeeElement = document.createElement('span');
        serviceFeeElement.textContent = this.serviceFee.toString();
        serviceFee.appendChild(currencySymbol);
        serviceFee.appendChild(serviceFeeElement);

        // Total Price
        priceTotal.innerHTML = '';
        currencySymbol = document.createElement('span');
        currencySymbol.classList.add('currency-symbol');
        currencySymbol.textContent = '$';
        const totalPriceElement = document.createElement('span');
        totalPriceElement.textContent = formatter.format(this.#totalPrice);
        priceTotal.appendChild(currencySymbol);
        priceTotal.appendChild(totalPriceElement);

        priceSummary.hidden = false;
    }
    disconnectedCallback() {
        this.removeEventListener('submit', this.#submitReservationEventHandler);
        this.removeEventListener('change', this.#changeCheckInDateEventHandler);
        this.removeEventListener('change', this.#calculateReservationPriceEventHandler);
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) {
            return;
        }
        switch (name) {
            case 'price-per-hour':
                this.pricePerHour = newValue;
                break;
            case 'service-fee':
                this.serviceFee = newValue;
                break;
            default:
                break;
        }
    }
}