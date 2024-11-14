class BookingCard extends HTMLElement {
    static {
        window.customElements.define('booking-card', this);
    }
    static get observedAttributes() {
        return ['price-per-hour', 'service-fee', 'boat-id', 'user-id'];
    }
    #form;
    #checkIn;
    #checkOut;
    #priceSummary;
    #hoursReserved;
    #priceOwner;
    #totalPrice;
    #submitBtn;
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
    get userId() {
        return this.getAttribute('user-id');
    }
    set userId(value) {
        if (value === null || value === undefined || value?.trim() === '')  {
            this.removeAttribute('user-id');
        } else {
            this.setAttribute('user-id', value);
        }
    }
    connectedCallback() {
        this.#form = this.shadowRoot.querySelector('form[method="post"]');
        this.#checkIn = this.shadowRoot.querySelector('input[type="datetime-local"]#check-in');
        this.#checkOut = this.shadowRoot.querySelector('input[type="datetime-local"]#check-out');
        this.#submitBtn = this.shadowRoot.querySelector('button[type="submit"]');
        this.#priceSummary = this.shadowRoot.querySelector('footer#price-summary');
        this.#checkIn.addEventListener('change', this.#changeCheckInDateEventHandler.bind(this));
        this.#checkOut.addEventListener('change', this.#changeCheckOutDateEventHandler.bind(this));
        this.shadowRoot.addEventListener("submit", this);
    }
    handleEvent(event) {
        if (event.type === "submit") {
            this.#submitBookingEventHandler(event);
        }
    }
    #submitBookingEventHandler(event) {
        if (!this.userId) {
            this.#submitBtn.setCustomValidity('Log in as a Boat Renter to make a reservation');
            this.#submitBtn.reportValidity();
            event.preventDefault();
        }
        // Update the action route endpoint
        this.#form.action = `/boats/${this.boatId}/bookings`;
        // TODO: Send email with reservation details to renter and owner (and admin member?)
    }
    #changeCheckInDateEventHandler(event) {
        this.#checkIn?.reportValidity();
        if (this.#checkIn?.validity?.valid) {
            const startTimeNew = new Date(this.#checkIn.valueAsNumber + (1000 * 60 * 60));
            this.#checkOut.min = startTimeNew.toISOString().slice(0, 16);
            this.#checkOut.value = startTimeNew.toISOString().slice(0, 16);
        }
        this.#calculateBookingPriceEventHandler(event);
    }
    #changeCheckOutDateEventHandler(event) {
        this.#checkOut?.reportValidity();
        this.#calculateBookingPriceEventHandler(event);
    }
    #calculateBookingPriceEventHandler(event) {
        // console.log(this.#checkOut?.value); // 2024-11-10T00:26
        // console.log(this.#checkOut?.valueAsNumber); // 1731238200000 (timestamp (in milliseconds))
        const millisecondsDifference = (this.#checkOut?.valueAsNumber - this.#checkIn?.valueAsNumber);
        this.#hoursReserved = millisecondsDifference / (1000 * 60 * 60);
        if (this.#checkOut?.validity?.valid && this.#checkIn?.validity?.valid && this.#hoursReserved > 0) {
            const millisecondsDifference = (this.#checkOut?.valueAsNumber - this.#checkIn?.valueAsNumber);
            this.#hoursReserved = millisecondsDifference / (1000 * 60 * 60);
            this.#priceOwner = this.pricePerHour * this.#hoursReserved;
            this.#totalPrice = this.#priceOwner + this.serviceFee;
            // Update the footer to include the price summary
            this.#submitBtn.textContent = 'Reserve';
            this.#createPriceSummaryFooter();
        } else {
            this.#submitBtn.textContent = 'Check availability';
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
        this.removeEventListener('submit', this.#submitBookingEventHandler);
        this.removeEventListener('change', this.#changeCheckInDateEventHandler);
        this.removeEventListener('change', this.#calculateBookingPriceEventHandler);
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
            case 'boatId':
                this.boatId = newValue;
                break;
            case 'userId':
                this.userId = newValue;
                break;
            default:
                break;
        }
    }
}