/**
 * seed.mjs: This file is typically used to populate your database with initial data for development or testing
 * purposes. It's not considered part of the core application logic.
 */
import fs from "node:fs/promises";
import Database from '../src/models/database.mjs';
import data from "./data.json" with { type: 'json' };
import User from "../src/models/user.mjs";
import Address from "../src/models/address.mjs";
import Boat from "../src/models/boat.mjs";
import Image from "../src/models/image.mjs";
import DB from "../config/db.mjs";
import Booking from "../src/models/booking.mjs";


data.forEach(user => {
    const userObj = new User(user.email, user.password, user.userType, user.username);
    user.id = Database.insert(userObj);
    user?.boats?.forEach((boat) => {
        const address = new Address(boat?.address?.state, boat?.address?.city, boat?.address?.country, boat?.address?.zipCode, boat?.address?.street);
        boat.address.id = Database.insert(address);
        const boatObj = new Boat(user.id, boat.address.id, boat?.type, boat?.pricePerHour, boat?.title, boat?.description);
        boat.id = Database.insert(boatObj);
        // const booking = new Booking(user.id, boat.id, checkIn, checkOut, hoursReserved, ownerAmount, serviceFee);
        // bookingId = Database.insert(booking);
        boat?.images?.forEach((image, index) => {
            const imageObj = new Image(boat.id, image?.pathName, image?.name, image?.type, image?.size, index, '/tasks/uploads/images');
            image.id = Database.insert(imageObj);
        })
        boat?.bookings?.forEach((booking) => {
            const bookingObj = new Booking(booking?.renterId, boat.id, booking?.checkIn, booking?.checkOut, booking?.hoursReserved, booking?.ownerAmount, booking?.serviceFee);
            booking.id = Database.insert(bookingObj);
        })
    })
})
//3518893
const imageObj = new Image(null, 'seed_profile_picture1.jpg', 'seed_profile_picture1', 'image/jpeg', 3518893, 0, '/tasks/uploads/images', 1);
Database.insert(imageObj);

const dataWithIds = JSON.stringify(data, null, 2);

await fs.writeFile('tasks/data-with-ids.json', dataWithIds, {encoding: 'utf8'});
DB.closePhysicalDBConnection();