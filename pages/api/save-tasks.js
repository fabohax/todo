import fs from "fs";
import path from "path";

export default function handler(req, res) {
  const filePath = path.join(process.cwd(), "tasks.json");

  if (req.method === "POST") {
    try {
      const { pending, completed } = req.body;

      if (!Array.isArray(pending) || !Array.isArray(completed)) {
        return res.status(400).json({ message: "Invalid task data format" });
      }

      // Write tasks to the JSON file
      const data = { pending, completed };
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

      return res.status(200).json({ message: "Tasks saved successfully!" });
    } catch (error) {
      console.error("Error writing tasks:", error);
      return res.status(500).json({ message: "Failed to save tasks" });
    }
  } else if (req.method === "GET") {
    try {
      // Check if the tasks.json file exists
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
        return res.status(200).json(data);
      } else {
        // If the file doesn't exist, return an empty tasks structure
        return res.status(200).json({ pending: [], completed: [] });
      }
    } catch (error) {
      console.error("Error reading tasks:", error);
      return res.status(500).json({ message: "Failed to load tasks" });
    }
  } else {
    // Handle unsupported methods
    return res.status(405).json({ message: "Method Not Allowed" });
  }
}
