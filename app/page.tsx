// /app/page.tsx
"use client";

import { useState, useEffect } from "react";

type Task = {
  text: string;
  completed: boolean;
};

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<string>("");

  // Fetch tasks and completed tasks when the app loads
  useEffect(() => {
    const fetchTasks = async () => {
      const response = await fetch("/api/save-tasks");
      const data = await response.json();
      setTasks(data.pending || []);
      setCompletedTasks(data.completed || []);
    };
    fetchTasks();
  }, []);

  const addTask = () => {
    if (newTask.trim()) {
      const updatedTasks = [...tasks, { text: newTask, completed: false }];
      setTasks(updatedTasks);
      saveTasks(updatedTasks, completedTasks);
      setNewTask("");
    }
  };  

  const toggleCompletion = (index: number, isCompleted: boolean) => {
    if (isCompleted) {
      const task = completedTasks[index];
      const updatedCompletedTasks = completedTasks.filter((_, i) => i !== index);
      const updatedTasks = [...tasks, { ...task, completed: false }];
      setCompletedTasks(updatedCompletedTasks);
      setTasks(updatedTasks);
      saveTasks(updatedTasks, updatedCompletedTasks);
    } else {
      const task = tasks[index];
      const updatedTasks = tasks.filter((_, i) => i !== index);
      const updatedCompletedTasks = [...completedTasks, { ...task, completed: true }];
      setTasks(updatedTasks);
      setCompletedTasks(updatedCompletedTasks);
      saveTasks(updatedTasks, updatedCompletedTasks);
    }
  };

  const deleteTask = (index: number, isCompleted: boolean) => {
    if (isCompleted) {
      const updatedCompletedTasks = completedTasks.filter((_, i) => i !== index);
      setCompletedTasks(updatedCompletedTasks);
      saveTasks(tasks, updatedCompletedTasks);
    } else {
      const updatedTasks = tasks.filter((_, i) => i !== index);
      setTasks(updatedTasks);
      saveTasks(updatedTasks, completedTasks);
    }
  };

  const saveTasks = async (tasks: Task[], completedTasks: Task[]) => {
    const data = { pending: tasks, completed: completedTasks };
    await fetch("/api/save-tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }} className="lg:w-1/2 lg:mx-auto my-20 text-[2rem]">
      
      <div className="flex items-center space-x-2">
        <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => {
            if (e.key === "Enter") {
                addTask();
            }
            }}
            placeholder="░"
            className="p-4 border border-gray-300 rounded-lg w-full bg-transparent"
        />
        <button
            onClick={addTask}
            className="p-4 border border-gray-300 rounded-lg w-full bg-transparent hover:bg-[#151515]"
        >
            +
        </button>
    </div>

      <ul className="my-8 mx-4">
        {tasks.map((task, index) => (
          <li
            key={index}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            - {task.text}
            <div className="flex space-x-2">
              <button onClick={() => toggleCompletion(index, false)} className="p-4 border border-gray-300 rounded-lg w-full bg-transparent">√</button>
              <button onClick={() => deleteTask(index, false)} className="p-4 border border-gray-300 rounded-lg w-full bg-transparent">×</button>
            </div>
          </li>
        ))}
      </ul>

      <hr/>
      <ul className="my-8 mx-4 text-[#333]">
        {completedTasks.map((task, index) => (
          <li
            key={index}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            <span style={{textDecoration: "line-through"}}>- {task.text}</span>
            <div className="flex space-x-2">
              <button onClick={() => toggleCompletion(index, true)} className="p-4 border border-[#333] rounded-lg w-full bg-transparent">-</button>
              <button onClick={() => deleteTask(index, true)} className="p-4 border border-[#333] rounded-lg w-full bg-transparent">×</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
