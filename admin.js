const applicationsBody = document.querySelector("#applicationsBody");
const refreshButton = document.querySelector("#refreshApplications");
const statusFilter = document.querySelector("#statusFilter");
const collegeFilter = document.querySelector("#collegeFilter");
const stateFilter = document.querySelector("#stateFilter");
const sourceFilter = document.querySelector("#sourceFilter");
const searchFilter = document.querySelector("#searchFilter");
const clearFiltersButton = document.querySelector("#clearFilters");
const leadCount = document.querySelector("#leadCount");
const API_URL = window.location.protocol === "file:"
  ? "http://localhost:3000/api/applications"
  : "/api/applications";

let applications = [];

const collegeOptions = [
  "JECRC University, Jaipur",
  "Vivekananda Global University, Jaipur"
];

const stateOptions = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry"
];

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function getStatus(application) {
  return application.status || "active";
}

function uniqueOptions(field) {
  return [...new Set(applications.map((application) => application[field]).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b));
}

function fillFilter(select, values, label) {
  const selected = select.value;
  select.innerHTML = `<option value="">${label}</option>${values.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join("")}`;

  if (values.includes(selected)) {
    select.value = selected;
  }
}

function updateFilterOptions() {
  fillFilter(collegeFilter, collegeOptions, "All Colleges");
  fillFilter(stateFilter, stateOptions, "All States");
  fillFilter(sourceFilter, uniqueOptions("source"), "All Sources");
}

function getFilteredApplications() {
  const status = statusFilter.value;
  const search = searchFilter.value.trim().toLowerCase();

  return applications.filter((application) => {
    const applicationStatus = getStatus(application);
    const matchesStatus = status === "all" || applicationStatus === status;
    const matchesCollege = !collegeFilter.value || application.college === collegeFilter.value;
    const matchesState = !stateFilter.value || application.state === stateFilter.value;
    const matchesSource = !sourceFilter.value || application.source === sourceFilter.value;
    const haystack = [
      application.fullName,
      application.email,
      application.mobile,
      application.course,
      application.college,
      application.state,
      application.source
    ].join(" ").toLowerCase();
    const matchesSearch = !search || haystack.includes(search);

    return matchesStatus && matchesCollege && matchesState && matchesSource && matchesSearch;
  });
}

function renderApplications() {
  const filteredApplications = getFilteredApplications();
  const label = filteredApplications.length === 1 ? "lead" : "leads";
  leadCount.textContent = `${filteredApplications.length} ${label} shown`;

  if (!filteredApplications.length) {
    applicationsBody.innerHTML = '<tr><td colspan="10">No leads match these filters.</td></tr>';
    return;
  }

  applicationsBody.innerHTML = filteredApplications.map((application) => {
    const status = getStatus(application);
    const nextStatus = status === "trash" ? "active" : "trash";
    const buttonText = status === "trash" ? "Restore" : "Move to Trash";

    return `
      <tr>
        <td>${escapeHtml(formatDate(application.createdAt))}</td>
        <td>${escapeHtml(application.fullName)}</td>
        <td>${escapeHtml(application.course)}</td>
        <td>${escapeHtml(application.email)}</td>
        <td>${escapeHtml(application.mobile)}</td>
        <td>${escapeHtml(application.state)}</td>
        <td>${escapeHtml(application.college)}</td>
        <td>${escapeHtml(application.source)}</td>
        <td><span class="statusPill ${escapeHtml(status)}">${escapeHtml(status)}</span></td>
        <td><button class="tableAction" type="button" data-id="${escapeHtml(application.id)}" data-status="${nextStatus}">${buttonText}</button></td>
      </tr>
    `;
  }).join("");
}

async function loadApplications() {
  applicationsBody.innerHTML = '<tr><td colspan="10">Loading applications...</td></tr>';

  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error("Unable to load applications.");
    }

    applications = await response.json();
    updateFilterOptions();
    renderApplications();
  } catch (error) {
    applicationsBody.innerHTML = '<tr><td colspan="10">Could not load applications. Please make sure the backend server is running.</td></tr>';
    leadCount.textContent = "0 leads";
  }
}

async function updateLeadStatus(id, status) {
  const response = await fetch(`${API_URL}/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  });

  if (!response.ok) {
    throw new Error("Could not update lead.");
  }

  const result = await response.json();
  applications = applications.map((application) => (
    application.id === id ? result.application : application
  ));
  updateFilterOptions();
  renderApplications();
}

function clearFilters() {
  statusFilter.value = "active";
  collegeFilter.value = "";
  stateFilter.value = "";
  sourceFilter.value = "";
  searchFilter.value = "";
  renderApplications();
}

refreshButton.addEventListener("click", loadApplications);
statusFilter.addEventListener("change", renderApplications);
collegeFilter.addEventListener("change", renderApplications);
stateFilter.addEventListener("change", renderApplications);
sourceFilter.addEventListener("change", renderApplications);
searchFilter.addEventListener("input", renderApplications);
clearFiltersButton.addEventListener("click", clearFilters);

applicationsBody.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-id][data-status]");
  if (!button) {
    return;
  }

  button.disabled = true;
  button.textContent = "Updating...";

  try {
    await updateLeadStatus(button.dataset.id, button.dataset.status);
  } catch (error) {
    button.disabled = false;
    button.textContent = button.dataset.status === "active" ? "Restore" : "Move to Trash";
    alert(error.message);
  }
});

loadApplications();
