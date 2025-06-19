// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js"; 
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js"; 

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
const auth = getAuth(app);
const db = getDatabase(app);

// Handle login form submission
document.querySelector('.login-form').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent default form submission

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            checkUserRole(user.uid);  // After login, check the user's role
        })
        .catch((error) => {
            console.error("Error logging in:", error.message);
            alert("Invalid login credentials. Please try again.");
        });
});

// Function to check if the logged-in user is a candidate or voter
function checkUserRole(userId) {
    const userRef = ref(db, 'users/' + userId);
    
    get(userRef).then((snapshot) => {
        if (snapshot.exists()) {
            const userData = snapshot.val();
            const role = userData.role;
            const approved = userData.approved;

            if (!approved) {
                // If not approved, show a popup
                alert("You have not been approved yet. Please wait until your account is approved.");
                return; // Don't proceed further
            }

            if (role === "candidate") {
                window.location.href = "candidate-dashboard.html";  // Redirect to candidate dashboard
            } else if (role === "voter") {
                window.location.href = "voter-dashboard.html";  // Redirect to voter dashboard
            } else {
                alert("Invalid user role. Please contact the admin.");
            }
        } else {
            console.log("User data not found.");
            alert("User not found.");
        }
    }).catch((error) => {
        console.error("Error checking user role:", error);
        alert("An error occurred. Please try again later.");
    });
}
