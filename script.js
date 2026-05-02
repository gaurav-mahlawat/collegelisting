const modal = document.querySelector(".modal");
const openButtons = document.querySelectorAll("[data-open-modal]");
const closeButton = document.querySelector(".close");
const applicationForms = document.querySelectorAll(".applicationForm");
const courseSelects = document.querySelectorAll("[data-course-select]");
const stateSelects = document.querySelectorAll("[data-state-select]");
const API_URL = window.location.protocol === "file:"
  ? "http://localhost:3000/api/applications"
  : "/api/applications";

const defaultCourses = [
  "B.Tech. Computer Science and Engineering",
  "B.Tech. Civil Engineering (L&T EduTech)",
  "B.Tech. Electronics and Communication Engineering (L&T EduTech)",
  "B.Tech. Electronics and Communication Engineering (Semiconductor & Chip Design) with Truechip",
  "B.Tech. Mechanical Engineering (L&T EduTech)",
  "B.Tech. Mechanical Engineering (Electric Vehicles)",
  "B.Tech. (CSE) Artificial Intelligence and Data Science",
  "B.Tech. (CSE) AI DevOps & Cloud Automation",
  "B.Tech. (CSE) Gaming Technology",
  "B.Tech. (CSE) Generative AI (L&T EduTech)",
  "B.Tech. (CSE) Software Product Engineering with Kalvium",
  "B.Tech. (CSE) Artificial Intelligence and Machine Learning (Xebia)",
  "B.Tech. (CSE) Full Stack Web Design and Development (Xebia)",
  "B.Tech. (CSE) Data Science and Data Analytics (Samatrix.io)",
  "B.Tech. (CSE) Cyber Security (EC-Council, USA)",
  "B.Tech. Computer Science and Business Systems (TCS)",
  "B.Tech. (CSE) Cloud Computing (Microsoft)",
  "B.Tech. (CSE) Cloud Computing (AWS Verified Program)",
  "B.Tech. Lateral / Migration",
  "M.Tech. (CSE | Civil | EE | ECE | Mech.)",
  "BCA",
  "BCA Health Informatics",
  "BCA Artificial Intelligence and Data Science",
  "BCA Data Science and Data Analytics (Samatrix.io)",
  "BCA Artificial Intelligence and Machine Learning (IBM)",
  "BCA Cloud Computing and Full Stack Development (IBM)",
  "BCA Cyber Security (EC-Council, USA)",
  "BCA Full Stack Web Design and Development (Xebia)",
  "BCA Cloud Computing (AWS Verified Program)",
  "MCA",
  "MCA Artificial Intelligence and Data Science",
  "MCA Artificial Intelligence and Machine Learning (Samatrix.io)",
  "MCA Data Science and Data Analytics (Samatrix.io)",
  "MCA Cyber Security (EC-Council, USA)",
  "MCA Cloud Computing and Full Stack Development (IBM)",
  "MCA Cloud Computing (AWS Verified Program)",
  "BBA",
  "BBA (HR | FM | MM | BA | IB | IT)",
  "BBA Fintech",
  "BBA Data Analytics and Data Visualization",
  "BBA Banking Financial Service and Insurance",
  "BBA New Age Digital Marketing",
  "BBA Tourism and Hospitality Management",
  "MBA",
  "MBA Dual Specialization",
  "MBA Data Analytics and Data Visualization",
  "MBA Artificial Intelligence",
  "MBA Fintech",
  "MBA Global Finance and AI",
  "B.Com",
  "B.Com. Capital Market",
  "M.Com.",
  "B.Sc. Hospitality and Hotel Management",
  "B.A. Journalism & Mass Communication",
  "M.A. Journalism & Mass Communication",
  "M.A. Filmmaking",
  "B.Sc. (Hons.) Physics",
  "B.Sc. (Hons.) Chemistry",
  "B.Sc. (Hons.) Mathematics",
  "B.Sc. (Hons.) Biotechnology",
  "B.Sc. (Hons.) Microbiology",
  "B.Sc. (Hons.) Forensic Science",
  "B.Sc. Pass Course",
  "M.Sc. Physics",
  "M.Sc. Chemistry",
  "M.Sc. Mathematics",
  "M.Sc. Botany",
  "M.Sc. Zoology",
  "M.Sc. Biotechnology",
  "M.Sc. Microbiology",
  "M.Sc. Forensic Science",
  "B.A. LL.B. (Hons.)",
  "B.Sc. LL.B. (Hons.)",
  "BBA LL.B. (Hons.)",
  "LL.M. Business Law",
  "LL.M. IPR",
  "LL.M. Personal Law",
  "Bachelor of Visual Arts (BVA)",
  "B.Des. Fashion Design",
  "B.Des. Interior Design",
  "B.Des. Jewellery Design and Manufacturing",
  "B.Des. Game Art & Animation",
  "M.Des. Interior Design",
  "M.Sc. Jewellery Design",
  "M.Sc. Graphic Design",
  "M.Sc. Fashion Design",
  "B.A. (Hons.) English",
  "B.A. (Hons.) Psychology",
  "B.A. (Hons.) Political Science",
  "B.A. (Hons.) Economics",
  "B.A. Liberal Studies",
  "B.A. Liberal Studies - Linguistics",
  "B.A. Liberal Studies - International Relations & Diplomacy",
  "B.A. Liberal Studies - Public Policy & Governance",
  "B.A. Liberal Studies - Entrepreneurship & Family Business",
  "M.A. English",
  "M.A. Economics",
  "M.A. Psychology (Clinical)",
  "M.A. Political Science",
  "M.A. International Relations",
  "Bachelor of Physiotherapy (BPT)",
  "Master of Physiotherapy (MPT)",
  "B.Sc. Medical Lab Technology (BMLT)",
  "B.Sc. Radiation and Imaging Technology (BRIT)",
  "M.Sc. Clinical Embryology",
  "PG Diploma in Digital Media",
  "PG Diploma in Investigative Journalism",
  "PG Diploma in Cinema Studies",
  "Ph.D. in Sciences",
  "Ph.D. in Engineering & Technology",
  "Ph.D. in Business Studies",
  "Ph.D. in Humanities & Social Sciences",
  "Ph.D. in Computer Applications",
  "Ph.D. in Mass Communication",
  "Ph.D. in Economics",
  "Ph.D. in Law",
  "Ph.D. in Design",
  "Ph.D. in Hospitality"
];

