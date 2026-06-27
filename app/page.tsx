"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";

type Task = {
  text: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
};

type ContributionDay = {
  date: Date;
  count: number;
  level: number;
};

const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];
const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const INTENSITY_CLASSES = [
  "bg-[#161b22]",
  "bg-[#0e4429]",
  "bg-[#006d32]",
  "bg-[#26a641]",
  "bg-[#39d353]",
];

const getDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getContributionLevel = (count: number) => {
  if (count === 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 5) return 3;
  return 4;
};

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<string>("");
  const [draggedTaskIndex, setDraggedTaskIndex] = useState<number | null>(null);

  const contributionWeeks = useMemo(() => {
    const completionsByDate = completedTasks.reduce<Record<string, number>>(
      (counts, task) => {
        if (!task.completedAt) return counts;

        const completedDate = new Date(task.completedAt);
        if (Number.isNaN(completedDate.getTime())) return counts;

        const dateKey = getDateKey(completedDate);
        counts[dateKey] = (counts[dateKey] ?? 0) + 1;

        return counts;
      },
      {}
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 364);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    return Array.from({ length: 53 }, (_, weekIndex) =>
      Array.from({ length: 7 }, (_, dayIndex): ContributionDay => {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + weekIndex * 7 + dayIndex);

        const count = date > today ? 0 : completionsByDate[getDateKey(date)] ?? 0;

        return {
          date,
          count,
          level: getContributionLevel(count),
        };
      })
    );
  }, [completedTasks]);

  const contributionMonths = useMemo(
    () =>
      contributionWeeks.map((week, weekIndex) => {
        const firstDayOfMonth = week.find((day) => day.date.getDate() === 1);
        if (!firstDayOfMonth) return "";

        if (
          weekIndex > 0 &&
          contributionWeeks[weekIndex - 1].some(
            (day) => day.date.getMonth() === firstDayOfMonth.date.getMonth()
          )
        ) {
          return "";
        }

        return MONTH_LABELS[firstDayOfMonth.date.getMonth()];
      }),
    [contributionWeeks]
  );

  useEffect(() => {
    const savedTasks = localStorage.getItem("todo-tasks");
    const savedCompletedTasks = localStorage.getItem("todo-completed-tasks");

    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedCompletedTasks) setCompletedTasks(JSON.parse(savedCompletedTasks));
  }, []);

  useEffect(() => {
    localStorage.setItem("todo-tasks", JSON.stringify(tasks));
    localStorage.setItem("todo-completed-tasks", JSON.stringify(completedTasks));
  }, [tasks, completedTasks]);

  const formatDate = (timestamp: string) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const addTask = () => {
    if (newTask.trim()) {
      const newTaskObject: Task = {
        text: newTask,
        completed: false,
        createdAt: new Date().toISOString(),
      };
      const updatedTasks = [newTaskObject, ...tasks];
      setTasks(updatedTasks);
      setNewTask("");
    }
  };

  const toggleCompletion = (index: number, isCompleted: boolean) => {
    if (isCompleted) {
      const task = completedTasks[index];
      const updatedCompletedTasks = completedTasks.filter((_, i) => i !== index);
      const updatedTasks = [
        ...tasks,
        { ...task, completed: false, completedAt: undefined },
      ];
      setCompletedTasks(updatedCompletedTasks);
      setTasks(updatedTasks);
    } else {
      const task = tasks[index];
      const updatedTasks = tasks.filter((_, i) => i !== index);
      const updatedCompletedTasks = [
        ...completedTasks,
        { ...task, completed: true, completedAt: new Date().toISOString() },
      ];
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

  const downloadBackup = () => {
    const backupData = {
      "todo-tasks": tasks,
      "todo-completed-tasks": completedTasks,
      backupDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `todo-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // New function to handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backupData = JSON.parse(e.target?.result as string);
        
        // Validate the backup data structure
        if (backupData["todo-tasks"] && Array.isArray(backupData["todo-tasks"])) {
          setTasks(backupData["todo-tasks"]);
        }
        if (backupData["todo-completed-tasks"] && Array.isArray(backupData["todo-completed-tasks"])) {
          setCompletedTasks(backupData["todo-completed-tasks"]);
        }
        
        // Reset file input
        event.target.value = "";
      } catch (error) {
        console.error("Error parsing backup file:", error);
        alert("Invalid backup file format");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:w-1/2 lg:mx-auto my-2 sm:my-12 md:my-16 lg:my-20 text-[1.1rem] sm:text-[1.25rem] md:text-[1.5rem] h-screen max-w-full">
      <div className="mb-2 sm:mb-6 md:mb-8 contribution-scroll overflow-x-auto pb-2">
        <div className="w-fit text-xs text-gray-400">
          <div className="ml-9 grid grid-flow-col auto-cols-[13px] gap-[3px]">
            {contributionMonths.map((month, index) => (
              <div key={`${month}-${index}`} className="h-4 leading-4">
                {month}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <div className="grid grid-rows-7 gap-[3px] leading-[13px] text-right">
              {DAY_LABELS.map((label, index) => (
                <div key={`${label}-${index}`} className="h-[13px] w-7">
                  {label}
                </div>
              ))}
            </div>
            <div
              className="grid grid-flow-col auto-cols-[13px] grid-rows-7 gap-[3px]"
              aria-label="Tasks completed by day"
            >
              {contributionWeeks.flatMap((week, weekIndex) =>
                week.map((day, dayIndex) => (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    title={`${day.count} task${day.count === 1 ? "" : "s"} completed on ${day.date.toLocaleDateString()}`}
                    aria-label={`${day.count} task${day.count === 1 ? "" : "s"} completed on ${day.date.toLocaleDateString()}`}
                    tabIndex={0}
                    className={`h-[13px] w-[13px] rounded-[3px] outline-none ring-offset-2 ring-offset-[#080808] focus-visible:ring-1 focus-visible:ring-[#8b949e] ${INTENSITY_CLASSES[day.level]}`}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Task Section */}
      <div className="flex items-center gap-1 sm:gap-2 mb-4 sm:mb-6 md:mb-8">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          placeholder="░"
          className="p-2 sm:p-3 md:p-4 border border-gray-300 rounded-lg w-full bg-transparent text-base sm:text-lg md:text-xl"
        />
        <button
          onClick={addTask}
          className="px-4 sm:px-7 md:px-11 p-2 sm:p-3 md:p-4 border border-gray-300 rounded-lg bg-transparent hover:bg-[#fff] hover:text-black transition text-base sm:text-lg md:text-xl"
        >
          +
        </button>
      </div>

      

      {/* Pending Tasks */}
      <ul className="mb-4 sm:mb-6 md:mb-8 space-y-2 sm:space-y-3 md:space-y-4">
        {tasks.map((task, index) => (
          <li
            key={index}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(index, false)}
            className="flex bg-[#111] justify-between items-center pl-2 sm:pl-3 md:pl-4 rounded-lg shadow-sm cursor-grab p-2 sm:p-3 md:p-4"
          >
            <div>
              <span>• {task.text}</span>
              <div className="text-xs text-gray-600">
                ■ {task.createdAt ? formatDate(task.createdAt) : "N/A"}
              </div>
            </div>
            <div className="flex gap-1 sm:gap-2">
              <button
                onClick={() => toggleCompletion(index, false)}
                className="px-2 sm:px-3 md:px-4 p-1 sm:p-2 border border-gray-300 rounded hover:bg-green-500 hover:text-white transition select-none text-base sm:text-lg"
              >
                √
              </button>
              <button
                onClick={() => deleteTask(index, false)}
                className="px-2 sm:px-3 md:px-4 p-1 sm:p-2 border border-gray-300 rounded hover:bg-red-500 hover:text-white transition select-none text-base sm:text-lg"
              >
                ×
              </button>
            </div>
          </li>
        ))}
      </ul>

      <hr />

      {/* Completed Tasks */}
      <ul className="space-y-2 sm:space-y-3 md:space-y-4 my-4 sm:my-6 md:my-8">
        {completedTasks.map((task, index) => (
          <li
            key={index}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(index, true)}
            className="flex justify-between items-center text-gray-500 p-2 sm:p-3 md:p-4"
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
            <div className="flex gap-1 sm:gap-2">
              <button
                onClick={() => toggleCompletion(index, true)}
                className="px-2 sm:px-3 md:px-4 p-1 sm:p-2 border border-[#222] rounded hover:bg-yellow-500 hover:text-white transition select-none text-base sm:text-lg"
              >
                ↩
              </button>
              <button
                onClick={() => deleteTask(index, true)}
                className="px-2 sm:px-3 md:px-4 p-1 sm:p-2 border border-[#222] rounded hover:bg-red-500 hover:text-white transition select-none text-base sm:text-lg"
              >
                ×
              </button>
            </div>
          </li>
        ))}
      </ul>
      {/* Backup Controls */}
      <div className="fixed items-center justify-center bottom-2 left-0 right-0 mx-auto text-center text-xs sm:text-sm flex gap-2 sm:gap-4 w-fit">
        <button
          onClick={downloadBackup}
          className="px-4 py-1 text-gray-500 rounded-lg bg-transparent hover:bg-white hover:text-black transition"
        >
          Download
        </button>
        <label className="px-4 py-1 text-gray-500 rounded-lg bg-transparent hover:bg-white hover:text-black transition cursor-pointer">
          Import
          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>
      <div>
        <Link
          href="https://github.com/fabohax/todo"
          target="_blank"
          className="fixed bottom-2 right-2 mx-auto hover:underline text-[.75em] text-gray-500 text-sm"
        >
          🄯 OSS
        </Link>
      </div>
    </div>
  );
}
