$(document).ready(function(){
    {% if status == 'login_success' %}
    $('#successModal').modal('show');
    {% if status == 'invalid_cred' %}
    $('#errorModal').modal('show');
    {% endif %}
});