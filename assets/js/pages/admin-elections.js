// import * as XLSX from "https://cdn.jsdelivr.net/npm/xlsx@0.19.3/xlsx.mjs";
import { initDropdowns } from "../utilities/dropdown.js";
import { initSearchableDropdowns } from "../utilities/searchable-dropdown.js";

// Admin elections utilities with modal support

// Search functionality for elections
document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("searchElectionsInput");
  const electionsGrid = document.querySelector(".elections-grid");

  if (searchInput && electionsGrid) {
    searchInput.addEventListener("input", function (e) {
      const searchTerm = e.target.value.toLowerCase().trim();
      const electionCards = electionsGrid.querySelectorAll(".election-card");

      electionCards.forEach((card) => {
        const organizer =
          card
            .querySelector(".election-organizer")
            ?.textContent.toLowerCase() || "";
        const year =
          card
            .querySelector(".election-year-badge")
            ?.textContent.toLowerCase() || "";
        const type =
          card
            .querySelector(".election-type-selector")
            ?.textContent.toLowerCase() || "";

        const matches =
          organizer.includes(searchTerm) ||
          year.includes(searchTerm) ||
          type.includes(searchTerm);

        card.style.display = matches ? "" : "none";
      });
    });
  }

  // Search functionality for modal candidates list
  const searchModalInput = document.getElementById(
    "searchModalCandidatesInput"
  );
  if (searchModalInput) {
    searchModalInput.addEventListener("input", function (e) {
      const searchTerm = e.target.value.toLowerCase().trim();
      const candidateItems = document.querySelectorAll(
        "#candidateListContent .candidate-item"
      );

      candidateItems.forEach((item) => {
        const text = item.textContent.toLowerCase();
        const matches = text.includes(searchTerm);
        item.style.display = matches ? "" : "none";
      });
    });
  }
});

function getListOfCandidates(electionId) {
  const modal = document.getElementById("candidateListModal");
  const content = document.getElementById("candidateListContent");
  const closeBtn = document.getElementById("closeCandidateListModal");

  if (!modal || !content) return;

  // Show loading
  content.innerHTML = `
    <div class="loading-spinner">
      <svg class="spinner-svg" viewBox="25 25 50 50">
        <circle r="20" cy="50" cx="50"></circle>
      </svg>
    </div>
  `;

  modal.classList.add("active");
  document.body.style.overflow = "hidden";

  // Fetch candidates
  fetch(
    `../apis/api.php?action=getCandidatesByElection&id_election=${electionId}`
  )
    .then((res) => res.json())
    .then((candidates) => {
      if (!candidates || candidates.length === 0) {
        content.innerHTML =
          '<p style="text-align: center; padding: 2rem;">No candidates found for this election.</p>';
        return;
      }

      let html = '<div class="candidates-list">';

      candidates.forEach((candidate) => {
        html += `
          <div class="candidate-item" style="border: 2px solid #3a3a3a; padding: 1rem; margin-bottom: 1rem; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h4 style="margin: 0 0 0.5rem 0;">${candidate.name} / ${candidate.ar_name}</h4>
              <p style="margin: 0; color: #666; font-size: 0.9rem;">Position: ${candidate.position_name}</p>
              <p style="margin: 0.25rem 0 0 0; color: #666; font-size: 0.9rem;">Party: ${candidate.Supporting_party}</p>
            </div>
            <button class="btn-danger" onclick="removeCandidate(${candidate.id}, ${electionId})" style="padding: 0.5rem 1rem;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 5.98C17.67 5.65 14.32 5.48 10.98 5.48C9 5.48 7.02 5.58 5.04 5.78L3 5.98M8.5 4.97L8.72 3.66C8.88 2.71 9 2 10.69 2H13.31C15 2 15.13 2.75 15.28 3.67L15.5 4.97M18.85 9.14L18.2 19.21C18.09 20.78 18 22 15.21 22H8.79C6 22 5.91 20.78 5.8 19.21L5.15 9.14M10.33 16.5H13.66M9.5 12.5H14.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Remove
            </button>
          </div>
        `;
      });

      html += "</div>";
      content.innerHTML = html;
    })
    .catch((err) => {
      console.error("Error:", err);
      content.innerHTML =
        '<p style="text-align: center; padding: 2rem; color: red;">Failed to load candidates</p>';
    });

  const closeHandler = () => {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  };

  closeBtn.onclick = closeHandler;
  modal.querySelector(".modal-overlay").onclick = closeHandler;
}

