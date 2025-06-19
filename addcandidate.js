import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

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
const electionSelect = document.getElementById('election-select');
const registeredCandidatesList = document.getElementById('registered-candidates-list');

// Load elections and populate the election dropdown
const loadElections = async () => {
    try {
        const electionsRef = ref(db, 'elections');
        const snapshot = await get(electionsRef);
        const elections = snapshot.val();

        if (elections) {
            for (const electionId in elections) {
                const election = elections[electionId];
                const option = document.createElement('option');
                option.value = electionId;
                option.textContent = `${election.electionName} ${election.endDate}`;
                electionSelect.appendChild(option);
            }
        } else {
            console.log('No elections found.');
        }
    } catch (error) {
        console.error('Error fetching elections:', error);
    }
};

// Load registered candidates for selected election
// Inside your loadRegisteredCandidates function
const loadRegisteredCandidates = async (electionId) => {
    try {
        const candidatesRef = ref(db, `elections/${electionId}/candidates`);
        const snapshot = await get(candidatesRef);
        const candidates = snapshot.val();

        registeredCandidatesList.innerHTML = '';  // Clear previous candidates

        if (candidates) {
            const table = document.createElement('table');
            table.innerHTML = ` 
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Party</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody id="candidate-rows">
                    <!-- Candidate rows will be added dynamically -->
                </tbody>
            `;
            registeredCandidatesList.appendChild(table);

            const candidateRows = document.getElementById('candidate-rows');

            for (const candidateId in candidates) {
                const candidate = candidates[candidateId];
                if (!candidate.approved) {
                    const row = document.createElement('tr');
                    row.innerHTML = ` 
                        <td>${candidate.name || "No Name"}</td>
                        <td>${candidate.party || "Not Assigned"}</td>
                        <td>
                            <button class="approve-btn" data-candidate-id="${candidateId}" data-election-id="${electionId}">Approve</button>
                            <button class="reject-btn" data-candidate-id="${candidateId}" data-election-id="${electionId}">Reject</button>
                        </td>
                    `;
                    candidateRows.appendChild(row);
                }
            }

            // Add event listeners for approve/reject buttons
            const approveButtons = document.querySelectorAll('.approve-btn');
            approveButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const candidateId = button.getAttribute('data-candidate-id');
                    approveCandidate(candidateId, electionId);
                });
            });

            const rejectButtons = document.querySelectorAll('.reject-btn');
            rejectButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const candidateId = button.getAttribute('data-candidate-id');
                    rejectCandidate(candidateId, electionId);
                });
            });
        } else {
            console.log('No candidates found for this election.');
        }
    } catch (error) {
        console.error('Error fetching registered candidates:', error);
    }
};


// Approve candidate
const approveCandidate = async (candidateId, electionId) => {
    try {
        const candidateRef = ref(db, `elections/${electionId}/candidates/${candidateId}`);
        await update(candidateRef, { approved: true });

        alert('Candidate approved successfully!');
        loadRegisteredCandidates(electionId);  // Reload candidates
    } catch (error) {
        console.error('Error approving candidate:', error);
    }
};

// Reject candidate
const rejectCandidate = async (candidateId, electionId) => {
    try {
        const candidateRef = ref(db, `elections/${electionId}/candidates/${candidateId}`);
        await update(candidateRef, { approved: false });

        alert('Candidate rejected successfully!');
        loadRegisteredCandidates(electionId);  // Reload candidates
    } catch (error) {
        console.error('Error rejecting candidate:', error);
    }
};

// Initialize page by loading elections and adding event listeners
document.addEventListener('DOMContentLoaded', () => {
    loadElections();
    electionSelect.addEventListener('change', () => {
        const selectedElectionId = electionSelect.value;
        if (selectedElectionId) {
            loadRegisteredCandidates(selectedElectionId);
        }
    });
});
