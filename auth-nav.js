// =============================================
// auth-nav.js — Updates navbar based on auth state.
// Include on every page that has a navbar.
// =============================================

import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, getDoc }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {
  const navLinks = document.querySelector(".nav-links");
  if (!navLinks) return;

  const loginLink  = navLinks.querySelector('a[href="login.html"]');
  const signupLink = navLinks.querySelector('a[href="signup.html"]');
  const buyNowLink = navLinks.querySelector('a[href="buynow.html"]');

  if (user) {
    // Hide login/signup, + buy now
    if (loginLink)  loginLink.style.display  = "none";
    if (signupLink) signupLink.style.display = "none";
    if (buyNowLink) buyNowLink.style.display = "none";

  // Get role 
  let role = "user";
  try {
    const snap = await getDoc(doc(db, "users", user.uid));
    if (snap.exists()) {
      const data = snap.data();
      role = data.role || "user";
    }
  } catch (err) {
    console.error("Error fetching user role:", err);
  }
  let dashboard = document.getElementById("nav-dashboard-link");
  if (!dashboard) {
    dashboard = document.createElement("a");
    dashboard.id = "nav-dashboard-link";

    if (role === "admin") {
      dashboard.href = "admin.html";
      dashboard.textContent = "Admin Dashboard";
    } else {
      dashboard.href = "User_Dashboard.html";
      dashboard.textContent = "My Orders";
    }
    navLinks.appendChild(dashboard);
  }

  // Logout button
  let logoutBtn = document.getElementById("nav-logout-link");
  if (!logoutBtn) {
    logoutBtn = document.createElement("a");
    logoutBtn.id = "nav-logout-link";
    logoutBtn.href = "#";
    logoutBtn.textContent = "Logout";
    logoutBtn.style.cssText = "margin-left: 16px; font-size: 13px;";
    logoutBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      await signOut(auth);
      window.location.replace("index.html");
    });
    navLinks.appendChild(logoutBtn);
  }
  }else {
    // Show login/signup, + buy now
    if (loginLink)  loginLink.style.display  = "";
    if (signupLink) signupLink.style.display = "";
    if (buyNowLink) buyNowLink.style.display = ""; 

    // Remove dashboard/logout if they exist
    const dashboard = document.getElementById("nav-dashboard-link");
    const logoutBtn = document.getElementById("nav-logout-link");
    if (dashboard) dashboard.remove();
    if (logoutBtn) logoutBtn.remove();
  } 
});