function removeCandidate(candidateId, electionId) {
  if (!confirm("Are you sure you want to remove this candidate?")) return;

  const formData = new FormData();
  formData.append("action", "delete");
  formData.append("id", candidateId);

  fetch("../apis/candidate-handler.php", { method: "POST", body: formData })
    .then((res) => res.json())
    .then((data) => {
      if (data.success || data.message) {
        showToast("Candidate removed successfully", "success");
        getListOfCandidates(electionId); // Refresh list
      } else {
        showToast(data.error || "Failed to remove candidate", "error");
      }
    })
    .catch((err) => {
      console.error("Error:", err);
      showToast("An error occurred while removing the candidate", "error");
    });
}

function addNewCandidate(electionId, lang) {
  const modal = document.getElementById("addCandidateModal");
  const form = document.getElementById("addCandidateForm");
  const closeBtn = document.getElementById("closeAddCandidateModal");
  const cancelBtn = document.getElementById("cancelAddCandidateBtn");
  const saveBtn = document.getElementById("saveAddCandidateBtn");
  const positionDropdownMenu = document.getElementById(
    "addPositionDropdownMenu"
  );
  const positionDropdownButton = document.querySelector(
    "#addPositionDropdown .dropdown-text"
  );

  if (!modal || !form) return;

  // Reset form
  form.reset();
  document.getElementById("add_election_id").value = electionId;

  // Reset dropdown
  if (positionDropdownButton) {
    positionDropdownButton.textContent = "Select a position";
  }

  // Load positions for this election
  fetch(
    `../apis/api.php?action=getPositionByElection&id_election=${electionId}`
  )
    .then((res) => res.json())
    .then((positions) => {
      positionDropdownMenu.innerHTML = "";

      if (!positions || positions.length === 0) {
        showToast("Please create a position for this election first.", "error");
        return;
      }

      positions.forEach((pos) => {
        const item = document.createElement("div");
        item.className = "dropdown-item";
        item.setAttribute("data-value", pos.id);
        item.innerHTML = `<span>${pos.en_name} / ${pos.fr_name}</span>`;
        positionDropdownMenu.appendChild(item);
      });

      // Manually initialize dropdown items click handlers
      setTimeout(() => {
        const dropdownContainer = document.getElementById("addPositionDropdown");
        const dropdownButton = dropdownContainer?.querySelector(".dropdown-button");
        const dropdownMenu = dropdownContainer?.querySelector(".dropdown-menu");
        const dropdownItems = dropdownContainer?.querySelectorAll(".dropdown-item");

        if (dropdownButton && dropdownMenu && dropdownItems.length > 0) {
          // Remove existing listeners by cloning
          const newButton = dropdownButton.cloneNode(true);
          dropdownButton.parentNode.replaceChild(newButton, dropdownButton);

          // Add toggle functionality
          newButton.addEventListener("click", function (e) {
            e.stopPropagation();
            newButton.classList.toggle("active");
            dropdownMenu.classList.toggle("active");
          });

          // Add click handlers to items
          dropdownItems.forEach((item) => {
            item.addEventListener("click", function (e) {
              e.stopPropagation();
              const value = item.getAttribute("data-value");

              if (!value) return;

              // Close dropdown
              newButton.classList.remove("active");
              dropdownMenu.classList.remove("active");

              // Dispatch custom event
              const event = new CustomEvent("dropdown:select", {
                bubbles: true,
                detail: { container: dropdownContainer, button: newButton, menu: dropdownMenu, item, value },
              });
              dropdownContainer.dispatchEvent(event);
              document.dispatchEvent(event);
            });
          });

          // Close when clicking outside
          const closeHandler = function (event) {
            if (!dropdownContainer.contains(event.target)) {
              newButton.classList.remove("active");
              dropdownMenu.classList.remove("active");
            }
          };
          document.removeEventListener("click", closeHandler);
          document.addEventListener("click", closeHandler);
        }
      }, 50);

      modal.classList.add("active");
      document.body.style.overflow = "hidden";
    })
    .catch((err) => {
      console.error("Error:", err);
      showToast("Failed to load positions for this election", "error");
    });

  const closeHandler = () => {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  };

  closeBtn.onclick = closeHandler;
  cancelBtn.onclick = closeHandler;
  modal.querySelector(".modal-overlay").onclick = closeHandler;

  form.onsubmit = async function (e) {
    e.preventDefault();

    // Validate position is selected
    const positionInput = document.getElementById("add_id_position");
    if (!positionInput || !positionInput.value) {
      showToast("Please select a position for this candidate.", "error");
      return;
    }

    saveBtn.classList.add("loading");
    saveBtn.disabled = true;

    const formData = new FormData(form);
    formData.append("action", "create");

    try {
      const response = await fetch("../apis/candidate-handler.php", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success || data.id) {
        showToast("Candidate added successfully", "success");
        closeHandler();
        window.location.reload();
      } else {
        showToast(data.error || "Failed to add candidate", "error");
      }
    } catch (err) {
      console.error("Error:", err);
      showToast("An error occurred while adding the candidate", "error");
    } finally {
      saveBtn.classList.remove("loading");
      saveBtn.disabled = false;
    }
  };
}

