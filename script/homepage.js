document.addEventListener("DOMContentLoaded", function () {
  const user = JSON.parse(localStorage.getItem("user_data"));
  const cart = JSON.parse(localStorage.getItem("cart"));

  if (user && user.username && cart && cart.email) {
    if (user.username !== cart.email) {
      cart[user.username] = [];
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }

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

function updateCartBadge() {
  const user = JSON.parse(localStorage.getItem("user_data"));
  const cart = JSON.parse(localStorage.getItem("cart")) || {};
  const productIds = cart[user.username] || [];
  const cartBadge = document.getElementById("cart-count");
  cartBadge.innerText = productIds.length;
}

let slideIndex = 0; // Start with the first slide

// Function to show the next slide
function moveSlide(n) {
  showSlides((slideIndex += n));
}

// Function to go to a specific slide
function currentSlide(n) {
  showSlides((slideIndex = n));
}

// Function to show the slides and manage active dots
function showSlides(n) {
  let slides = document.getElementsByClassName("slide");
  let dots = document.getElementsByClassName("dot");

  // If the index is out of bounds, wrap around
  if (n >= slides.length) {
    slideIndex = 0;
  } else if (n < 0) {
    slideIndex = slides.length - 1;
  }

  // Hide all slides and remove active class from all dots
  for (let i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
    dots[i].classList.remove("active");
  }

  // Show the current slide and add active class to the corresponding dot
  slides[slideIndex].style.display = "block";
  dots[slideIndex].classList.add("active");
}

// Initialize the slideshow by showing the first slide
showSlides(slideIndex);

// Set up automatic slide change every 30 seconds (30,000 milliseconds)
setInterval(function () {
  moveSlide(1); // Move to the next slide every 30 seconds
}, 30000);

function on_order(p_id) {
  const url = "/order";
  const params = new URLSearchParams({
    product_id: p_id,
  });
  fetch(`${url}?${params.toString()}`)
    .then((response) => {
      if (response.ok) {
        window.location.href = response.url;
      } else {
        console.error("Issue with redirection.");
      }
    })
    .catch(console.error);
}

const addToCart = (p_id) => {
  const user = JSON.parse(localStorage.getItem("user_data"));
  if (!user || !user.username) {
    console.error("User is not logged in.");
    return;
  }
  const cart = JSON.parse(localStorage.getItem("cart")) || {};

  if (!cart[user.username]) {
    cart[user.username] = [];
  }

  // Check if the product ID already exists in the cart
  const productExists = cart[user.username].includes(p_id);

  if (!productExists) {
    // Add the product ID to the cart
    //cart.productIds.push(p_id);
    cart[user.username].push(p_id);
    // Store the updated cart in localStorage
    localStorage.setItem("cart", JSON.stringify(cart));
    // Dispatch a custom event to notify other tabs/windows
    window.dispatchEvent(new Event("cartUpdated"));
  }
};

const onCartClick = () => {
  window.location.href = "/cart";
};
