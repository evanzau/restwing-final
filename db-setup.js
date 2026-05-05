// =============================================
// db-setup.js — Firestore Database Initializer
// Run this ONCE to create sample documents in
// all three collections for your milestone.
// Open index.html, open browser console (F12),
// then paste: import('./db-setup.js')
// =============================================

import { db } from "./firebase.js";
import {
    collection,
    addDoc,
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

async function setupDatabase() {
    console.log("Setting up RestWing Firestore database...");

    // ── Collection 1: orders ─────────────────────
    // Stores every customer purchase
    await addDoc(collection(db, "orders"), {
        customer: {
            firstName: "Jane",
            lastName:  "Smith",
            email:     "jane.smith@example.com",
            phone:     "555-123-4567"
        },
        shipping: {
            address:  "123 Main Street",
            address2: "Apt 4B",
            city:     "Los Angeles",
            state:    "CA",
            zip:      "90001"
        },
        quantity:    1,
        unitPrice:   39,
        total:       39,
        status:      "pending_payment",   // pending_payment | paid | shipped | delivered
        createdAt:   serverTimestamp()
    });
    console.log("orders collection created");

    // ── Collection 2: customers ──────────────────
    // Stores registered customer profiles
    await addDoc(collection(db, "customers"), {
        firstName:  "Jane",
        lastName:   "Smith",
        email:      "jane.smith@example.com",
        phone:      "555-123-4567",
        address: {
            street:  "123 Main Street",
            city:    "Los Angeles",
            state:   "CA",
            zip:     "90001"
        },
        totalOrders:  1,
        totalSpent:   39,
        createdAt:    serverTimestamp()
    });
    console.log("customers collection created");

    // ── Collection 3: waitlist ───────────────────
    // Stores email signups from the homepage
    await addDoc(collection(db, "waitlist"), {
        email:      "earlyuser@example.com",
        source:     "homepage-cta",
        createdAt:  serverTimestamp()
    });
    console.log("waitlist collection created");

    // ── Collection 4: inventory ──────────────────
    // Tracks stock levels per product.
    // Uses setDoc with a fixed ID so there's always one inventory record per product.
    await setDoc(doc(db, "inventory", "restwing"), {
        productName: "RestWing",
        stock:       100,
        updatedAt:   serverTimestamp()
    });
    console.log("inventory collection created with 100 units");

    console.log("Database setup complete. Check your Firestore console.");
}

setupDatabase();
