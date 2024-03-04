$(document).ready(function () {
    $('#login-form').submit(function (e) {
        e.preventDefault();

        var formData = {
            username: $('#username-input').val(),
            password: $('#password-input').val()
        };

        console.log('Form Data:', formData);

        $.ajax({
            type: 'POST',
            url: '/user_login',
            data: formData,
            dataType: 'json',
            success: function (data) {
                console.log('Success Response:', data);
                if (data.success) {
                    $('#successModal').modal('show');
                    setTimeout(function () {
                        window.location.href = "{{ url_for('home') }}";
                    }, 2000); // Redirect after 2 seconds
                } else {
                    console.log('Error Message:', data.error);
                    $('#alertMessage').text(data.error);
                    $('#alert').show();
                }
            },
            error: function (xhr, status, error) {
                console.error('Ajax Error:', xhr.responseText);
                $('#errorModal').modal('show');
            }
        });
    });
});