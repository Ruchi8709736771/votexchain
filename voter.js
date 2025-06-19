import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, get, set, onValue, runTransaction } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

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
const auth = getAuth(app);

// Global variables
let currentVoterId;
let currentElectionId;

// Utility to show a specific section
function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById(sectionId).style.display = 'block';
}

// Make `showSection` globally accessible
window.showSection = showSection;

// Handle user authentication and load data
onAuthStateChanged(auth, user => {
    if (user) {
        currentVoterId = user.uid;
        loadAvailableElections();
        loadRegisteredElections();
    } else {
        window.location.href = 'index.html';
    }
});

// Load available elections
function loadAvailableElections() {
    const electionList = document.getElementById('electionList');
    const electionsRef = ref(db, 'elections');
    const userRef = ref(db, `users/${currentVoterId}/registeredElections`);

    get(userRef).then(userSnapshot => {
        const registeredElections = userSnapshot.val() || {};

        get(electionsRef).then(snapshot => {
            electionList.innerHTML = '';
            snapshot.forEach(electionSnapshot => {
                const election = electionSnapshot.val();
                const electionId = electionSnapshot.key;
                const isActive = new Date(election.endDate) > new Date();
                const isRegistered = registeredElections[electionId];

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${election.electionName}</td>
                    <td>${election.endDate}</td>
                    <td>${isActive ? 'Active' : 'Closed'}</td>
                    <td>
                        ${isRegistered ? 'Registered' : (isActive ? `<button onclick="registerForElection('${electionId}')">Register</button>` : 'Closed')}
                    </td>
                `;
                electionList.appendChild(row);
            });
        });
    });
}

// Register for an election
function registerForElection(electionId) {
    const userElectionRef = ref(db, `users/${currentVoterId}/registeredElections/${electionId}`);

    set(userElectionRef, { registrationDate: new Date().toISOString() })
        .then(() => {
            alert("You have successfully registered for this election.");
            loadAvailableElections();
        })
        .catch(error => {
            console.error("Error registering for election:", error);
        });
}

window.registerForElection = registerForElection;

// Load registered elections
function loadRegisteredElections() {
    const registeredElectionList = document.getElementById('registeredElectionList');
    const registeredElectionsRef = ref(db, `users/${currentVoterId}/registeredElections`);

    onValue(registeredElectionsRef, snapshot => {
        registeredElectionList.innerHTML = '';
        snapshot.forEach(regElectionSnapshot => {
            const electionId = regElectionSnapshot.key;
            const electionData = regElectionSnapshot.val();
            const isVoted = electionData.voted;
            const electionRef = ref(db, `elections/${electionId}`);

            get(electionRef).then(snapshot => {
                const election = snapshot.val();
                const isActive = new Date(election.endDate) > new Date();

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${election.electionName}</td>
                    <td>${election.endDate}</td>
                    <td>${isVoted ? 'Voted' : (isActive ? 'Active' : 'Ended')}</td>
                    <td>
                        ${!isVoted && isActive ? `<button onclick="openVotePopup('${electionId}')">Vote</button>` : ''}
                    </td>
                    <td>
                        ${isVoted ? `<button onclick="openResultPopup('${electionId}')">See Results</button>` : ''}
                    </td>
                `;
                registeredElectionList.appendChild(row);
            });
        });
    });
}

// Open vote popup
function openVotePopup(electionId) {
    currentElectionId = electionId;
    document.getElementById('votePopup').style.display = 'block';

    const candidatesRef = ref(db, `elections/${electionId}/candidates`);
    get(candidatesRef).then(snapshot => {
        const candidates = snapshot.val();
        const candidatesList = document.getElementById('candidateList');

        candidatesList.innerHTML = '';
        for (const candidateId in candidates) {
            const candidate = candidates[candidateId];
            if (candidate.approved) {
                candidatesList.innerHTML += `
                    <div>
                        <label>
                            <input type="radio" name="candidate" value="${candidateId}">
                            ${candidate.name} (${candidate.party})
                        </label>
                    </div>
                `;
            }
        }
    });
}

window.openVotePopup = openVotePopup;

// Submit vote
function submitVote() {
    const selectedCandidateId = document.querySelector('input[name="candidate"]:checked').value;
    const votesRef = ref(db, `votes/${currentElectionId}/${selectedCandidateId}/${currentVoterId}`);

    set(votesRef, true).then(() => {
        alert("Vote submitted successfully!");

        const userElectionRef = ref(db, `users/${currentVoterId}/registeredElections/${currentElectionId}`);
        set(userElectionRef, { registrationDate: new Date().toISOString(), voted: true })
            .then(() => {
                loadRegisteredElections();
                closeVotePopup();
            })
            .catch(error => {
                console.error("Error updating vote status:", error);
            });
    }).catch(error => {
        console.error("Error submitting vote:", error);
    });
}

window.submitVote = submitVote;

// Close vote popup
function closeVotePopup() {
    document.getElementById('votePopup').style.display = 'none';
    document.body.classList.remove('modal-open');
}

window.closeVotePopup = closeVotePopup;

function closeResultPopup() {
    document.getElementById('resultPopup').style.display = 'none';
    document.body.classList.remove('modal-open'); // Optional: Adjust body styling for popup removal
}

// Make the function globally accessible
window.closeResultPopup = closeResultPopup;

// Open result popup
function openResultPopup(electionId) {
    const resultPopup = document.getElementById('resultPopup');
    resultPopup.style.display = 'block';

    const votesRef = ref(db, `votes/${electionId}`);
    const electionRef = ref(db, `elections/${electionId}`);

    get(electionRef).then(snapshot => {
        const election = snapshot.val();
        const candidates = election.candidates;
        const results = {};

        for (const candidateId in candidates) {
            results[candidateId] = 0;
        }

        get(votesRef).then(voteSnapshot => {
            voteSnapshot.forEach(candidateSnapshot => {
                const candidateId = candidateSnapshot.key;
                results[candidateId] = Object.keys(candidateSnapshot.val() || {}).length;
            });

            renderResults(results, candidates);
        });
    });
}

function renderResults(results, candidates) {
    const resultChart = document.getElementById('resultsChart').getContext('2d');
    const labels = [];
    const data = [];

    for (const candidateId in results) {
        const candidate = candidates[candidateId];
        if (candidate) {
            labels.push(candidate.name);
            data.push(results[candidateId]);
        }
    }

    new Chart(resultChart, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Votes',
                data: data,
                backgroundColor: ['#FF5733', '#33FF57', '#3357FF', '#FF33F0']
            }]
        }
    });
}

window.openResultPopup = openResultPopup;
