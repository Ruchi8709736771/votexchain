import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

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

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

function logout() {
    signOut(auth).then(() => {
        // Redirect to login page after successful logout
        alert("You have been logged out.");
        window.location.href = "index.html";
    }).catch((error) => {
        console.error("Error logging out:", error);
    });
}

// Check if the user is logged in and get their ID
onAuthStateChanged(auth, (user) => {
    if (user) {
        const userId = user.uid;  // Get the unique user ID for the logged-in candidate
        loadDashboard(userId);    // Pass userId to the loadDashboard function
    } else {
        // Redirect to login page if not logged in
        alert("Please log in to access the dashboard.");
        window.location.href = "login.html";
    }
});

// Display elections with correct property references
function displayElections(elections, registeredElections, userId) {
    const electionList = document.getElementById("electionList");
    electionList.innerHTML = ''; // Clear the current list

    Object.entries(elections).forEach(([id, data]) => {
        const electionName = data.electionName;
        const endDate = data.endDate;
        const isRegistered = registeredElections.includes(id);

        const row = document.createElement('tr');

        // Creating the row for the table
        const nameCell = document.createElement('td');
        nameCell.textContent = electionName;
        row.appendChild(nameCell);

        const endDateCell = document.createElement('td');
        endDateCell.textContent = endDate;
        row.appendChild(endDateCell);

        const statusCell = document.createElement('td');
        statusCell.textContent = isRegistered ? 'Registered' : 'Not Registered';
        row.appendChild(statusCell);

        const actionCell = document.createElement('td');
        if (!isRegistered) {
            const registerBtn = document.createElement('button');
            registerBtn.textContent = 'Register';
            registerBtn.onclick = () => registerForElection(id, electionName, userId);
            actionCell.appendChild(registerBtn);
        }
        row.appendChild(actionCell);

        electionList.appendChild(row); // Add the row to the table
    });
}

// Display registered elections in the same table format
function displayRegisteredElections(registeredElections, elections, userId) {
    const registeredElectionList = document.getElementById("registeredElectionList");
    registeredElectionList.innerHTML = ''; // Clear the current list

    registeredElections.forEach((electionId) => {
        const election = elections[electionId];

        if (election.candidates && election.candidates[userId] && election.candidates[userId].approved) {
            const electionName = election.electionName;
            const endDate = election.endDate;

            const row = document.createElement('tr');

            const nameCell = document.createElement('td');
            nameCell.textContent = electionName;
            row.appendChild(nameCell);

            const endDateCell = document.createElement('td');
            endDateCell.textContent = endDate;
            row.appendChild(endDateCell);

            const statusCell = document.createElement('td');
            statusCell.textContent = 'Registered';
            row.appendChild(statusCell);

            const actionCell = document.createElement('td');
            const resultBtn = document.createElement('button');
            resultBtn.textContent = 'Show Result';
            resultBtn.onclick = () => openResultPopup(electionId, electionName);
            actionCell.appendChild(resultBtn);
            row.appendChild(actionCell);

            registeredElectionList.appendChild(row); // Add the row to the table
        }
    });
}
function openResultPopup(electionId) {
    const popup = document.getElementById('resultPopup');
    popup.style.display = 'block';
    document.body.classList.add('modal-open');

    const electionRef = ref(db, 'elections/' + electionId);
    const votesRef = ref(db, 'votes/' + electionId);

    get(electionRef).then(electionSnapshot => {
        const election = electionSnapshot.val();
        const candidates = election.candidates;
        const results = {};

        // Initialize results with candidate names
        for (const candidateId in candidates) {
            const candidate = candidates[candidateId];
            if (candidate.approved) {
                results[candidate.name] = 0;
            }
        }

        // Count votes
        get(votesRef).then(voteSnapshot => {
            voteSnapshot.forEach(candidateVotes => {
                const candidateId = candidateVotes.key; // Candidate ID
                const voters = candidateVotes.val(); // Voters who voted for this candidate

                if (candidates[candidateId] && candidates[candidateId].approved) {
                    // Count the number of voter IDs for the candidate
                    results[candidates[candidateId].name] = Object.keys(voters).length;
                }
            });

            // Display results using Chart.js
            const chartData = {
                labels: Object.keys(results),
                datasets: [{
                    label: 'Votes',
                    data: Object.values(results),
                    backgroundColor: ['#FF5733', '#33FF57', '#3357FF', '#FF33F0']
                }]
            };

            const ctx = document.getElementById('resultChart').getContext('2d');
            if (window.resultChart && typeof window.resultChart.destroy === 'function') {
                window.resultChart.destroy();
            }
            window.resultChart = new Chart(ctx, {
                type: 'bar',
                data: chartData
            });
        });
    });
}


function closeResultPopup() {
    const popup = document.getElementById('resultPopup');
    popup.style.display = 'none';
    document.body.classList.remove('modal-open');
}
window.openResultPopup = openResultPopup;
window.closeResultPopup = closeResultPopup;



function registerForElection(electionId, electionName) {
    const userId = auth.currentUser ? auth.currentUser.uid : null;
    if (!userId) {
        console.error('User is not logged in.');
        return;
    }

    // Retrieve the candidate's information from the users/{userId} path
    const userRef = ref(db, `users/${userId}`);
    get(userRef).then((snapshot) => {
        if (snapshot.exists()) {
            const user = snapshot.val();
            const userName = user.name || "No Name";  // Get user's name
            const userParty = user.party || "Not Assigned";  // Get user's party

            const candidateRef = ref(db, `elections/${electionId}/candidates/${userId}`);

            // Store the candidate's data under the election
            update(candidateRef, { 
                name: userName, 
                party: userParty,  // Store the candidate's party
                approved: false,  // Initially set approval to false
                createdOn: new Date().toISOString() // Store creation timestamp
            }).then(() => {
                alert(`Registered for ${electionName}`);
                loadDashboard(userId);  // Refresh dashboard to show updated status
            }).catch((error) => {
                console.error('Error registering candidate:', error);
            });
        } else {
            console.error("User not found in the database.");
        }
    }).catch((error) => {
        console.error('Error fetching user data:', error);
    });
}





// Load Dashboard
function loadDashboard(userId) {
    const electionsRef = ref(db, 'elections');
    const userRef = ref(db, `users/${userId}`);

    Promise.all([get(electionsRef), get(userRef)]).then(([electionsSnap, userSnap]) => {
        if (electionsSnap.exists() && userSnap.exists()) {
            const elections = electionsSnap.val();
            const userData = userSnap.val();

            const registeredElections = Object.keys(elections).filter(electionId =>
                elections[electionId].candidates && elections[electionId].candidates[userId]
            );

            // Display available elections
            displayElections(elections, registeredElections, userId);

            // Display registered elections (Pass userId explicitly here)
            displayRegisteredElections(registeredElections, elections, userId);
        }
    }).catch(console.error);
}

