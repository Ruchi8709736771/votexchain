import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

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

// Global variable for Chart.js instance
window.resultChart = null;

// Load election results
function loadElectionResults() {
    const resultsTable = document.querySelector('#resultsTable tbody');
    const electionsRef = ref(db, 'elections');

    get(electionsRef).then(snapshot => {
        resultsTable.innerHTML = ''; // Clear existing rows

        snapshot.forEach(electionSnapshot => {
            const electionId = electionSnapshot.key;
            const election = electionSnapshot.val();
            const isActive = new Date(election.endDate) > new Date();

            // Create a row for the election
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${election.electionName}</td>
                <td>
                    <button onclick="toggleCandidates('${electionId}')">View Candidates</button>
                    <div id="candidates-${electionId}" style="display: none;">
                        <!-- Candidate details will be populated here -->
                    </div>
                </td>
                <td>${isActive ? 'Active' : 'Closed'}</td>
                <td>
                    <button onclick="openResultPopup('${electionId}')">See Result</button>
                </td>
            `;
            resultsTable.appendChild(row);

            // Populate candidates in the hidden div
            const candidatesDiv = document.getElementById(`candidates-${electionId}`);
            for (const candidateId in election.candidates) {
                const candidate = election.candidates[candidateId];
                if (candidate.approved) {
                    const candidateInfo = document.createElement('p');
                    candidateInfo.textContent = `${candidate.name} (${candidate.party})`;
                    candidatesDiv.appendChild(candidateInfo);
                }
            }
        });
    });
}

// Function to toggle the visibility of candidate details
function toggleCandidates(electionId) {
    const candidatesDiv = document.getElementById(`candidates-${electionId}`);
    if (candidatesDiv.style.display === 'none') {
        candidatesDiv.style.display = 'block';
    } else {
        candidatesDiv.style.display = 'none';
    }
}

// Make the function globally accessible
window.toggleCandidates = toggleCandidates;

// Open result popup
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

// Close result popup
function closeResultPopup() {
    const popup = document.getElementById('resultPopup');
    popup.style.display = 'none';
    document.body.classList.remove('modal-open');
}

// Make functions globally accessible
window.openResultPopup = openResultPopup;
window.closeResultPopup = closeResultPopup;

// Load results on page load
loadElectionResults();
