document.addEventListener("DOMContentLoaded", function () {
  // Parse query parameters to get product IDs
  const urlParams = new URLSearchParams(window.location.search);
  const productIds = urlParams.get("productIds").split(",");

  const user = JSON.parse(localStorage.getItem("user_data"));
  // Fetch product details using product IDs
  fetch("/getProductsByIds", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user: user, productIds: productIds }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      const orderDetails = document.getElementById("order-details");
      orderDetails.innerHTML = ""; // Clear existing content
      const user = JSON.parse(localStorage.getItem("user_data"));
      data.data.forEach((product) => {
        const productCard = document.createElement("div");
        productCard.className = "product-card";
        productCard.innerHTML = `
        <p><strong>Customer Name:</strong> ${user["firstname"]} ${user["lastname"]}</p>
            <p><strong>Order ID:</strong> ${product._id}</p>
            <p><strong>Rental Rate:</strong> $${product.rental_rate}</p>
            <p><strong>Deposit Amount:</strong> $${product.deposit_amount}</p>
            <p><strong>Quantity:</strong> ${product.quantity}</p>
            <p><strong>Insurance:</strong> ${product.insurance_status}</p>
            <p><strong>Delivery Type:</strong> ${product.delivery_type}</p>
            <p><strong>Delivery Date:</strong> ${product.rental_start_date}</p>
          `;
        if (product.delivery_type === "pickup") {
          productCard.innerHTML += `
              <div class="details-section">
                <h3>Pickup Details:</h3>
                <p><strong>Pickup Location:</strong> Tech Store - Downtown</p>
                <p><strong>Pickup Time:</strong> ${product.rental_start_date}</p>
              </div>
            `;
        } else if (product.delivery_type === "delivery") {
          productCard.innerHTML += `
              <div class="details-section">
                <h3>Delivery Details:</h3>
                <p><strong>Delivery Address:</strong> ${user.address}</p>
                <p><strong>Delivery Date:</strong> ${product.rental_start_date}</p>
              </div>
            `;
        }

        orderDetails.appendChild(productCard);
      });
      const backHomeBtn = document.createElement("button");
      backHomeBtn.id = "back-home-btn";
      backHomeBtn.textContent = "Back to Homepage";
      backHomeBtn.onclick = redirectToHome;
      orderDetails.appendChild(backHomeBtn);
      localStorage.removeItem("checkoutProducts");
    })
    .catch((error) => {
      console.error("Error fetching product details:", error);
    });
});

function redirectToHome() {
  window.location.href = "/"; // Adjust the path as needed
}
