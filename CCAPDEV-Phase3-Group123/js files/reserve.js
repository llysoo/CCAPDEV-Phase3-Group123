document.addEventListener('DOMContentLoaded', () => {
    const labSelect = document.getElementById('lab-select');
    const dateSelect = document.getElementById('date-select');
    const timeSelect = document.getElementById('time-select');
    const seatSelect = document.getElementById('seat-select');
    const reservationForm = document.getElementById('reservation-form');
    const successMessage = document.getElementById('success-message');

    const urlParams = new URLSearchParams(window.location.search);
    const initialLab = urlParams.get('lab');
    const initialDate = urlParams.get('date');
    const initialTime = urlParams.get('time');
    const initialSeatId = urlParams.get('seatId');


    labSelect.textContent = initialLab || 'Not selected';
    dateSelect.textContent = initialDate.split('T')[0] || 'Not selected';
    timeSelect.textContent = initialTime || 'Not selected';
    seatSelect.textContent = initialSeatId ? `Seat ${initialSeatId}` : 'Not selected';

    async function submitReservation(event) {
        event.preventDefault();

        successMessage.style.display = 'none';

        const anonymous = document.getElementById('anonymous').checked;

        const reservationData = {
            lab: initialLab,
            date: initialDate,
            time: initialTime,
            seatId: initialSeatId,
            anonymous
        };

        try {
            const response = await fetch('/submit-reservation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(reservationData),
            });

            if (response.ok) {
                successMessage.style.display = 'block';
                reservationForm.reset();
            } else {
                const errorData = await response.json();
                console.error('Error:', errorData.message);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    function goBack() {
        const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
        window.location.href = 'mainMenu';
    }

    reservationForm.addEventListener('submit', submitReservation);
    document.getElementById('backButton').addEventListener('click', goBack);
});
