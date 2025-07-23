Mess Feedback System
Overview
The Mess Feedback System is a web-based platform for collecting and analyzing student cafeteria (mess) feedback. Students can register/login and submit feedback on their mess experience, specifying details such as mess type, living block, and comments. Administrators can log in to a dashboard where they review all submissions, apply filters, and export data for reporting. The homepage hero section even describes it as “a comprehensive platform for students to provide feedback and administrators to analyze data for better mess services”. Overall, the system aims to streamline mess management by giving students a voice and empowering admins with tools to address issues and improve services.
Features
Student & Admin Authentication: The interface provides separate modals for student and admin login and sign-up. Users can click “Login” or “Sign Up” to open a modal with tabs for Student Login/Signup and Admin Login/Signup. Each form collects the necessary credentials (e.g. reg. number or employee ID, plus password) for authentication.
Feedback Submission: Once logged in as a student, a feedback form is available (hidden until login) where the student’s name and reg. number are pre-filled. The form lets the student specify their block, room, mess name, and choose the type of mess (Veg, Non-Veg, Special, or Night Mess). They also select a feedback category (Quality, Quantity, Hygiene, Timing, or Others), and enter comments or suggestions. An optional proof file (PDF/DOC/JPG) can be attached for reference. Submitting the form triggers a success modal confirming that the feedback was submitted.
Admin Dashboard: After admins log in, they see a dashboard with filter controls and data reports. The sidebar includes filters for student registration number, mess name, block, and date range. Admins can Apply or Reset these filters to refine the feedback list. Export buttons allow downloading the filtered feedback data to Excel or PDF files. Above the table, summary cards display key statistics such as Total Feedback, This Week, and This Month counts. The table below lists all matching feedback entries (ID, student, mess, category, date, etc.), and each entry has a “View” button to see detailed feedback in a modal.
Responsive UI & Feedback Modals: The layout is responsive, adapting to smaller screens with a mobile-friendly navigation and stacked sections. Interactive feedback is given via modal dialogs and inline messages. For example, on successful operations (like submitting feedback) a success modal with a checkmark is shown, and errors are shown in a slide-in notification box. These modals and alerts ensure users receive clear confirmation or error messages during interactions.
Tech Stack
Frontend: Vanilla HTML, CSS, and JavaScript. The UI uses flexbox/grid layouts and custom CSS variables for colors.
Backend API: The frontend communicates with a backend server via REST API calls. In this setup, the backend is assumed to run locally (e.g. at http://localhost:8080), as indicated by the API_URL in the JS code.
Libraries: No large frameworks are used; everything is implemented with plain web technologies for simplicity and quick deployment.
Installation & Setup
Clone the repository:
bash
Copy
Edit
git clone https://github.com/yourusername/mess-feedback-system.git
cd mess-feedback-system
Run a local server: The HTML/JS app should be served over HTTP. You can use a VS Code Live Server, Python’s http.server, or any simple HTTP server. For example, with Python:
bash
Copy
Edit
python3 -m http.server 8000
Start the backend: Ensure your backend API server is running and listening on http://localhost:8080 (or adjust the API_URL in script.js to match your setup). Without the backend, the frontend will not be able to fetch or submit data.
Open the app: In your browser, navigate to the server address (e.g. http://localhost:8000/index.html). You should see the Mess Feedback homepage.
Usage
As a Student: Click Sign Up to register with your name and registration number. After signing up, click Login and use your reg. number and password to log in. Once logged in, the feedback form appears. Enter your block, room, mess name, select mess type and category, write your comments/suggestions, attach any proof document, and submit. You’ll see a confirmation modal on success. You can then log out if needed.
As an Admin: Click Login and enter your employee ID and password to access the admin dashboard. Here you’ll see a list of all feedback entries (initially unfiltered). Use the sidebar filters to narrow down by student, mess, block, or date. Click Apply Filters to update the list, or Reset to clear filters. The Export to Excel and Export to PDF buttons will download the currently filtered feedback data. Click View on any entry to see full details in a pop-up modal. Use the logout button to end your session when done.
Folder Structure
index.html – The main HTML page, containing the home content, login/signup modals, feedback form, and admin dashboard sections (mostly hidden until login).
styles.css – All custom styles for layout, colors, and responsiveness (flexbox/grid layout, CSS variables, and media queries for mobile).
script.js – JavaScript code to handle UI interactivity and API calls. This includes opening/closing modals, form submission handlers, fetching data from the backend, applying filters, and exporting data.
