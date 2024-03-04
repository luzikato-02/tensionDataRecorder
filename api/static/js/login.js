$(document).ready(function () {
    $('#login-form').submit(function (e) {
        e.preventDefault();

        var formData = {
            username: $('#username-col').val(),
            password: $('#password-col').val()
        };

        console.log('Form Data:', formData);
        let alertContainer = document.querySelector("#alertContainer");

        $.ajax({
            type: 'POST',
            url: '/user_login',
            contentType: 'application/json',
            data: JSON.stringify(formData), 
            success: function (response) {
                console.log(response);
                if (response.success) {
                    // Show the success modal
                    $('#successModal').modal('show');
                    setTimeout(function () {
                        window.location.href = "/";
                    }, 2000); // Redirect after 2 seconds
                } else {
                    alertContainer.innerHTML = `
                    <div id="alert" class="alert alert-danger alert-dismissible fade show" role="alert">
                        <strong>Astagfirullah!</strong> Invalid crendentials. Please try again.
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>
                    `
                }
            },
            error: function () {
                $('#errorModal').modal('show');
            }
        });
    });
});