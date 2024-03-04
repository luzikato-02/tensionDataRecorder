$(document).ready(function () {
    $('#login-form').submit(function (e) {
        e.preventDefault();

        var formData = {
            username: $('#username-col').val(),
            password: $('#password-col').val()
        };

        console.log('Form Data:', formData);

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
                } else {
                    $('#alertMessage').text('Invalid credentials. Please try again.');
                    $('#alert').show();
                }
            },
            error: function () {
                $('#errorModal').modal('show');
            }
        });
    });
});