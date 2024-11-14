import html from "../../utils/html.mjs";
import {formatDate} from "../../utils/helpers.mjs";
/**
 *
 * bookings [] ->
 * {
 *   "id": 1,
 *   "checkIn": "2024-11-13 14:30:00",
 *   "checkOut": "2024-11-13 16:00:00",
 *   "hoursReserved": 1.5,
 *   "boatPricePerHour": 555,
 *   "ownerAmount": 750,
 *   "serviceFee": 5,
 *   "boatId": 3,
 *   "boatTitle": "Elegant 30ft boat (1000hp): With crew included!",
 *   "boatOwnerId": 1,
 *   "boatOwnerUsername": "John Inc & Boats",
 *   "boatOwnerEmail": "john@gmail.com"
 * }
 * @param props
 * @param children
 * @return {string|*}
 * @constructor
 */
export default function Bookings(props, children) {
    const formatter = new Intl.NumberFormat('en-US');
    return (
        html`
            <main id="bookings">
                ${props?.bookings?.length > 0 ? `<h2>Your Upcoming Bookings</h2>` : `<h2>You have not made any booking yet</h2>`}
                <section>
                    ${props?.bookings?.map((booking) => (
                            html`
                                <article>
                                    <header>
                                        <time datetime="${booking?.checkIn?.split(' ')[0]}">
                                            <strong>${formatDate(booking?.checkIn)?.day}<sup>${formatDate(booking?.checkIn)?.daySuffix}</sup></strong>
                                            <span>${formatDate(booking?.checkIn)?.month}
                                                , ${formatDate(booking?.checkIn)?.weekday}</span>
                                        </time>
                                        <mark>
                                            <strong><sup>$</sup>${formatter.format(booking?.ownerAmount + booking?.serviceFee)}</strong>
                                        </mark>
                                    </header>
                                    <section>
                                        <strong><a href="/boats/${booking?.boatId}">${booking?.boatTitle}</a></strong>
                                        <dl>
                                            <dt>Check In</dt>
                                            <dd>
                                                <time datetime="${booking?.checkIn?.split(' ')?.[1]?.slice(0, -3)}">
                                                    ${booking?.checkIn?.split(' ')[1]?.slice(0, -3)}
                                                </time>
                                            </dd>
                                            <dt>Check Out</dt>
                                            <dd>
                                                <time datetime="${booking?.checkOut?.split(' ')?.[1]?.slice(0, -3)}">
                                                    ${booking?.checkOut?.split(' ')[1]?.slice(0, -3)}
                                                </time>
                                            </dd>
                                            <dt>Owner Name</dt>
                                            <dd>${booking?.boatOwnerUsername}</dd>
                                            <dt>Owner Contact</dt>
                                            <dd>
                                                <a href="mailto: ${booking?.boatOwnerEmail}">${booking?.boatOwnerEmail}</a>
                                            </dd>
                                        </dl>
                                    </section>
                                </article>`
                    ))}
                </section>
            </main>`
    )
}