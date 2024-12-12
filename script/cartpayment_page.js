document.addEventListener("DOMContentLoaded", function () {
  const products_list = localStorage.getItem("checkoutProducts");
  const products = JSON.parse(products_list);
  let total_amount = products.reduce((acc, product) => {
    const rentalRate = parseFloat(product.rental_rate);
    const depositAmount = parseFloat(product.deposit_amount);
    const quantity = parseInt(product.quantity);
    return acc + (rentalRate + depositAmount) * quantity;
  }, 0);

  document.getElementById(
    "cart-total-amount"
  ).innerText = `$${total_amount.toFixed(2)}`;

  const paymentForm = document.getElementById("payment-form");
  paymentForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const formData = new FormData(paymentForm);
    const paymentData = {
      card_type: formData.get("card_type"),
      name_on_card: formData.get("name_on_card"),
      card_number: formData.get("card_number"),
      expiration_date: formData.get("expiration_date"),
      cvc: formData.get("cvc"),
      zip: formData.get("zip"),
      amount: total_amount,
    };

    console.log("Payment Data:", paymentData);

    // Retrieve products and user data from localStorage
    const products = JSON.parse(localStorage.getItem("checkoutProducts"));
    const user = JSON.parse(localStorage.getItem("user_data"));
    callPaymentAPI(paymentData, products, user);
  });
});

const callPaymentAPI = (paymentData, products, user) => {
  fetch("/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user: user,
      products: products,
      paymentData: paymentData,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "success") {
        alert("Checkout successful!");
        localStorage.removeItem("cart");
        window.dispatchEvent(new Event("cartUpdated"));
        const productIds = data.data.products
          .map((product) => product._id)
          .join(",");
        const queryParams = `?productIds=${productIds}`;

        // Redirect to confirmation page with query parameters
        window.location.href = `/checkoutConfirmation${queryParams}`;

        //callGetProducts();
      } else {
        alert("Checkout failed. Please try again.");
      }
    });
};

function formatCardNumber(event) {
  let input = event.target;
  let value = input.value.replace(/\D/g, ""); // Remove non-digit characters
  let formattedValue = "";

  // Format the value in groups of 4 digits
  for (let i = 0; i < value.length; i++) {
    if (i > 0 && i % 4 === 0) {
      formattedValue += "-";
    }
    formattedValue += value[i];
  }

  input.value = formattedValue;
}

function formatExpirationDate(event) {
  let input = event.target;
  let value = input.value.replace(/\D/g, ""); // Remove non-digit characters
  let formattedValue = "";

  // Add a slash after two digits (MM/YY format)
  if (value.length >= 2) {
    formattedValue = value.slice(0, 2) + "/" + value.slice(2, 4);
  } else {
    formattedValue = value;
  }

  input.value = formattedValue;
}
