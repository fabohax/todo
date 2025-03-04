"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Task = {
  text: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
};

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<string>("");

  const [draggedTaskIndex, setDraggedTaskIndex] = useState<number | null>(null);

  // Load tasks from Local Storage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem("todo-tasks");
    const savedCompletedTasks = localStorage.getItem("todo-completed-tasks");

    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedCompletedTasks) setCompletedTasks(JSON.parse(savedCompletedTasks));
  }, []);

  // Save tasks to Local Storage whenever they change
  useEffect(() => {
    localStorage.setItem("todo-tasks", JSON.stringify(tasks));
    localStorage.setItem("todo-completed-tasks", JSON.stringify(completedTasks));
  }, [tasks, completedTasks]);

  // Format timestamp for display
  const formatDate = (timestamp: string) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return date.toLocaleString(); // Formats as a readable date
  };

  // ✅ Ensure createdAt is stored when adding tasks
  const addTask = () => {
    if (newTask.trim()) {
      const newTaskObject: Task = {
        text: newTask,
        completed: false,
        createdAt: new Date().toISOString(), // Store timestamp
      };

      const updatedTasks = [newTaskObject, ...tasks];
      setTasks(updatedTasks);
      localStorage.setItem("todo-tasks", JSON.stringify(updatedTasks)); // Save to LocalStorage

      setNewTask(""); // Clear input field
    }
  };

  // ✅ Store completedAt timestamp when completing tasks
  const toggleCompletion = (index: number, isCompleted: boolean) => {
    if (isCompleted) {
      const task = completedTasks[index];
      const updatedCompletedTasks = completedTasks.filter((_, i) => i !== index);
      const updatedTasks = [
        ...tasks,
        { ...task, completed: false, completedAt: undefined }, // Remove completed timestamp
      ];
      setCompletedTasks(updatedCompletedTasks);
      setTasks(updatedTasks);

      localStorage.setItem("todo-tasks", JSON.stringify(updatedTasks));
      localStorage.setItem("todo-completed-tasks", JSON.stringify(updatedCompletedTasks));
    } else {
      const task = tasks[index];
      const updatedTasks = tasks.filter((_, i) => i !== index);
      const updatedCompletedTasks = [
        ...completedTasks,
        { ...task, completed: true, completedAt: new Date().toISOString() }, // Store completion timestamp
      ];
      setTasks(updatedTasks);
      setCompletedTasks(updatedCompletedTasks);

      localStorage.setItem("todo-tasks", JSON.stringify(updatedTasks));
      localStorage.setItem("todo-completed-tasks", JSON.stringify(updatedCompletedTasks));
    }
  };

  // Delete task
  const deleteTask = (index: number, isCompleted: boolean) => {
    if (isCompleted) {
      const updatedCompletedTasks = completedTasks.filter((_, i) => i !== index);
      setCompletedTasks(updatedCompletedTasks);
      localStorage.setItem("todo-completed-tasks", JSON.stringify(updatedCompletedTasks));
    } else {
      const updatedTasks = tasks.filter((_, i) => i !== index);
      setTasks(updatedTasks);
      localStorage.setItem("todo-tasks", JSON.stringify(updatedTasks));
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedTaskIndex(index);
  };

  const handleDrop = (targetIndex: number, isCompleted: boolean) => {
    if (draggedTaskIndex === null) return;

    if (isCompleted) {
      const reorderedTasks = [...completedTasks];
      const [movedTask] = reorderedTasks.splice(draggedTaskIndex, 1);
      reorderedTasks.splice(targetIndex, 0, movedTask);
      setCompletedTasks(reorderedTasks);
    } else {
      const reorderedTasks = [...tasks];
      const [movedTask] = reorderedTasks.splice(draggedTaskIndex, 1);
      reorderedTasks.splice(targetIndex, 0, movedTask);
      setTasks(reorderedTasks);
    }

    setDraggedTaskIndex(null);
  };

  return (
    <div className="p-6 lg:w-1/2 lg:mx-auto my-20 text-[1.5rem]">
      {/* Add Task Section */}
      <div className="flex items-center space-x-2 mb-8">
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
          className="px-11 p-4 border border-gray-300 rounded-lg bg-transparent hover:bg-[#fff] hover:text-black transition"
        >
          +
        </button>
      </div>

      {/* Pending Tasks */}
      <ul className="mb-8 space-y-4">
        {tasks.map((task, index) => (
          <li
            key={index}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(index, false)}
            className="flex bg-[#111] justify-between items-center pl-4 rounded-lg shadow-sm cursor-grab p-4"
          >
            <div>
              <span>• {task.text}</span>
              <div className="text-xs text-gray-600">
                ■ {task.createdAt ? formatDate(task.createdAt) : "N/A"}
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => toggleCompletion(index, false)}
                className="px-4 p-2 border border-gray-300 rounded hover:bg-green-500 hover:text-white transition select-none"
              >
                √
              </button>
              <button
                onClick={() => deleteTask(index, false)}
                className="px-4 p-2 border border-gray-300 rounded hover:bg-red-500 hover:text-white transition select-none"
              >
                ×
              </button>
            </div>
          </li>
        ))}
      </ul>

      <hr />

      {/* Completed Tasks */}
      <ul className="space-y-4 my-8">
        {completedTasks.map((task, index) => (
          <li
            key={index}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(index, true)}
            className="flex justify-between items-center text-gray-500 p-4"
          >
            <div>
              <span className="line-through">- {task.text}</span>
              <div className="text-xs text-gray-600">
                ■ {task.createdAt ? formatDate(task.createdAt) : "N/A"}
              </div>
              {task.completedAt && (
                <div className="text-xs text-gray-600">
                  ■ {formatDate(task.completedAt)}
                </div>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => toggleCompletion(index, true)}
                className="px-3 p-2 border border-[#222] rounded hover:bg-yellow-500 hover:text-white transition select-none"
              >
                ↩
              </button>
              <button
                onClick={() => deleteTask(index, true)}
                className="px-4 p-2 border border-[#222] rounded hover:bg-red-500 hover:text-white transition select-none"
              >
                ×
              </button>
            </div>
          </li>
        ))}
      </ul>
      <div> 
        <Link href="https://github.com/fabohax/todo" target="_blank" className="absolute bottom-2 right-2 mx-auto hover:underline text-[.75em] text-[#333]">🄯 OS</Link>
      </div>
    </div>
  );
}
