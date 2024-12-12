document.addEventListener("DOMContentLoaded", function () {
  callGetProducts();
  updateCartBadge();
  // Listen for custom cart update events
  window.addEventListener("cartUpdated", updateCartBadge);

  // Listen for storage events (changes from other tabs/windows)
  window.addEventListener("storage", function (event) {
    if (event.key === "cart") {
      updateCartBadge();
    }
  });
});

let products = [];

// Function to update the cart badge
function updateCartBadge() {
  const user = JSON.parse(localStorage.getItem("user_data"));
  const cart = JSON.parse(localStorage.getItem("cart")) || {};

  const productIds = cart[user.username] || [];
  const cartBadge = document.getElementById("cart-count");
  cartBadge.innerText = productIds.length;
}

// Fetch products and display them
const callGetProducts = () => {
  const user = JSON.parse(localStorage.getItem("user_data"));
  const cart = JSON.parse(localStorage.getItem("cart")) || {};

  const products_list = cart[user.username] || [];
  if (products_list.length == 0) {
    document.getElementById("cart-items").innerHTML =
      "<h1>No products in cart</h1>";
    return;
  }

  fetch("/findProducts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      products: products_list,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      products = data.data.map((product) => ({
        ...product,
        quantity: 1,
        insurance: null,
        deliveryType: "pickup",
        deliveryDate: null,
        startingDate: null,
        endingDate: null,
      }));
      let totalRate = 0;
      let totalDeposit = 0;
      const productContainer = document.getElementById("cart-items");
      productContainer.innerHTML = "";
      products.forEach((product) => {
        const product_id = product._id;
        const productCard = document.createElement("div");
        totalRate =
          Number.parseInt(totalRate) + Number.parseInt(product.rental_rate);
        totalDeposit =
          Number.parseInt(totalDeposit) +
          Number.parseInt(product.deposit_amount);
        productCard.className = "product-card";
        productCard.innerHTML = `
          <img src="${product.image_url}" alt="${product.name}" />
          <div class="product-info">
            <h5>Appliance Name: ${product.brand} ${product.type}</h5>
            <p>Condition: ${product.condition}</p>
            <p>Rental Rate: $<span id="rental-rate-${product_id}">${product.rental_rate} per week</span></p>
            <p>Deposit Amount: $<span id="deposit-amount-${product_id}">${product.deposit_amount}</span></p>
            <span>
              <label for="quantity-${product_id}">Quantity:</label>
              <input type="number" id="quantity-${product_id}" class="quantity-input" value="${product.quantity}" min="1" onchange="updateProductTotal('${product_id}', ${product.rental_rate}, ${product.deposit_amount}, this.value)">
            </span>
            <div>
              <label>Insurance:</label>
              <input type="radio" name="insurance-${product_id}" value="Active" onchange="updateProductInsurance('${product_id}', this.value)"> Yes
              <input type="radio" name="insurance-${product_id}" value="InActive" onchange="updateProductInsurance('${product_id}', this.value)"> No
            </div>
            <div>
              <label>Delivery Type:</label>
              <input type="radio" name="delivery-type-${product_id}" value="pickup" onchange="updateProductDeliveryType('${product_id}', this.value)"> Pick-up
              <input type="radio" name="delivery-type-${product_id}" value="delivery" onchange="updateProductDeliveryType('${product_id}', this.value)"> Delivery
            </div>
            <input type="date" id="delivery-date-${product_id}" class="delivery-date-input" onchange="updateProductDeliveryDate('${product_id}', this.value)">
            <div>
              <label for="starting-date-${product_id}">Starting Date:</label>
              <input type="text" id="starting-date-${product_id}" class="starting-date-input" readonly>
            </div>
            <div>
              <label for="ending-date-${product_id}">Ending Date:</label>
              <input type="text" id="ending-date-${product_id}" class="ending-date-input" readonly>
            </div>
            <button class="delete-button" onclick="deleteFromCart('${product_id}')">Delete</button>
          </div>
        `;
        productContainer.appendChild(productCard);
      });

      const total = document.createElement("div");
      total.className = "total";
      total.innerHTML = `
      <div style="text-align:right">
        <h3>Total Rental Rate: $<span id="total-rate">${totalRate}</span></h3>
        <h3>Total Deposit Amount: $<span id="total-deposit">${totalDeposit}</span></h3>
        <h3>Total Amount: $<span id="total-amount">${
          totalRate + totalDeposit
        }</span></h3>
      </div>
      <div class="checkout-container">
        <button class="checkout-button" onclick='onCartClick()'>Checkout</button>
      </div>
    `;
      productContainer.appendChild(total);
    });
};

