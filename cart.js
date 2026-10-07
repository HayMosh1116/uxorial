/*==================================

      LUXORAL CART SYSTEM

==================================*/

// Load Cart

let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Save Cart

function saveCart() {

  localStorage.setItem("cart", JSON.stringify(cart));

}

// Update Cart Badge

function updateCartBadge() {

  const badge = document.getElementById("cartBadge");

  if (!badge) return;

  let total = 0;

  cart.forEach(item => {

    total += item.quantity;

  });

  badge.textContent = total;

}

/*==================================

         ADD TO CART

==================================*/

const addCartBtn = document.getElementById("addCart");

if (addCartBtn) {

  addCartBtn.addEventListener("click", () => {

    const product = {

      name: addCartBtn.dataset.name,

      price: Number(addCartBtn.dataset.price),

      image: document.getElementById("productImage").src,

      size: document.querySelector(".size.active").textContent.trim(),

      color: document.querySelector(".color.active").dataset.color,

      quantity: 1

    };

    const existing = cart.find(item =>

      item.name === product.name &&

      item.size === product.size &&

      item.color === product.color

    );

    if (existing) {

      existing.quantity++;

    } else {

      cart.push(product);

    }

    saveCart();

    updateCartBadge();

    window.location.href = "cart.html";

  });

}

/*==================================

        DISPLAY CART

==================================*/

const cartItems = document.getElementById("cartItems");

const totalPrice = document.getElementById("totalPrice");

function displayCart() {

  if (!cartItems) return;

  cartItems.innerHTML = "";

  let total = 0;

  /* EMPTY CART */

  if (cart.length === 0) {

    cartItems.innerHTML = `

      <div class="empty-cart">

        <h2>Your cart is empty.</h2>

        <a href="shop.html" class="btn">

          Continue Shopping

        </a>

      </div>

    `;

    if (totalPrice) {

      totalPrice.textContent = "₦0";

    }

    updateCartBadge();

    return;

  }

  /* DISPLAY PRODUCTS */

  cart.forEach((item, index) => {

    total += item.price * item.quantity;

    cartItems.innerHTML += `

      <div class="cart-item">

        <img src="${item.image}" alt="${item.name}">

        <div class="cart-info">

          <h2>${item.name}</h2>

          <p>${item.color} | ${item.size}</p>

          <h3>

            ₦${item.price.toLocaleString()}

          </h3>

        </div>

        <div class="cart-controls">

          <div class="quantity">

            <button

              type="button"

              onclick="decreaseQuantity(${index})">

              −

            </button>

            <span>${item.quantity}</span>

            <button

              type="button"

              onclick="increaseQuantity(${index})">

              +

            </button>

          </div>

          <!-- DELETE BUTTON -->

          <button

            type="button"

            class="remove-btn"

            data-index="${index}"

            aria-label="Remove ${item.name}">

            <i class='bx bx-trash'></i>

          </button>

        </div>

      </div>

    `;

  });

  /* UPDATE TOTAL */

  if (totalPrice) {

    totalPrice.textContent =

      "₦" + total.toLocaleString();

  }

  updateCartBadge();

}

/*==================================

      QUANTITY CONTROLS

==================================*/

function increaseQuantity(index) {

  if (!cart[index]) return;

  cart[index].quantity++;

  saveCart();

  displayCart();

}

function decreaseQuantity(index) {

  if (!cart[index]) return;

  if (cart[index].quantity > 1) {

    cart[index].quantity--;

  } else {

    cart.splice(index, 1);

  }

  saveCart();

  displayCart();

}

/*==================================

        REMOVE ITEM

==================================*/

function removeItem(index) {

  if (index < 0 || index >= cart.length) {

    return;

  }

  /* REMOVE THE SELECTED ITEM */

  cart.splice(index, 1);

  /* SAVE UPDATED CART */

  saveCart();

  /* REFRESH CART */

  displayCart();

  /* UPDATE BADGE */

  updateCartBadge();

}

/*==================================

      DELETE BUTTON EVENTS

==================================*/

/*

  We use event delegation here.

  This makes the delete button work even

  after displayCart() rebuilds the cart.

*/

if (cartItems) {

  cartItems.addEventListener("click", function(e) {

    const deleteButton =

      e.target.closest(".remove-btn");

    if (!deleteButton) return;

    const index = Number(

      deleteButton.dataset.index

    );

    removeItem(index);

  });

}

/*==================================

        INITIALIZE

==================================*/

updateCartBadge();

displayCart();

/*==================================

      CHECKOUT SUMMARY

==================================*/

const orderItems =

  document.getElementById("orderItems");

const summaryTotal =

  document.getElementById("summaryTotal");

function displayCheckoutSummary() {

  if (!orderItems) return;

  orderItems.innerHTML = "";

  let total = 0;

  cart.forEach(item => {

    total += item.price * item.quantity;

    orderItems.innerHTML += `

      <div style="

        display:flex;

        justify-content:space-between;

        margin-bottom:18px;

        border-bottom:1px solid #eee;

        padding-bottom:12px;

      ">

        <div>

          <strong>${item.name}</strong><br>

          <small>

            ${item.color} | ${item.size}

          </small><br>

          <small>

            Qty: ${item.quantity}

          </small>

        </div>

        <strong>

          ₦${(

            item.price * item.quantity

          ).toLocaleString()}

        </strong>

      </div>

    `;

  });

  if (summaryTotal) {

    summaryTotal.textContent =

      "₦" + total.toLocaleString();

  }

}

displayCheckoutSummary();

/*==================================

        PLACE ORDER

==================================*/

const placeOrderBtn =

  document.getElementById("placeOrder");

if (placeOrderBtn) {

  placeOrderBtn.addEventListener("click", () => {

    const name =

      document

        .getElementById("customerName")

        .value

        .trim();

    const phone =

      document

        .getElementById("customerPhone")

        .value

        .trim();

    const email =

      document

        .getElementById("customerEmail")

        .value

        .trim();

    const address =

      document

        .getElementById("customerAddress")

        .value

        .trim();

    const state =

      document.getElementById("customerState").value;

    /* CHECK CUSTOMER DETAILS */

    if (!name || !phone || !address) {

      alert(

        "Please fill in your name, phone number and delivery address."

      );

      return;

    }

    /* CHECK CART */

    if (cart.length === 0) {

      alert("Your cart is empty.");

      return;

    }

    /* CALCULATE TOTAL */

    let total = 0;

    cart.forEach(item => {

      total += item.price * item.quantity;

    });

    /* CREATE ORDER MESSAGE */

    let message = `

LUXORAL ORDER

-------------------------

Customer Details

Name: ${name}

Phone: ${phone}

Email: ${email || "Not provided"}

State: ${state}

Address: ${address}

Order Details

-------------------------

`;

    cart.forEach((item, index) => {

      message += `

${index + 1}. ${item.name}

Color: ${item.color}

Size: ${item.size}

Quantity: ${item.quantity}

Price: ₦${item.price.toLocaleString()}

Subtotal: ₦${(

        item.price * item.quantity

      ).toLocaleString()}

`;

    });

    message += `

-------------------------

TOTAL: ₦${total.toLocaleString()}

-------------------------

Thank you for shopping with LUXORAL.

`;

    /*

      LUXORAL WHATSAPP NUMBER

    */

    const whatsappNumber =

      "2348158121554";

    /* OPEN WHATSAPP */

    const whatsappURL =

      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(

        message

      )}`;

    window.open(

      whatsappURL,

      "_blank"

    );

  });

}