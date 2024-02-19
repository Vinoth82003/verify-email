$(document).ready(function() {
    $("#submit").click(function() {
        var formData = {
            fname: $("#fname").val(),
            lname: $("#lname").val(),
            password: $("#password").val(),
            email: $("#email").val()
        };

        $.ajax({
            type: "POST",
            url: "/register", // Replace this URL with your backend endpoint
            data: JSON.stringify(formData),
            contentType: "application/json",
            success: function(response) {
                console.log("Registration successful:", response);
                // You can add further actions here, like redirecting to a new page
            },
            error: function(err) {
                console.error("Error during registration:", err);
                // Handle errors here
            }
        });
    });
});
