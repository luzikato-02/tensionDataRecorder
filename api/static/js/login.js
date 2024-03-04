$(document).ready(function () {
    $('#login-form').submit(function (event) {
        event.preventDefault(); // Prevent the form from submitting in the traditional way

        var formData = {
            username: $('#username').val(),
            password: $('#password').val(),
        };

        // Send an AJAX request to the server
        $.ajax({
            type: 'POST',
            url: "{{ url_for('auth_user') }}",  // Replace with your actual server endpoint
            data: JSON.stringify(formData),
            contentType: 'application/json',
            success: function (response) {
                if (response.success) {
                    // Show the success modal
                    $('#successModal').modal('show');
                    setTimeout(function () {
                        window.location.href = "{{ url_for('home') }}";
                    }, 2000); // Redirect after 2 seconds
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