function generateSeats(rows, cols) {
    const seats = [];
    let id = 1;
    for (let row = 1; row <= rows; row++) { 
        for (let col = 1; col <= cols; col++) { 
            seats.push({ id: id, available: true, user: null, reservationDate: null, seat: `Seat ${id}` });
            id++; 
        }
    }
    return seats;
}  
const seats = {
    lab1: generateSeats(5, 5),
    lab2: generateSeats(5, 5),
    lab3: generateSeats(5, 5),
    lab4: generateSeats(5, 5),
    lab5: generateSeats(5, 5)
};

async function loadAvailability() {
    const lab = document.getElementById('labs').value;
    const selectedDate = new Date(document.getElementById('date').value);
    const selectedTime = document.getElementById('time').value;
    const availabilityDiv = document.getElementById('lab-availability');
    availabilityDiv.innerHTML = '';
    availabilityDiv.classList.add('lab-availability');

  
    const response = await fetch(`/api/reservations?lab=${lab}&date=${selectedDate.toISOString().split('T')[0]}&time=${selectedTime}`);
    const reservations = await response.json();

    seats[lab].forEach(seat => {
        const seatDiv = document.createElement('div');
        seatDiv.className = 'seat';

        const reservation = reservations.find(res => res.seatId === seat.id);

        if (reservation) {
            seat.user = reservation.anonymous ? 'Anonymous' : reservation.userName;
            seat.reservationDate = new Date(reservation.date);
            seat.available = false;

            const userLink = document.createElement('a');
            userLink.href = '#';
            userLink.textContent = seat.user;
            seatDiv.appendChild(userLink);
            seatDiv.classList.add('lab-reserved');
        } else {
            seat.available = true;
            seat.reservationDate = null;

            seatDiv.textContent = 'Available';
            seatDiv.classList.add('lab-available');
            seatDiv.addEventListener('click', () => {
                handleReservationLink(lab, selectedDate.toISOString(), selectedTime, seat.id);
            });
        }

        const seatName = document.createElement('div');
        seatName.textContent = seat.seat;
        seatDiv.appendChild(seatName);

        availabilityDiv.appendChild(seatDiv);
    });
}

function handleReservationLink(lab, date, time, seatId) {
    window.location.href = `reserve?lab=${lab}&date=${date}&time=${time}&seatId=${seatId}`;
}

function isSameDateTime(reservationDate, selectedDate, selectedTime) {
    const formattedReservationDate = new Date(reservationDate);
    const formattedSelectedDate = new Date(selectedDate);
    const formattedSelectedTime = new Date(`2000-01-01T${selectedTime}`);

    return (
        formattedReservationDate.getFullYear() === formattedSelectedDate.getFullYear() &&
        formattedReservationDate.getMonth() === formattedSelectedDate.getMonth() &&
        formattedReservationDate.getDate() === formattedSelectedDate.getDate() &&
        formattedReservationDate.getHours() === formattedSelectedTime.getHours() &&
        formattedReservationDate.getMinutes() === formattedSelectedTime.getMinutes()
    );
}

function updateAvailability() {
    loadAvailability();
}

function generateTimeOptions() {
    const select = document.getElementById('time');
    select.innerHTML = ''; 

    for (let hour = 9; hour <= 15; hour++) {
        for (let minute = 0; minute <= 30; minute += 30) {
            const option = document.createElement('option');
            const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            option.text = time;
            option.value = time;
            select.add(option);
        }
    }
}

document.addEventListener('DOMContentLoaded', generateTimeOptions);
loadAvailability();
setInterval(updateAvailability, 60000);

document.getElementById("cancel").addEventListener("click", function() {
    window.location.href = "mainMenu";
});

document.addEventListener('DOMContentLoaded', function() {
    generateTimeOptions();
    loadAvailability();
    setInterval(updateAvailability, 60000);

    document.getElementById("cancel").addEventListener("click", function() {
        window.location.href = "mainMenu";
    });
});