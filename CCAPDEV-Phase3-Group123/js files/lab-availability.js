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
            const userLink = document.createElement('a');

            if (reservation.anonymous) {
                userLink.textContent = 'Anonymous';
            } else {
                userLink.href = `/userprofile/${encodeURIComponent(reservation.userName)}`;
                userLink.textContent = reservation.userName;
            
            }

            seatDiv.appendChild(userLink);
            seatDiv.classList.add('lab-reserved');
        } else {
            seat.available = true;
            seat.reservationDate = null;

            seatDiv.textContent = 'Available';
            seatDiv.classList.add('lab-available');
            seatDiv.addEventListener('click', () => {
                handleReservationLink(lab, selectedDate.toISOString(), selectedTime, seat.id);
                highlightSeat(seatDiv);
            });
        }

        const seatName = document.createElement('div');
        seatName.textContent = seat.seat;
        seatDiv.appendChild(seatName);

        availabilityDiv.appendChild(seatDiv);
    });
}

async function handleReservationLink(lab, date, time, seatId) {
    const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));

    if (loggedInUser.role === 'student') {
        const url = `reserve?lab=${lab}&date=${date}&time=${time}&seatId=${seatId}`;
        window.location.href = url;
    } else if (loggedInUser.role === 'technician') {
        let studentName = document.getElementById('name').value;
        studentName = formatName(studentName);
        
        const isValidUser = await checkUserInDatabase(studentName);
        if (!isValidUser) {
            alert('The entered user name does not exist.');
            return;
        }
        
        const submitButton = document.getElementById('submit');
        submitButton.style.display = 'block';
        submitButton.onclick = () => {
            const url = `adminReserveDetails?lab=${lab}&date=${date}&time=${time}&seatId=${seatId}&userName=${encodeURIComponent(studentName)}`;
            window.location.href = url;
        };
    }
}

function formatName(name) {
    return name.split(' ')
               .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
               .join(' ');
}


function highlightSeat(selectedSeatDiv) {
    
    const allSeats = document.querySelectorAll('.seat');
    allSeats.forEach(seat => seat.classList.remove('selected-seat'));

    
    selectedSeatDiv.classList.add('selected-seat');
}

async function checkUserInDatabase(userName) {
    const response = await fetch(`/api/users?name=${encodeURIComponent(userName)}`);
    const users = await response.json();
    return users.length > 0;
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
    const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
    window.location.href = (loggedInUser.role === 'student') ? 'mainMenu' : 'adminMenu';
});

document.addEventListener('DOMContentLoaded', function() {
    generateTimeOptions();
    loadAvailability();
    setInterval(updateAvailability, 60000);

    document.getElementById("cancel").addEventListener("click", function() {
        const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
        window.location.href = (loggedInUser.role === 'student') ? 'mainMenu' : 'adminMenu';
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').setAttribute('min', today);
});
