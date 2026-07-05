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
};

const dataFilePath = path.join(process.cwd(), "tasks.json");

const normalizeTodoData = (data: StoredTodoData) => ({
  tasks: Array.isArray(data.tasks)
    ? data.tasks
    : Array.isArray(data.pending)
      ? data.pending
      : [],
  completedTasks: Array.isArray(data.completedTasks)
    ? data.completedTasks
    : Array.isArray(data.completed)
      ? data.completed
      : [],
  notes: Array.isArray(data.notes) ? data.notes : [],
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

  await fs.writeFile(
    dataFilePath,
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

  return NextResponse.json(data);
}
