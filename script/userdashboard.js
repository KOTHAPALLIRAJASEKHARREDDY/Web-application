document.addEventListener("DOMContentLoaded", function () {
  const userData = JSON.parse(localStorage.getItem("user_data"));
  if (userData) {
    document.getElementById("user-name").textContent = userData.firstname;
    document.getElementById("profile-letter").textContent = userData.firstname
      .charAt(0)
      .toUpperCase();
  }
  callGetRentals();
});

const profileIcon = document.getElementById("profile-icon");
const profileUpload = document.getElementById("profile-upload");
const profileLetter = document.getElementById("profile-letter");

// Event listener for clicking on the profile icon to upload a picture
profileIcon.addEventListener("click", () => {
  profileUpload.click();
});

// Event listener for handling the file upload
profileUpload.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      profileIcon.style.backgroundImage = `url(${e.target.result})`;
      profileLetter.style.display = "none";
    };
    reader.readAsDataURL(file);
  }
});

callGetRentals = () => {
  userid = JSON.parse(localStorage.getItem("user_data")).user_id;
  fetch("/getrentals/" + userid, {
    method: "GET",
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      const result = data.data;
      if (result.length == 0) {
        document.getElementById("no-rentals").style.display = "block";
        document.getElementById("history").style.display = "none";
        return;
      } else {
        document.getElementById("no-rentals").style.display = "none";
        document.getElementById("history").style.display = "block";
      }
      const ongoingRentals = result.filter(
        (rental) =>
          rental.return_status != "Returned" &&
          new Date(rental.rental_end_date) >= new Date()
      );
      populateOngoingRentals(ongoingRentals);
      const rentalHistory = result.filter(
        (rental) => rental.return_status == "Returned"
      );
      populateRentalHistory(rentalHistory);
    });
};

populateRentalHistory = (rentalHistory) => {
  const rentalHistoryContainer = document.getElementById("rental-history");
  rentalHistory.forEach((rental) => {
    const rentalElement = document.createElement("div");
    rentalElement.classList.add("rental-item");
    start_date = new Date(rental.rental_start_date).toISOString().split("T")[0];
    end_date = new Date(rental.rental_end_date).toISOString().split("T")[0];
    rentalElement.innerHTML = `
                <h4>${rental.appliance_brand} ${rental.appliance_model} - (${rental.appliance_type})</h4>
                <p>Start Date: ${start_date}</p>
                <p>End Date: ${end_date}</p>
                 <p>Return Status: ${rental.return_status}</p>
                `;
    rentalHistoryContainer.appendChild(rentalElement);
  });
};

populateOngoingRentals = (ongoingRentals) => {
  const ongoingRentalsContainer = document.getElementById("ongoing-rentals");
  ongoingRentals.forEach((rental) => {
    console.log(rental);
    const rentalElement = document.createElement("div");
    rentalElement.classList.add("rental-item");
    start_date = new Date(rental.rental_start_date).toISOString().split("T")[0];
    end_date = new Date(rental.rental_end_date).toISOString().split("T")[0];
    rentalElement.innerHTML = `
            <h4>${rental.appliance_brand} ${rental.appliance_model} - (${rental.appliance_type})</h4>
            <p>Start Date: ${start_date}</p>
            <p>End Date: ${end_date}</p>
            <p>Return Status: ${rental.return_status}</p>
            `;
    ongoingRentalsContainer.appendChild(rentalElement);
  });
};
