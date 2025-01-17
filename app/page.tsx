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

  const addTask = () => {
    if (newTask.trim()) {
      const updatedTasks = [...tasks, { text: newTask, completed: false }];
      setTasks(updatedTasks);
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
    } else {
      const task = tasks[index];
      const updatedTasks = tasks.filter((_, i) => i !== index);
      const updatedCompletedTasks = [...completedTasks, { ...task, completed: true }];
      setTasks(updatedTasks);
      setCompletedTasks(updatedCompletedTasks);
    }
  };

  const deleteTask = (index: number, isCompleted: boolean) => {
    if (isCompleted) {
      const updatedCompletedTasks = completedTasks.filter((_, i) => i !== index);
      setCompletedTasks(updatedCompletedTasks);
    } else {
      const updatedTasks = tasks.filter((_, i) => i !== index);
      setTasks(updatedTasks);
    }
  };

  return (
    <div className="p-6 lg:w-1/2 lg:mx-auto my-20 text-[1.5rem]">
      <h1 className="text-center text-3xl font-bold mb-8 hidden">TODO</h1>

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
          className="px-11 p-4 border border-gray-300 rounded-lg bg-transparent hover:bg-gray-800 hover:text-white transition"
        >
          +
        </button>
      </div>

      {/* Pending Tasks */}
      <ul className="mb-8 space-y-4">
        {tasks.map((task, index) => (
          <li key={index} className="flex justify-between items-center">
            <span>- {task.text}</span>
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

      <hr/>

      {/* Completed Tasks */}
      <ul className="space-y-4 my-8">
        {completedTasks.map((task, index) => (
          <li key={index} className="flex justify-between items-center text-gray-500">
            <span className="line-through">- {task.text}</span>
            <div className="flex space-x-2">
              <button
                onClick={() => toggleCompletion(index, true)}
                className="px-3 p-2 border border-gray-300 rounded hover:bg-yellow-500 hover:text-white transition select-none"
              >
                ↩
              </button>
              <button
                onClick={() => deleteTask(index, true)}
                className="px-4 p-2 border border-gray-300 rounded hover:bg-red-500 hover:text-white transition select-none"
              >
                ×
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
