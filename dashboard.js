import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  collection, query, where, getDocs,
  doc, getDoc, updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  loadUserProfile(user);
  loadOrders(user);
  loadTracking(user);
  loadAddress(user);
});

async function loadUserProfile(user) {
  try {
    const snap = await getDoc(doc(db, "users", user.uid));
    if (!snap.exists()) return;
    const data = snap.data();

    const name = `${data.firstName || ""} ${data.lastName || ""}`.trim() || "—";
    document.getElementById("user-name").textContent  = name;
    document.getElementById("user-email").textContent = data.email || user.email;
    document.getElementById("user-phone").textContent = data.phone || "—";
    document.getElementById("dashboard-welcome").textContent = `Welcome back, ${data.firstName || "there"}.`;

    const addrBox = document.getElementById("saved-address");
    const a = data.address;
    if (a && a.address) {
      addrBox.innerHTML = `
        ${a.address}<br>
        ${a.address2 ? a.address2 + "<br>" : ""}
        ${a.city || ""}, ${a.state || ""} ${a.zip || ""}
      `;
    }
  } catch (err) {
    console.error("Profile load error:", err);
  }
}

async function loadOrders(user) {
  const container = document.getElementById("orders-list");
  const noOrders  = document.getElementById("no-orders");
  container.innerHTML = "";

  try {
    const q = query(collection(db, "orders"), where("userId", "==", user.uid));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      noOrders.style.display = "block";
      return;
    }

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const status = (data.status || "pending").replaceAll("_", " ");
      const date = data.createdAt?.toDate?.()?.toLocaleDateString() || "—";

      const div = document.createElement("div");
      div.className = "dashboard-card";
      div.style.marginBottom = "16px";
      div.innerHTML = `
        <div class="dashboard-info-row">
          <span class="dashboard-info-label">Order ID</span>
          <span class="dashboard-info-value" style="font-size:12px; word-break:break-all;">${docSnap.id}</span>
        </div>
        <div class="dashboard-info-row">
          <span class="dashboard-info-label">Date</span>
          <span class="dashboard-info-value">${date}</span>
        </div>
        <div class="dashboard-info-row">
          <span class="dashboard-info-label">Qty</span>
          <span class="dashboard-info-value">${data.quantity || 1}</span>
        </div>
        <div class="dashboard-info-row">
          <span class="dashboard-info-label">Total</span>
          <span class="dashboard-info-value">$${data.total || 39}</span>
        </div>
        <div class="dashboard-info-row" style="border:none;">
          <span class="dashboard-info-label">Status</span>
          <span class="dashboard-order-status">${status}</span>
        </div>
      `;
      container.appendChild(div);
    });
  } catch (err) {
    console.error("Orders load error:", err);
  }
}

async function loadTracking(user) {
  const container  = document.getElementById("tracking-list");
  const noTracking = document.getElementById("no-tracking");
  container.innerHTML = "";

  try {
    const q = query(collection(db, "orders"), where("userId", "==", user.uid));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      noTracking.style.display = "block";
      return;
    }

    snapshot.forEach((docSnap) => {
      const data   = docSnap.data();
      const status = (data.status || "pending").replaceAll("_", " ");

      const steps = ["pending payment", "paid", "shipped", "delivered"];
      const currentStep = steps.indexOf(status);

      const div = document.createElement("div");
      div.className = "dashboard-card";
      div.style.marginBottom = "16px";
      div.innerHTML = `
        <div class="dashboard-info-row" style="border:none; margin-bottom:16px;">
          <span class="dashboard-info-label">Order</span>
          <span class="dashboard-info-value" style="font-size:12px;">${docSnap.id}</span>
        </div>
        <div class="tracking-steps">
          ${steps.map((step, i) => `
            <div class="tracking-step ${i <= currentStep ? "done" : ""}">
              <div class="tracking-dot"></div>
              <span>${step.charAt(0).toUpperCase() + step.slice(1)}</span>
            </div>
          `).join("")}
        </div>
      `;
      container.appendChild(div);
    });
  } catch (err) {
    console.error("Tracking load error:", err);
  }
}

async function loadAddress(user) {
  try {
    const snap = await getDoc(doc(db, "users", user.uid));
    if (!snap.exists()) return;
    const a = snap.data().address || {};
    document.getElementById("street").value   = a.address  || "";
    document.getElementById("address2").value = a.address2 || "";
    document.getElementById("city").value     = a.city     || "";
    document.getElementById("state").value    = a.state    || "";
    document.getElementById("zip").value      = a.zip      || "";
  } catch (err) {
    console.error("Address load error:", err);
  }
}

document.getElementById("save-address").addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return;

  const address  = document.getElementById("street").value.trim();
  const address2 = document.getElementById("address2").value.trim();
  const city     = document.getElementById("city").value.trim();
  const state    = document.getElementById("state").value.trim();
  const zip      = document.getElementById("zip").value.trim();

  try {
    await updateDoc(doc(db, "users", user.uid), {
      address: { address, address2, city, state, zip }
    });
    document.getElementById("save-success").style.display = "block";
    setTimeout(() => {
      document.getElementById("save-success").style.display = "none";
    }, 3000);
  } catch (err) {
    console.error("Save address error:", err);
  }
});

document.querySelectorAll(".dashboard-tab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".dashboard-tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".dashboard-panel").forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});
