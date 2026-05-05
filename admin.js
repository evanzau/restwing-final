import { db, auth } from "./firebase.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  doc,
  setDoc,
  getDocs,
  getDoc,
  collection
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
// Check auth state and role
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.replace("login.html");
    return;
  }
  try {
  const snap = await getDoc(doc(db, "users", user.uid));
  if (!snap.exists() || snap.data().role !== "admin") {
    alert("Access denied");
    window.location.replace("index.html");
    return;
  }
  loadOrders();
  loadProducts();
} catch (err) {
  console.error("Admin panel error:", err);
}
});
//Load products
async function loadProducts() {
  const container = document.getElementById("products-list");
  if (!container) return;

  container.innerHTML = "";

  const productsSnap = await getDocs(collection(db, "inventory"));
  const ordersSnap = await getDocs(collection(db, "orders"));

  // Build sales map
   let totalSales = 0;

   ordersSnap.forEach(doc => {
    const data = doc.data();
    if (data.status === "delivered") {
       totalSales += data.total || 0;
  }
});

  // Render table
  productsSnap.forEach((docSnap, index) => {
    const data = docSnap.data();

    const name = data.productName || "Unnamed";
    const stock = data.stock || 0;
    const price = 39;

    const inventoryValue = stock * price;
    const totalSalesValue = totalSales;

    const row = document.createElement("tr");
    row.style.borderBottom = "1px solid #eee";

  row.innerHTML = `
  <td style="padding:14px; text-align:left; font-weight:600;">
    ${name}
  </td>

  <td style="padding:14px; text-align:center;">
    ${stock}
  </td>

  <td style="padding:14px; text-align:center;">
    $${price}
  </td>

  <td style="padding:14px; text-align:center; font-weight:600;">
    $${inventoryValue.toLocaleString()}
  </td>

  <td style="padding:14px; text-align:center; font-weight:600; color:#2e7d32;">
    $${totalSales.toLocaleString()}
  </td>
  `;

    container.appendChild(row);
  });
}
//Load or check orders
import { updateDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

async function loadOrders() {
  const container = document.getElementById("orders-list");
  if (!container) return;

  container.innerHTML = "";

  const snapshot = await getDocs(collection(db, "orders"));

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();

    const name = `${data.customer?.firstName || ""} ${data.customer?.lastName || ""}`;
    const amount = data.total || 0;
    const status = data.status || "pending_payment";

    const row = document.createElement("tr");
    row.style.borderBottom = "1px solid #eee";

    row.innerHTML = `
      <td style="padding:12px;">
      <div style="font-weight:600; text-align:left;">
        ${name}
      </div>
      <div style="font-size:12px; color:#888; margin-top:2px;text-align:left;">
         ID: ${docSnap.id}
      </div>
      </td>

      <td style="padding:12px; text-align:center;">
        $${amount}
      </td>

      <td style="padding:12px; text-align:center;">
         ${status.replaceAll("_", " ")}
      </td>

      <td style="padding:12px; text-align:center;">
         <select 
            data-id="${docSnap.id}" 
            class="status-dropdown"
            ${status === "delivered" ? "disabled" : ""}
    >
          <option value="pending_payment" ${status==="pending_payment"?"selected":""}>Pending</option>
          <option value="paid" ${status==="paid"?"selected":""}>Paid</option>
          <option value="shipped" ${status==="shipped"?"selected":""}>Shipped</option>
          <option value="delivered" ${status==="delivered"?"selected":""}>Delivered</option>
          </select>
      </td>
      `;
    container.appendChild(row);
  });

  // Handle updates
     document.querySelectorAll(".status-dropdown").forEach(select => {
  select.addEventListener("change", async (e) => {

    const orderId = e.target.dataset.id;
    const newStatus = e.target.value;

    try {
      // 1. Get order data
      const orderRef = doc(db, "orders", orderId);
      const orderSnap = await getDoc(orderRef);

      if (!orderSnap.exists()) return;

      const orderData = orderSnap.data();
      const prevStatus = orderData.status;

      // 2. Update order status
      await updateDoc(orderRef, {
        status: newStatus
      });

      if (prevStatus !== "delivered" && newStatus === "delivered") {

        const productId = "restwing";
        const quantity = orderData.quantity || 1;

        if (!productId) {
          console.warn("No productId in order");
          return;
        }

        const productRef = doc(db, "inventory", productId);
        const productSnap = await getDoc(productRef);

        if (productSnap.exists()) {
          const currentStock = productSnap.data().stock || 0;

          await updateDoc(productRef, {
            stock: Math.max(0, currentStock - quantity)
          });
        }
      }

      console.log("Order + inventory updated");

    } catch (err) {
      console.error("Update failed:", err);
    }
  });
});
}
// Add or update product
document.addEventListener("DOMContentLoaded", () => {

  const saveBtn = document.getElementById("save-product");

  if (saveBtn) {
    saveBtn.addEventListener("click", async () => {

      const id = document.getElementById("product-id").value.trim();
      const name = document.getElementById("product-name").value.trim();
      const price = parseFloat(document.getElementById("product-price").value);
      const stock = parseInt(document.getElementById("product-stock").value);

      if (!id || !name || isNaN(price) || isNaN(stock)) {
        alert("Please fill all fields correctly");
        return;
      }

      await setDoc(doc(db, "products", id), {
        name,
        price,
        stock
      });

      alert("Product saved");

      loadProducts();
    });
  }
  document.addEventListener("click", async (e) => {
  const logoutBtn = e.target.closest("#logout-btn");

  if (logoutBtn) {
    e.preventDefault();
    await signOut(auth);
    window.location.replace("index.html");
  }
});
document.querySelectorAll(".dashboard-tab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".dashboard-tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".dashboard-panel").forEach(p => p.classList.remove("active"));

    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});});