// Delete product from cart
const deleteFromCart = (product_id) => {
  const user = JSON.parse(localStorage.getItem("user_data"));
  const cart = JSON.parse(localStorage.getItem("cart")) || {};
  const products_list = cart[user.username] || [];
  const new_products_list = products_list.filter(
    (product) => product !== product_id
  );

  cart[user.username] = new_products_list;
  localStorage.setItem("cart", JSON.stringify(cart));
  callGetProducts();
  window.dispatchEvent(new Event("cartUpdated"));
};

// Update product insurance
const updateProductInsurance = (productId, insurance) => {
  const product = products.find((p) => p._id === productId);
  product.insurance = insurance;
};

// Update product delivery type
const updateProductDeliveryType = (productId, deliveryType) => {
  const product = products.find((p) => p._id === productId);
  product.deliveryType = deliveryType;
  toggleDeliveryDate(productId, deliveryType);
};

// Toggle delivery date input visibility
const toggleDeliveryDate = (productId, deliveryType) => {
  const deliveryDateInput = document.getElementById(
    `delivery-date-${productId}`
  );
  deliveryDateInput.style.display = "inline-block";
};

// Update product delivery date and calculate starting and ending date
const updateProductDeliveryDate = (productId, deliveryDate) => {
  const product = products.find((p) => p._id === productId);
  product.deliveryDate = deliveryDate;

  // Set Starting Date same as Delivery Date
  const startingDate = new Date(deliveryDate);
  const startingDateFormatted = startingDate.toISOString().split("T")[0];
  document.getElementById(`starting-date-${productId}`).value =
    startingDateFormatted;

  // Calculate Ending Date (7 days after starting date)
  const endingDate = new Date(startingDate);
  endingDate.setDate(startingDate.getDate() + 7); // Add 7 days
  const endingDateFormatted = endingDate.toISOString().split("T")[0];
  document.getElementById(`ending-date-${productId}`).value =
    endingDateFormatted;
};

// Handle checkout process
const onCartClick = () => {
  let valid = true;
  products.forEach((product) => {
    if (!product.insurance) {
      valid = false;
    }
    if (!product.deliveryType) {
      valid = false;
    }
    if (!product.deliveryDate) {
      valid = false;
    }
  });

  if (!valid) {
    alert("Please complete all fields.");
    return;
  }

  localStorage.setItem("checkoutProducts", JSON.stringify(products));
  window.location.href = "/cartpayment.html";
};

// Update product total price based on quantity
const updateProductTotal = (productId, rentalRate, depositAmount, quantity) => {
  const product = products.find((p) => p._id === productId);
  product.quantity = Number.parseInt(quantity);
  const rentalRateElement = document.getElementById(`rental-rate-${productId}`);
  const depositAmountElement = document.getElementById(
    `deposit-amount-${productId}`
  );
  const newRentalRate = rentalRate * quantity;
  const newDepositAmount = depositAmount * quantity;
  rentalRateElement.textContent = newRentalRate;
  depositAmountElement.textContent = newDepositAmount;
  updateTotal();
};

// Update total for all products
const updateTotal = () => {
  let totalRate = 0;
  let totalDeposit = 0;
  products.forEach((product) => {
    totalRate += product.rental_rate * product.quantity;
    totalDeposit += product.deposit_amount * product.quantity;
  });
  document.getElementById("total-rate").textContent = totalRate;
  document.getElementById("total-deposit").textContent = totalDeposit;
  document.getElementById("total-amount").textContent =
    totalRate + totalDeposit;
};
