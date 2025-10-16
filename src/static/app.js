document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p class="description">${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <p><strong>Participants:</strong></p>
          <ul style="list-style-type: none; padding: 0;">
            ${details.participants.map(participant => `
              <li style="display: flex; align-items: center;">
                ${participant}
                <button class='delete-btn' data-participant='${participant}' style="margin-left: 10px; padding: 2px 5px; font-size: 0.8rem; cursor: pointer; background: none; border: none; color: red;">
                  🗑️
                </button>
              </li>
            `).join("")}
          </ul>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);

        // Add event listener for delete buttons
        activityCard.querySelectorAll('.delete-btn').forEach(button => {
          button.addEventListener('click', async (event) => {
            const participantToRemove = event.target.getAttribute('data-participant');
            await unregisterParticipant(name, participantToRemove);

            // Refresh the activity list dynamically
            await loadActivities();
          });
        });
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Function to unregister a participant
  async function unregisterParticipant(activityName, participant) {
    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activityName)}/unregister?participant=${encodeURIComponent(participant)}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to unregister participant");
      }
    } catch (error) {
      console.error("Error unregistering participant:", error);
    }
  }

  // Function to load activities dynamically
  async function loadActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear the activities list
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p class="description">${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <p><strong>Participants:</strong></p>
          <ul style="list-style-type: none; padding: 0;">
            ${details.participants.map(participant => `
              <li style="display: flex; align-items: center;">
                ${participant}
                <button class='delete-btn' data-participant='${participant}' style="margin-left: 10px; padding: 2px 5px; font-size: 0.8rem; cursor: pointer; background: none; border: none; color: red;">
                  🗑️
                </button>
              </li>
            `).join("")}
          </ul>
        `;

        activitiesList.appendChild(activityCard);

        // Add event listener for delete buttons
        activityCard.querySelectorAll('.delete-btn').forEach(button => {
          button.addEventListener('click', async (event) => {
            const participantToRemove = event.target.getAttribute('data-participant');
            await unregisterParticipant(name, participantToRemove);

            // Refresh the activity list dynamically
            await loadActivities();
          });
        });
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error loading activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();

        // Refresh the activity list dynamically
        await loadActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
