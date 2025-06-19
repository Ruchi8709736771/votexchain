// Import necessary Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

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

// Handle form submission
const addElectionForm = document.getElementById('addElectionForm');
addElectionForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Get form values
    const electionName = document.getElementById('electionName').value;
    const endDate = document.getElementById('endDate').value;

    // Reference to the elections in Firebase
    const electionsRef = ref(db, 'elections');

    // Push new election data to Firebase
    push(electionsRef, {
        electionName: electionName,
        endDate: endDate,
        createdOn: new Date().toISOString(),
    })
    .then(() => {
        alert('Election created successfully!');
        addElectionForm.reset();
    })
    .catch((error) => {
        console.error('Error creating election:', error);
    });
});
