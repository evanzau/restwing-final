// =============================================
// inventory.js — Stock check for buynow.html
// Reads stock from Firestore on page load and
// disables purchase if out of stock.
// =============================================

import { db } from "./firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const addToBagBtn    = document.getElementById("add-to-bag-btn");
const buyNowBtn      = document.getElementById("buy-now-btn");
const outOfStockMsg  = document.getElementById("out-of-stock-msg");
const stockBadge     = document.getElementById("stock-badge");

async function checkInventory() {
    try {
        const inventoryRef = doc(db, "inventory", "restwing");
        const inventorySnap = await getDoc(inventoryRef);

        if (!inventorySnap.exists()) return;

        const stock = inventorySnap.data().stock;

        if (stock <= 0) {
            // Out of stock — disable buttons, show message
            addToBagBtn.classList.add("btn-disabled");
            buyNowBtn.classList.add("btn-disabled");
            addToBagBtn.removeAttribute("href");
            buyNowBtn.removeAttribute("href");
            outOfStockMsg.style.display = "block";
            if (stockBadge) stockBadge.style.display = "none";

        } else if (stock <= 10) {
            // Low stock warning
            if (stockBadge) {
                stockBadge.textContent = `Only ${stock} left`;
                stockBadge.classList.add("badge-low-stock");
                stockBadge.style.display = "inline-block";
            }
        } else {
            // In stock
            if (stockBadge) {
                stockBadge.textContent = "In Stock";
                stockBadge.classList.add("badge-in-stock");
                stockBadge.style.display = "inline-block";
            }
        }

    } catch (err) {
        console.error("Inventory check failed:", err);
    }
}

checkInventory();
