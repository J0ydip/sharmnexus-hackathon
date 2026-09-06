document.addEventListener('DOMContentLoaded', () => {
    // 1. Fetch bookings from LocalStorage
    const storedBookings = localStorage.getItem('shramnexus-bookings');
    
    if (!storedBookings) {
        // If no booking exists, show error and redirect back to home
        alert("No recent booking found. Redirecting to home page.");
        window.location.href = 'index.html';
        return;
    }

    const bookings = JSON.parse(storedBookings);
    
    // Get the most recent booking (the last one in the array)
    const latestBooking = bookings[bookings.length - 1];

    // 2. Generate a random Booking ID
    const randomId = Math.floor(1000 + Math.random() * 9000);
    document.getElementById('slip-id').innerText = `SNX-${randomId}`;

    // 3. Populate the DOM with the booking data
    document.getElementById('slip-service').innerText = latestBooking.service || "N/A";
    document.getElementById('slip-worker').innerText = latestBooking.worker || "N/A";
    
    // Format Date safely
    const dateVal = latestBooking.date ? new Date(latestBooking.date).toLocaleDateString('en-IN', {
        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
    }) : "N/A";
    document.getElementById('slip-date').innerText = dateVal;
    
    // Format Time
    document.getElementById('slip-time').innerText = latestBooking.time || "N/A";
    
    // Customer Info
    document.getElementById('slip-name').innerText = latestBooking.name || "N/A";
    document.getElementById('slip-phone').innerText = latestBooking.phone || "N/A";
    document.getElementById('slip-address').innerText = latestBooking.address || "N/A";
    document.getElementById('slip-req').innerText = latestBooking.requirements || "No special requirements provided.";

    // 4. Handle Print Button
    const printBtn = document.getElementById('btn-print');
    if (printBtn) {
        printBtn.addEventListener('click', () => {
            window.print();
        });
    }
});