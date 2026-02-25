const form = document.getElementById("login-form");
const message = document.getElementById("message");

form.addEventListener("submit", function(event){
	event.preventDefault();



	const email = document.getElementById("email").value.trim().toLowerCase();
	const password = document.getElementById("password").value;

	const correctPassword = "12345678";


	if(password !== correctPassword){
		message.textContent = "Wrong password.";
		return;
	}


	if(email === "student@concordia.ca"){
		window.location.href = "#student";
	}
	else if(email === "teacher@concordia.ca"){
		window.location.href = "#teacher";
	}
	else{
		message.textContent = "Wrong email.";
	}

    
});