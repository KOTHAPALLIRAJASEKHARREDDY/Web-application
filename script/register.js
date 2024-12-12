document.addEventListener('DOMContentLoaded', () => {
    document.getElementById("signupForm").addEventListener("submit", function (event) {
        

        let email = document.querySelector('input[name="email"]').value;
        console.log(email);
        if (!email || !email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
            alert('enter a valid email Id');
            event.preventDefault();
            return;
        }
        let phone = document.querySelector('input[name="phone"]').value;
        console.log(phone);
        if (!phone || !phone.match(/^[0-9]{3}-[0-9]{3}-[0-9]{4}$/)) {
            alert('enter a valid email Id');
            event.preventDefault();
            return;
        }
        let ssn = document.querySelector('input[name="ssn"]').value;
        console.log(ssn);
        if (!ssn || !ssn.match(/^[0-9]{3}-[0-9]{2}-[0-9]{4}$/)) {
            alert('enter a valid SSN');
            event.preventDefault();
            return;
        }
        let password = document.querySelector('input[name="password"]').value;
        console.log(password);
        if (!password || !password.match(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*()_+=-]).{8,}$/))
        {
            alert('enter a valid password');
            event.preventDefault();
            return;
        }
        let verifyPassword = document.querySelector('input[name="verifyPassword"]').value;
        console.log(verifyPassword);
        if (!verifyPassword || !verifyPassword.match(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*()_+=-]).{8,}$/)) 
        {
            alert('enter a valid password');
            event.preventDefault();
            return;
        }
        if(password !== verifyPassword)
        {
            alert('Password and Verify-Password are not same');
            event.preventDefault();
            return;
        }
    }
}
        