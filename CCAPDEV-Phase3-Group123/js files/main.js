document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const logoutButton = document.getElementById('logoutButton');
    const registerForm = document.getElementById('registerForm');
    const deleteUserButton = document.getElementById('deleteUserButton');

    // LOGIN
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('rememberMe').checked;
            const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));

            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const user = await response.json();

                if (response.ok) {
                    alert(`Welcome, ${user.name}`);
                    sessionStorage.setItem('loggedInUser', JSON.stringify(user));

                    if (rememberMe) {
                        const rememberMeData = {
                            user,
                            expiry: new Date().getTime() + 3 * 7 * 24 * 60 * 60 * 1000
                        };
                        localStorage.setItem('rememberMe', JSON.stringify(rememberMeData));
                    }

                    window.location.href = 'mainMenu'


                } else {
                    alert(user.message || 'Login failed!');
                }
            } catch {
                alert('Error logging in!');
            }
        });

    }

    //REGISTER
    document.addEventListener('DOMContentLoaded', () => {
        const registerForm = document.getElementById('registerForm');

        if (registerForm) {
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                const formData = new FormData(registerForm);

                const response = await fetch('/submit-registration', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: formData
                });

                const result = await response.json();

                if (response.ok) {
                    alert('Registration successful!');
                    window.location.href = 'login';
                } else {
                    alert(result.message || 'Registration failed!');
                }
            });
        }
    });

    // REMEMBER ME
    const currentPage = window.location.pathname === '/' ? 'landingpage' : '';
    if (currentPage === 'landingpage') {
        const rememberMeData = JSON.parse(localStorage.getItem('rememberMe'));
        if (rememberMeData) {
            const currentTime = new Date().getTime();
            if (currentTime < rememberMeData.expiry) {
                sessionStorage.setItem('loggedInUser', JSON.stringify(rememberMeData.user));
                const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));

                window.location.href = (loggedInUser.role === 'student') ? 'mainMenu' : 'adminMenu';
            } else {
                localStorage.removeItem('rememberMe');
            }
        }
    }

    //LOGOUT
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            sessionStorage.removeItem('loggedInUser');
            localStorage.removeItem('rememberMe');
            window.location.href = '/';
        });

    }

});

// FOR VIEW LAB AVAIL PROFILE
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const reservationId = urlParams.get('reservationId');

    if (reservationId) {
        try {
            const response = await fetch(`/api/reservation/${reservationId}`);
            const reservation = await response.json();

            document.getElementById('lab').value = reservation.lab;
            document.getElementById('date').value = new Date(reservation.date).toISOString().split('T')[0];
            document.getElementById('time').value = reservation.time;
            document.getElementById('seatId').value = reservation.seatId;
            document.getElementById('anonymous').checked = reservation.anonymous;
        } catch (error) {
            console.error('Error fetching reservation details:', error);
        }
    }
});