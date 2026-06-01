const fs = require("fs");
const path = require("path");

const SERVER_URL = process.env.SERVER_URL || "http://localhost:5000";
const LOGIN_EMAIL = process.env.TEST_TEACHER_EMAIL || "teacher@vidyasetu.com";
const LOGIN_PASSWORD = process.env.TEST_TEACHER_PASSWORD || "Teacher@123";

const login = async () => {
  const res = await fetch(`${SERVER_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: LOGIN_EMAIL, password: LOGIN_PASSWORD }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Login failed: ${data.message || res.statusText}`);
  }
  return data.token;
};

const createTeacherCourse = async (token) => {
  const form = new FormData();
  form.append("title", "API Test Course");
  form.append("description", "This course was created by an automated API test.");
  form.append("shortDescription", "Automated route test");
  form.append("category", "Mathematics");
  form.append("level", "Beginner");
  form.append("language", "English");
  form.append("price", "2499");
  form.append("discountPrice", "1499");
  form.append("requirements", JSON.stringify(["Basic algebra", "Interest in learning"]));
  form.append("learningOutcomes", JSON.stringify(["Understand core concepts", "Solve example problems"]));
  form.append("targetAudience", JSON.stringify(["School students", "Competitive exam aspirants"]));

  const thumbnailPath = path.join(__dirname, "test-thumbnail.png");
  if (fs.existsSync(thumbnailPath)) {
    form.append("thumbnail", fs.createReadStream(thumbnailPath));
  }

  const res = await fetch(`${SERVER_URL}/api/teacher/courses`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: form,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Course creation failed: ${data.message || res.statusText}`);
  }
  return data.course;
};

const run = async () => {
  try {
    console.log("Logging in as teacher...");
    const token = await login();
    console.log("Authenticated successfully.");

    console.log("Creating teacher course...");
    const course = await createTeacherCourse(token);
    console.log("Course created successfully:", course);
    process.exit(0);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

run();