function addNewPosition(electionId) {
  const modal = document.getElementById("positionModal");
  const form = document.getElementById("positionForm");
  const closeBtn = document.getElementById("closePositionModal");
  const cancelBtn = document.getElementById("cancelPositionBtn");
  const saveBtn = document.getElementById("savePositionBtn");

  if (!modal || !form) return;

  // Reset form
  form.reset();
  document.getElementById("election_id").value = electionId;

  modal.classList.add("active");
  document.body.style.overflow = "hidden";

  const closeHandler = () => {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  };

  closeBtn.onclick = closeHandler;
  cancelBtn.onclick = closeHandler;
  modal.querySelector(".modal-overlay").onclick = closeHandler;

  form.onsubmit = async function (e) {
    e.preventDefault();

    saveBtn.classList.add("loading");
    saveBtn.disabled = true;

    const formData = new FormData(form);
    formData.append("action", "createPosition");

    try {
      const response = await fetch("../apis/api.php", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success || data.id) {
        showToast("Position added successfully", "success");
        closeHandler();
        window.location.reload();
      } else {
        showToast(data.error || "Failed to add Position", "error");
      }
    } catch (err) {
      console.error("Error:", err);
      showToast("An error occurred while adding the position", "error");
    } finally {
      saveBtn.classList.remove("loading");
      saveBtn.disabled = false;
    }
  };
}

function publishResults(electionId) {
  const formData = new FormData();
  formData.append("action", "publishResults");
  formData.append("id_election", electionId);

  fetch("../apis/api.php", {
    method: "POST",
    body: formData,
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Network response was not ok");
      }
      return res.text();
    })
    .then((text) => {
      try {
        const data = JSON.parse(text);
        if (data.error) {
          showToast(data.error || "Failed to publish results", "error");
        } else {
          window.location.reload();
        }
      } catch (e) {
        console.error("JSON parse error:", e, "Response:", text);
        // If we can't parse JSON but got a response, assume success
        window.location.reload();
      }
    })
    .catch((err) => {
      console.error("Network error:", err);
      showToast("Network error occurred. Please try again.", "error");
    });
}

function stopPublishingResults(electionId) {
  const formData = new FormData();
  formData.append("action", "stopPublishingResults");
  formData.append("id_election", electionId);

  fetch("../apis/api.php", {
    method: "POST",
    body: formData,
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Network response was not ok");
      }
      return res.text();
    })
    .then((text) => {
      try {
        const data = JSON.parse(text);
        if (data.error) {
          showToast(data.error || "Failed to unpublish results", "error");
        } else {
          window.location.reload();
        }
      } catch (e) {
        console.error("JSON parse error:", e, "Response:", text);
        // If we can't parse JSON but got a response, assume success
        window.location.reload();
      }
    })
    .catch((err) => {
      console.error("Network error:", err);
      showToast("Network error occurred. Please try again.", "error");
    });
}

function excelFileProcessing(electionId) {
  const modal = document.getElementById("listVotersModal");
  const form = document.getElementById("listVotersForm");
  const closeBtn = document.getElementById("closelistVotersModal");
  const cancelBtn = document.getElementById("cancellistVotersBtn");
  const saveBtn = document.getElementById("savelistVotersBtn");

  if (!modal || !form) return;

  modal.classList.add("active");
  document.body.style.overflow = "hidden";

  const closeHandler = () => {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  };

  closeBtn.onclick = closeHandler;
  cancelBtn.onclick = closeHandler;
  modal.querySelector(".modal-overlay").onclick = closeHandler;

  let jsonData = [];

  document.getElementById("excelFile").addEventListener("change", (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      jsonData = XLSX.utils.sheet_to_json(sheet);
    };

    reader.readAsArrayBuffer(file);
  });

  saveBtn.addEventListener("click", async () => {
    if (jsonData.length === 0) {
      console.log("Please , Enter the Excel file");
      return;
    }

    saveBtn.classList.add("loading");
    saveBtn.disabled = true;

    const requiredKeys = ["ID", "Nationality"];
    const keys = Object.keys(jsonData[0]);

    const hasAllKeys = requiredKeys.every((key) => keys.includes(key));

    if (hasAllKeys) {
      try {
        fetch("../apis/excel-encrytion.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jsonData: jsonData, electionId: electionId }),
        })
          .then((res) => res.text())
          .then((res) => showToast(res, "success"))
          .catch((err) => console.error(err));

        // Just reload the page regardless of response
        closeHandler();
        saveBtn.classList.remove("loading");
        saveBtn.disabled = false;
        // window.location.reload();
      } catch (err) {
        console.error("Error:", err);
        // Still reload even on error since database updates are working
        closeHandler();
        saveBtn.classList.remove("loading");
        saveBtn.disabled = false;
        // window.location.reload();
      }
    } else {
      console.log("format excel no valid");
    }
  });
  form.onsubmit = async function (e) {
    e.preventDefault();
  };
}

