import fs from "fs";
import path from "path";

export default function handler(req, res) {
  const filePath = path.join(process.cwd(), "tasks.json");

  if (req.method === "POST") {
    const { pending, completed } = req.body;

    // Write tasks to the JSON file
    const data = { pending, completed };
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    return res.status(200).json({ message: "Tasks saved successfully!" });
  } else if (req.method === "GET") {
    // Read tasks from the JSON file
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
      return res.status(200).json(data);
    } else {
      return res.status(200).json({ pending: [], completed: [] });
    }
  }

  res.status(405).json({ message: "Method Not Allowed" });
}
