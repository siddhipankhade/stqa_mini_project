const form = document.getElementById("bookingForm");
const message = document.getElementById("message");
const cancel = document.getElementById("cancelButton");
const date = document.getElementById("date");
let booked = [], current = null;
// Local (not UTC) today, so "today" is correct in every timezone
const now = new Date();
date.min = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

form.addEventListener("submit", e => {
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const slot = document.getElementById("slot").value;
    const key = date.value + slot;
    message.textContent = "";

    if (!name || !email || !date.value || !slot) {
        message.textContent = "Please complete all fields.";
        message.className = "error";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        message.textContent = "Enter a valid email address.";
        message.className = "error";
    } else if (date.value < date.min) {
        message.textContent = "Past dates are not allowed.";
        message.className = "error";
    } else if (booked.includes(key)) {
        message.textContent = "This time slot is unavailable.";
        message.className = "error";
    } else {
        current = key;
        booked.push(key);
        message.textContent = "Appointment confirmed for " + name + ".";
        message.className = "success";
        cancel.hidden = false;
    }
});

cancel.addEventListener("click", () => {
    booked = booked.filter(x => x !== current);
    current = null;
    message.textContent = "Appointment cancelled.";
    message.className = "info";
    cancel.hidden = true;
});
