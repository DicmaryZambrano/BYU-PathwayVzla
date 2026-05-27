async function login() {

    const username =
        document.getElementById('username').value;

    const password =
        document.getElementById('password').value;

    const response = await fetch(
        '/api/admin/login',
        {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({
                username,
                password
            })
        }
    );

    if (!response.ok) {

        document
            .getElementById('error')
            .textContent = 'Invalid credentials';

        return;
    }

    sessionStorage.setItem(
        'admin_username',
        username
    );

    sessionStorage.setItem(
        'admin_password',
        password
    );

    window.location.href =
        'admin.html';
}