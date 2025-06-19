
  // Import the necessary Firebase SDK functions
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
  import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";  // Import Database functions
  import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js"; // Import Auth functions

  // Firebase configuration
  // Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA_FaMDukdTKhiydF9kRGLh2GyZvuM_8tA",
  authDomain: "voterxchain.firebaseapp.com",
  databaseURL: "https://voterxchain-default-rtdb.firebaseio.com",
  projectId: "voterxchain",
  storageBucket: "voterxchain.firebasestorage.app",
  messagingSenderId: "350395939871",
  appId: "1:350395939871:web:010b6bb48e45cf1596692a",
  measurementId: "G-7MN1KRNJK7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// Show/hide party field based on selected role
document.getElementById("role").addEventListener("change", function() {
  const role = this.value;
  const partyContainer = document.getElementById("party-container");

  if (role === "candidate") {
      partyContainer.style.display = "block";  // Show party input for candidates
  } else {
      partyContainer.style.display = "none";  // Hide party input for voters
  }
});

// Form submission handling
document.querySelector(".registration-form").addEventListener("submit", async function(event) {
  event.preventDefault();  // Prevent default form submission

  // Get form data
  const name = document.getElementById('name').value;
  const dob = document.getElementById('dob').value;
  const email = document.getElementById('email').value;
  const gender = document.getElementById('gender').value;
  const phone = document.getElementById('phone').value;
  const address = document.getElementById('address').value;
  const password = document.getElementById('password').value;
  const aadhar = document.getElementById('aadhar').value;
  const voterid = document.getElementById('voterid').value;
  const role = document.getElementById('role').value;
  const party = document.getElementById('party') ? document.getElementById('party').value : null;  // Get party value if exists

  // Create user object
  const userData = {
    name: name,
    dob: dob,
    email: email,
    gender: gender,
    phone: phone,
    address: address,
    aadhar: aadhar,
    voterid: voterid,
    role: role,
    approved: false,
    party: role === "candidate" ? party : null  // Only add party for candidates
  };

  try {
    // Create a user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const userId = userCredential.user.uid;  // Get the user ID from Firebase Authentication

    // Save user data to Firebase Realtime Database
    await set(ref(db, 'users/' + userId), userData);

    // Alert user of successful registration and redirect
    alert("Registration successful!");
    window.location.href = "user-login.html";  // Redirect to login page
  } catch (error) {
    // Handle errors (e.g., if the email is already in use)
    console.error("Error during registration:", error.message);
    alert("Error: " + error.message);
  }
});
