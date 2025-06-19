// Import the necessary Firebase SDK functions
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

// Function to display candidate data
function displayCandidateData(candidateData, candidateId) {
    const tableBody = document.getElementById('candidateTableBody');
    
    const row = document.createElement('tr');
    
    // Create table cells for candidate data
    const nameCell = document.createElement('td');
    nameCell.textContent = candidateData.name;
    const emailCell = document.createElement('td');
    emailCell.textContent = candidateData.email;
    const partyCell = document.createElement('td');
    partyCell.textContent = candidateData.party || 'N/A';  // If party is not available, show 'N/A'
    const approvalCell = document.createElement('td');
    
    // Show approval status
    const approvalButton = document.createElement('button');
    approvalButton.textContent = candidateData.approved ? 'Approved' : 'Approve';
    approvalButton.disabled = candidateData.approved;
    approvalButton.classList.add(candidateData.approved ? 'approved' : 'approve');
    
    // When approve button is clicked
    approvalButton.addEventListener('click', () => approveCandidate(candidateId));

    approvalCell.appendChild(approvalButton);
    
    // Append all cells to the row
    row.appendChild(nameCell);
    row.appendChild(emailCell);
    row.appendChild(partyCell);
    row.appendChild(approvalCell);
    
    // Append the row to the table body
    tableBody.appendChild(row);
}

// Approve candidate and update their status in Firebase
function approveCandidate(candidateId) {
    const candidateRef = ref(db, 'users/' + candidateId);

    // Update the candidate's approval status to true
    update(candidateRef, {
        approved: true
    }).then(() => {
        alert('Candidate approved!');
        location.reload();  // Reload the page to refresh the table
    }).catch((error) => {
        console.error('Error approving candidate:', error);
    });
}

// Fetch all candidates from Firebase and display data
function fetchCandidates() {
    const usersRef = ref(db, 'users');
    
    get(usersRef).then((snapshot) => {
        if (snapshot.exists()) {
            const users = snapshot.val();
            for (const userId in users) {
                const userData = users[userId];
                if (userData.role === 'candidate') {
                    // Show data for all candidates
                    displayCandidateData(userData, userId);
                }
            }
        } else {
            console.log("No data available");
        }
    }).catch((error) => {
        console.error("Error fetching candidates:", error);
    });
}

// Call the fetchCandidates function when the page loads
window.onload = fetchCandidates;
