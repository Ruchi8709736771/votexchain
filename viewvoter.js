// Import Firebase SDK functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA_FaMDukdTKhiydF9kRGLh2GyZvuM_8tA",
    authDomain: "voterxchain.firebaseapp.com",
    databaseURL: "https://voterxchain-default-rtdb.firebaseio.com",
    projectId: "voterxchain",
    storageBucket: "voterxchain.appspot.com",
    messagingSenderId: "350395939871",
    appId: "1:350395939871:web:010b6bb48e45cf1596692a",
    measurementId: "G-7MN1KRNJK7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Fetch all users from Firebase and display data
function fetchUsers() {
    const usersRef = ref(db, 'users');

    get(usersRef).then((snapshot) => {
        if (snapshot.exists()) {
            const users = snapshot.val();
            for (const userId in users) {
                const userData = users[userId];
                // Only display users with the "voter" role
                if (userData.role === "voter") {
                    displayUserData(userData, userId);
                }
            }
        } else {
            console.log("No data available");
        }
    }).catch((error) => {
        console.error("Error fetching users:", error);
    });
}

// Function to display user data
function displayUserData(userData, userId) {
    const tableBody = document.getElementById('userTableBody');
    
    const row = document.createElement('tr');
    
    // Create table cells for user data
    const nameCell = document.createElement('td');
    nameCell.textContent = userData.name;
    const dobCell = document.createElement('td');
    dobCell.textContent = userData.dob;
    const emailCell = document.createElement('td');
    emailCell.textContent = userData.email;
    const phoneCell = document.createElement('td');
    phoneCell.textContent = userData.phone;
    const addressCell = document.createElement('td');
    addressCell.textContent = userData.address;
    const approvalCell = document.createElement('td');
    
    // Show approval status
    const approvalButton = document.createElement('button');
    approvalButton.textContent = userData.approved ? 'Approved' : 'Approve';
    approvalButton.disabled = userData.approved;
    approvalButton.classList.add(userData.approved ? 'approved' : 'approve');
    
    // When approve button is clicked
    approvalButton.addEventListener('click', () => approveUser(userId));

    approvalCell.appendChild(approvalButton);
    
    // Append all cells to the row
    row.appendChild(nameCell);
    row.appendChild(dobCell);
    row.appendChild(emailCell);
    row.appendChild(phoneCell);
    row.appendChild(addressCell);
    row.appendChild(approvalCell);
    
    // Append the row to the table body
    tableBody.appendChild(row);
}

// Approve user and update their status in Firebase
function approveUser(userId) {
    const userRef = ref(db, 'users/' + userId);

    // Update the user's approval status to true
    update(userRef, {
        approved: true
    }).then(() => {
        alert('User approved!');
        location.reload();  // Reload the page to refresh the table
    }).catch((error) => {
        console.error('Error approving user:', error);
    });
}

// Call the fetchUsers function when the page loads
window.onload = fetchUsers;
