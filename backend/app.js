const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const cv = require("opencv4nodejs");

const PORT = 5000;
const app = express();

app.use(cors());
app.use(express.json());

// Create folders if they don't exist
["uploads", "output"].forEach((folder) => {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder);
  }
});

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Image upload and processing
app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    console.log("📥 File received:", req.file);

    const inputPath = req.file.path;
    const outputPath = `output/processed-${req.file.filename}`;

    if (!fs.existsSync(inputPath)) {
      console.error("❌ File not found:", inputPath);
      return res.status(400).send("Uploaded file not found.");
    }

    console.log("🧠 Processing image with OpenCV...");

    // Read the image using OpenCV
    let image = cv.imread(inputPath);

    // Convert to grayscale
    let gray = image.bgrToGray();

    // Apply Canny edge detection
    let edges = gray.canny(50, 150);

    // Invert the image to get black contours on white background
    let inverted = edges.bitwiseNot();

    // Save the resulting image
    cv.imwrite(outputPath, inverted);

    console.log("✅ Coloring page created:", outputPath);
    res.sendFile(path.resolve(outputPath));
  } catch (err) {
    console.error("❌ Processing error:", err.stack || err);
    res.status(500).send("Image processing failed.");
  }
});

// Serve static files from output folder
app.use("/output", express.static(path.join(__dirname, "output")));

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
