
document.addEventListener("DOMContentLoaded", () => {
    const typingText = document.getElementById("typingText");
    const words = ["VotexChain", "Voting System"]; // Words to be typed
    let wordIndex = 0;
    let letterIndex = 0;
    let isDeleting = false;

    function type() {
        const currentWord = words[wordIndex];

        // Typing or deleting the word
        const displayedText = isDeleting
            ? currentWord.substring(0, letterIndex--)
            : currentWord.substring(0, letterIndex++);

        typingText.textContent = displayedText;

        if (!isDeleting && letterIndex === currentWord.length) {
            // Once the word is fully typed, wait and then delete
            setTimeout(() => (isDeleting = true), 1500); // Wait before deleting
        } else if (isDeleting && letterIndex === 0) {
            // Once the word is fully deleted, go to the next word
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
        }

        // Adjust speed: typing is slower (200ms), deleting is faster (100ms)
        setTimeout(type, isDeleting ? 100 : 200);
    }

    type();

    // Admin Login Logic
    const adminLoginForm = document.getElementById("adminLoginForm");
    const emailField = document.getElementById("email");
    const passwordField = document.getElementById("password");

    adminLoginForm.addEventListener("submit", (e) => {
        e.preventDefault();

        // Admin credentials
        const adminEmail = "demo@gmail.com";
        const adminPassword = "ruchi843314";

        // Get the values from the input fields
        const emailValue = emailField.value;
        const passwordValue = passwordField.value;

        // Check if the entered credentials match the admin credentials
        if (emailValue === adminEmail && passwordValue === adminPassword) {
            // Redirect to Admin Dashboard if credentials match
            window.location.href = "admin-dashboard.html";
        } else {
            // Show error message if credentials are incorrect
            alert("Invalid email or password. Please try again.");
        }
    });
});
