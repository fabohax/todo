import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

type Task = {
  text: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
};

type Note = {
  text: string;
  createdAt: string;
};

type StoredTodoData = {
  pending?: Task[];
  completed?: Task[];
  notes?: Note[];
  tasks?: Task[];
  completedTasks?: Task[];
  "todo-tasks"?: Task[];
  "todo-completed-tasks"?: Task[];
  "todo-notes"?: Note[];
};

const dataFilePath = path.join(process.cwd(), "tasks.json");

const normalizeTodoData = (data: StoredTodoData) => ({
  tasks: Array.isArray(data.tasks)
    ? data.tasks
    : Array.isArray(data.pending)
      ? data.pending
      : Array.isArray(data["todo-tasks"])
        ? data["todo-tasks"]
        : [],
  completedTasks: Array.isArray(data.completedTasks)
    ? data.completedTasks
    : Array.isArray(data.completed)
      ? data.completed
      : Array.isArray(data["todo-completed-tasks"])
        ? data["todo-completed-tasks"]
        : [],
  notes: Array.isArray(data.notes)
    ? data.notes
    : Array.isArray(data["todo-notes"])
      ? data["todo-notes"]
      : [],
});

const readTodoData = async () => {
  try {
    const fileContents = await fs.readFile(dataFilePath, "utf8");
    return normalizeTodoData(JSON.parse(fileContents) as StoredTodoData);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return normalizeTodoData({});
    }

    throw error;
  }
};

export async function GET() {
  const todoData = await readTodoData();
  return NextResponse.json(todoData);
}

export async function POST(request: Request) {
  const data = normalizeTodoData((await request.json()) as StoredTodoData);
  const temporaryFilePath = `${dataFilePath}.tmp`;

  await fs.writeFile(
    temporaryFilePath,
    `${JSON.stringify(
      {
        pending: data.tasks,
        completed: data.completedTasks,
        notes: data.notes,
      },
      null,
      2
    )}\n`,
    "utf8"
  );
  await fs.rename(temporaryFilePath, dataFilePath);

  return NextResponse.json(data);
}
