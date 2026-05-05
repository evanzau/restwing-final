// =============================================
// waitlist.js — Waitlist email capture
// Handles both the main CTA form and the
// sticky bottom banner form.
// =============================================

import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

async function submitWaitlist(email, source) {
  await addDoc(collection(db, "waitlist"), {
    email,
    source,
    createdAt: serverTimestamp(),
  });
}

// ── Main CTA form ────────────────────────────
const form = document.getElementById("waitlist-form");
const msg = document.getElementById("waitlist-msg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("waitlist-email").value.trim();
  const btn = form.querySelector("button[type='submit']");

  btn.textContent = "Joining...";
  btn.disabled = true;

  try {
    await submitWaitlist(email, "homepage-cta");
    form.style.display = "none";
    msg.style.display = "block";
  } catch (err) {
    console.error("Waitlist error:", err);
    btn.textContent = "Get Early Access";
    btn.disabled = false;
  }
});

// ── Sticky banner form ───────────────────────
const banner = document.getElementById("waitlist-banner");
const bannerForm = document.getElementById("waitlist-banner-form");
const bannerMsg = document.getElementById("waitlist-banner-msg");
const bannerClose = document.getElementById("waitlist-banner-close");

// Hide banner if user already dismissed it
if (localStorage.getItem("waitlist-banner-dismissed")) {
  banner.style.display = "none";
}

bannerClose.addEventListener("click", () => {
  banner.style.display = "none";
  localStorage.setItem("waitlist-banner-dismissed", "true");
});

bannerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("waitlist-banner-email").value.trim();
  const btn = bannerForm.querySelector("button[type='submit']");

  btn.textContent = "Joining...";
  btn.disabled = true;

  try {
    await submitWaitlist(email, "banner-cta");
    bannerForm.style.display = "none";
    bannerMsg.style.display = "block";
    setTimeout(() => {
      banner.style.display = "none";
      localStorage.setItem("waitlist-banner-dismissed", "true");
    }, 2500);
  } catch (err) {
    console.error("Banner waitlist error:", err);
    btn.textContent = "Notify Me";
    btn.disabled = false;
  }
});