function managePositions(electionId) {
  try {
    if (!electionId) return;

    const action = (
      prompt(
        'Type "add" to create a position, or "delete" to remove one for this election:'
      ) || ""
    )
      .trim()
      .toLowerCase();
    if (!action) return;

    if (action === "add") {
      const ar = (prompt("Arabic name:") || "").trim();
      if (!ar) return showToast("Cancelled", "gray");
      const en = (prompt("English name:") || "").trim();
      if (!en) return showToast("Cancelled", "gray");
      const fr = (prompt("French name:") || "").trim();
      if (!fr) return showToast("Cancelled", "gray");

      const formData = new FormData();
      formData.append("action", "addPosition");
      formData.append("ar_name", ar);
      formData.append("en_name", en);
      formData.append("fr_name", fr);
      formData.append("id_election", String(electionId));

      fetch("../apis/api.php", { method: "POST", body: formData })
        .then(async (res) => {
          const text = await res.text();
          try {
            return JSON.parse(text);
          } catch {
            return { raw: text, ok: res.ok };
          }
        })
        .then((data) => {
          if (data && (data.success || data.id)) {
            showToast("Position added successfully", "success");
            window.location.reload();
          } else {
            showToast(
              "Failed to add position" +
                (data && data.error ? `: ${data.error}` : ""),
              "error"
            );
          }
        })
        .catch((err) => {
          console.error(err);
          showToast("Error while adding position", "error");
        });
      return;
    }

    if (action === "delete") {
      if (
        !confirm(
          "Delete a position for this election? This will detach linked candidates."
        )
      )
        return;
      const formData = new FormData();
      formData.append("action", "deletePosition");
      formData.append("id_election", String(electionId));

      fetch("../apis/api.php", { method: "POST", body: formData })
        .then(async (res) => {
          const text = await res.text();
          try {
            return JSON.parse(text);
          } catch {
            return { raw: text, ok: res.ok };
          }
        })
        .then((data) => {
          if (data && (data.success || data.ok)) {
            showToast("Position delete request completed", "success");
            window.location.reload();
          } else {
            showToast(
              "Failed to delete position" +
                (data && data.error ? `: ${data.error}` : ""),
              "error"
            );
          }
        })
        .catch((err) => {
          console.error(err);
          showToast("Error while deleting position", "error");
        });
    }
  } catch (e) {
    console.error(e);
  }
}

// Handle custom dropdown selections
document.addEventListener("dropdown:select", (e) => {
  const { container, value } = e.detail;

  // Position dropdown in add candidate modal
  if (container.id === "addPositionDropdown") {
    const hiddenInput = document.getElementById("add_id_position");
    const button = container.querySelector(".dropdown-button .dropdown-text");
    const selectedItem = container.querySelector(
      `.dropdown-item[data-value="${value}"]`
    );

    if (hiddenInput && button && selectedItem) {
      hiddenInput.value = value;
      button.textContent = selectedItem.textContent.trim();
    }
  }

  // Election type dropdown in election card
  if (container.id && container.id.startsWith("electionTypeDropdown_")) {
    const electionId = container.getAttribute("data-election-id");
    const button = container.querySelector(".dropdown-button .dropdown-text");
    const selectedItem = container.querySelector(
      `.dropdown-item[data-value="${value}"]`
    );

    if (button && selectedItem && electionId) {
      button.textContent = selectedItem.textContent.trim();
      updateElectionType(electionId, value);
    }
  }
});

// Update election type via API
function updateElectionType(electionId, type) {
  const formData = new FormData();
  formData.append("action", "updateElectionType");
  formData.append("election_id", electionId);
  formData.append("election_type", type);

  fetch("../apis/api.php", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "success" || data.success) {
        console.log("Election type updated");
      } else {
        showToast(
          data.message || data.error || "Failed to update election type",
          "error"
        );
      }
    })
    .catch((err) => {
      console.error("Error:", err);
      showToast("An error occurred while updating election type", "error");
    });
}

// Expose functions to global scope for inline onclick handlers
window.addNewCandidate = addNewCandidate;
window.addNewPosition = addNewPosition;
window.getListOfCandidates = getListOfCandidates;
window.publishResults = publishResults;
window.stopPublishingResults = stopPublishingResults;
window.excelFileProcessing = excelFileProcessing;
window.managePositions = managePositions;
