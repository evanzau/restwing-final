// =============================================
// checkout.js — RestWing Checkout Logic
// Saves order to Firestore, then sends
// customer to Stripe to complete payment.
// =============================================

import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  runTransaction,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ── Stripe Payment Link ──────────────────────
// Replace this URL after creating your Payment
// Link in the Stripe dashboard (see instructions).
const STRIPE_PAYMENT_LINK =
  "https://buy.stripe.com/test_aFa3cugJ1aMagOx6mOcfK00";

// ── Price per unit ───────────────────────────
const UNIT_PRICE = 39;

// ── Quantity controls ────────────────────────
const urlQty =
  parseInt(new URLSearchParams(window.location.search).get("qty")) || 1;
let quantity = Math.min(Math.max(urlQty, 1), 10);

const qtyDisplay = document.getElementById("qty-display");
const subtotalEl = document.getElementById("subtotal");
const totalEl = document.getElementById("total");

function updateTotals() {
  const total = quantity * UNIT_PRICE;
  qtyDisplay.textContent = quantity;
  subtotalEl.textContent = "$" + total.toFixed(2);
  totalEl.textContent = "$" + total.toFixed(2);
}

updateTotals();

// ── Autofill logged-in user data ─────────────
onAuthStateChanged(auth, async (user) => {
  if (!user) return;
  try {
    const snap = await getDoc(doc(db, "users", user.uid));
    if (!snap.exists()) return;
    const data = snap.data();
    const a = data.address || {};
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el && val) el.value = val;
    };
    setVal("first-name", data.firstName);
    setVal("last-name",  data.lastName);
    setVal("email",      data.email);
    setVal("phone",      data.phone);
    setVal("address",    a.address);
    setVal("address2",   a.address2);
    setVal("city",       a.city);
    setVal("state",      a.state);
    setVal("zip",        a.zip);
  } catch (err) {
    console.error("Autofill error:", err);
  }
});

document.getElementById("qty-minus").addEventListener("click", () => {
  if (quantity > 1) {
    quantity--;
    updateTotals();
  }
});

document.getElementById("qty-plus").addEventListener("click", () => {
  if (quantity < 10) {
    quantity++;
    updateTotals();
  }
});

// ── Form Submission ──────────────────────────
document
  .getElementById("checkout-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const errorEl = document.getElementById("form-error");
    const submitBtn = e.target.querySelector("button[type='submit']");

    // Collect field values
    const firstName = document.getElementById("first-name").value.trim();
    const lastName = document.getElementById("last-name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const address = document.getElementById("address").value.trim();
    const address2 = document.getElementById("address2").value.trim();
    const city = document.getElementById("city").value.trim();
    const state = document.getElementById("state").value.trim();
    const zip = document.getElementById("zip").value.trim();

    // Basic validation — check required fields are filled
    if (
      !firstName ||
      !lastName ||
      !email ||
      !address ||
      !city ||
      !state ||
      !zip
    ) {
      errorEl.style.display = "block";
      return;
    }

    errorEl.style.display = "none";
    submitBtn.textContent = "Saving your order...";
    submitBtn.disabled = true;

    try {
      const inventoryRef = doc(db, "inventory", "restwing");
      let orderId = null;

      // Transaction: check stock and decrement atomically
      // This prevents two customers from buying the last unit at the same time
      await runTransaction(db, async (transaction) => {
        const inventorySnap = await transaction.get(inventoryRef);

        if (!inventorySnap.exists()) {
          throw new Error("Inventory record not found.");
        }

        const currentStock = inventorySnap.data().stock;

        if (currentStock < quantity) {
          throw new Error("out_of_stock");
        }

        // Decrement stock
        transaction.update(inventoryRef, { stock: currentStock - quantity });
      });

      // Stock confirmed — save the order
      const uid = auth.currentUser ? auth.currentUser.uid : null;
      const orderRef = await addDoc(collection(db, "orders"), {
        ...(uid && { userId: uid }),
        customer: { firstName, lastName, email, phone },
        shipping: { address, address2, city, state, zip },
        quantity,
        unitPrice: UNIT_PRICE,
        total: quantity * UNIT_PRICE,
        status: "pending_payment",
        createdAt: serverTimestamp(),
      });


      orderId = orderRef.id;

      // Save shipping address back to user profile if logged in
      if (uid) {
        await updateDoc(doc(db, "users", uid), {
          address: { address, address2, city, state, zip }
        });
      }

      // Redirect to Stripe with prefilled email and order reference
      const stripeUrl = `${STRIPE_PAYMENT_LINK}?prefilled_email=${encodeURIComponent(email)}&client_reference_id=${orderId}&quantity=${quantity}`;
      window.location.href = stripeUrl;
    } catch (err) {
      submitBtn.textContent = "Continue to Payment →";
      submitBtn.disabled = false;

      if (err.message === "out_of_stock") {
        errorEl.textContent =
          "Sorry, we are currently out of stock. Please check back soon.";
      } else {
        errorEl.textContent = "Something went wrong. Please try again.";
        console.error("Checkout error:", err);
      }
      errorEl.style.display = "block";
    }
  });