const courses = window.COLLEGE_COURSES || defaultCourses;

const states = [
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

function populateSelect(select, values) {
  const placeholder = select.querySelector("option")?.outerHTML || "";
  select.innerHTML = `${placeholder}${values.map((value) => `<option value="${value}">${value}</option>`).join("")}`;
}

courseSelects.forEach((select) => populateSelect(select, courses));
stateSelects.forEach((select) => populateSelect(select, states));

function openModal(event) {
  const collegeInput = modal.querySelector('input[name="college"]');
  const college = event?.currentTarget?.dataset.college || collegeInput.value || "JECRC University, Jaipur";

  collegeInput.value = college;
  modal.querySelector("h2").textContent = `Apply Now for ${college}`;
  modal.classList.add("isOpen");
  modal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  modal.classList.remove("isOpen");
  modal.setAttribute("aria-hidden", "true");
}

function setMessage(form, text, type) {
  const message = form.querySelector(".formMessage");
  message.textContent = text;
  message.className = `formMessage ${type || ""}`.trim();
}

function getPayload(form) {
  const formData = new FormData(form);
  return Object.fromEntries(formData.entries());
}

async function submitApplication(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const button = form.querySelector('button[type="submit"]');
  const originalText = button.textContent;

  setMessage(form, "Submitting application...", "");
  button.disabled = true;
  button.textContent = "Submitting...";

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(getPayload(form))
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Unable to submit the application.");
    }

    form.reset();
    form.querySelector('input[name="college"]').value = result.application.college;
    form.querySelector('input[name="source"]').value = form.dataset.source || "website";
    setMessage(form, "Thank you.", "success");

    if (form.closest(".modalCard")) {
      setTimeout(closeModal, 900);
    }
  } catch (error) {
    const message = window.location.protocol === "file:"
      ? "Backend is not connected. Start it with npm start, then submit again."
      : error.message;
    setMessage(form, message, "error");
  } finally {
    button.disabled = false;
    button.textContent = originalText;
  }
}

openButtons.forEach((button) => {
  button.addEventListener("click", openModal);
});

closeButton.addEventListener("click", closeModal);

modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    closeModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeModal();
  }
});

applicationForms.forEach((form) => {
  form.addEventListener("submit", submitApplication);
});
