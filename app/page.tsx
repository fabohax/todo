"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Copy } from "lucide-react";

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

type TodoData = {
  tasks: Task[];
  completedTasks: Task[];
  notes: Note[];
};

type TodoBackupData = Partial<TodoData> & {
  pending?: Task[];
  completed?: Task[];
  "todo-tasks"?: Task[];
  "todo-completed-tasks"?: Task[];
  "todo-notes"?: Note[];
};

type ContributionDay = {
  date: Date;
  count: number;
  level: number;
};

const DAY_LABELS = ["", "Lun", "", "Mie", "", "Vie", ""];
const MONTH_LABELS = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Oct",
  "Nov",
  "Dic",
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

const formatShortDate = (date: Date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);

  return `${day}/${month}/${year}`;
};

const getContributionLevel = (count: number) => {
  if (count === 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 5) return 3;
  return 4;
};

const normalizeTodoData = (data: TodoBackupData): TodoData => ({
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

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newTask, setNewTask] = useState<string>("");
  const [newNote, setNewNote] = useState<string>("");
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isNotesSidebarClosing, setIsNotesSidebarClosing] = useState(false);
  const [copiedNoteIndex, setCopiedNoteIndex] = useState<number | null>(null);
  const [draggedTaskIndex, setDraggedTaskIndex] = useState<number | null>(null);
  const [hasLoadedStoredData, setHasLoadedStoredData] = useState(false);

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

    const dayCount =
      Math.floor(
        (today.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)
      ) + 1;

    const contributionDays = Array.from(
      { length: dayCount },
      (_, dayIndex): ContributionDay => {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + dayIndex);

        const count = completionsByDate[getDateKey(date)] ?? 0;

        return {
          date,
          count,
          level: getContributionLevel(count),
        };
      }
    );

    return contributionDays.reduce<ContributionDay[][]>((weeks, day, index) => {
      const weekIndex = Math.floor(index / 7);
      weeks[weekIndex] ??= [];
      weeks[weekIndex].push(day);
      return weeks;
    }, []);
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
    const loadStoredData = async () => {
      try {
        const response = await fetch("/api/todos");

        if (!response.ok) {
          throw new Error(`Failed to load todos: ${response.status}`);
        }

        const savedData = normalizeTodoData(await response.json());

        setTasks(savedData.tasks);
        setCompletedTasks(savedData.completedTasks);
        setNotes(savedData.notes);
      } catch (error) {
        console.error("Error loading saved data:", error);
      } finally {
        setHasLoadedStoredData(true);
      }
    };

    loadStoredData();
  }, []);

  useEffect(() => {
    if (!hasLoadedStoredData) return;

    const saveStoredData = async () => {
      try {
        const response = await fetch("/api/todos", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tasks,
            completedTasks,
            notes,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to save todos: ${response.status}`);
        }
      } catch (error) {
        console.error("Error saving data:", error);
      }
    };

    saveStoredData();
  }, [tasks, completedTasks, notes, hasLoadedStoredData]);

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

  const addNote = () => {
    const trimmedNote = newNote.trim();
    if (!trimmedNote) return;

    const newNoteObject: Note = {
      text: trimmedNote,
      createdAt: new Date().toISOString(),
    };

    setNotes([newNoteObject, ...notes]);
    setNewNote("");
  };

  const openNotesSidebar = () => {
    setIsNotesSidebarClosing(false);
    setIsNotesModalOpen(true);
  };

  const closeNotesSidebar = () => {
    setIsNotesSidebarClosing(true);
    window.setTimeout(() => {
      setIsNotesModalOpen(false);
      setIsNotesSidebarClosing(false);
    }, 180);
  };

  const deleteNote = (index: number) => {
    setNotes(notes.filter((_, noteIndex) => noteIndex !== index));
  };

  const copyNote = async (note: Note, index: number) => {
    try {
      await navigator.clipboard.writeText(note.text);
      setCopiedNoteIndex(index);
      window.setTimeout(() => setCopiedNoteIndex(null), 1200);
    } catch (error) {
      console.error("Error copying note:", error);
      alert("Could not copy note");
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
      "todo-notes": notes,
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
        const backupData = normalizeTodoData(JSON.parse(e.target?.result as string));

        setTasks(backupData.tasks);
        setCompletedTasks(backupData.completedTasks);
        setNotes(backupData.notes);
        
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
      <button
        type="button"
        onClick={openNotesSidebar}
        aria-label="Open notes"
        className="fixed left-2 top-2 z-30 flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-[#080808] text-xl leading-none transition hover:bg-white hover:text-black sm:left-4 sm:top-4"
      >
        +
      </button>

      {isNotesModalOpen && (
        <div className="fixed inset-0 z-40" role="presentation">
          <button
            type="button"
            aria-label="Close notes"
            className={`notes-backdrop absolute inset-0 bg-black/70 ${
              isNotesSidebarClosing ? "notes-backdrop-closing" : ""
            }`}
            onClick={closeNotesSidebar}
          />
          <aside
            className={`notes-sidebar absolute left-0 top-0 flex h-full w-[min(88vw,24rem)] flex-col border-r border-[#333] bg-[#0d0d0d] p-3 shadow-2xl sm:p-4 ${
              isNotesSidebarClosing ? "notes-sidebar-closing" : ""
            }`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="notes-sidebar-title"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 id="notes-sidebar-title" className="text-lg sm:text-xl">
                Notes
              </h2>
              <button
                type="button"
                onClick={closeNotesSidebar}
                aria-label="Close notes"
                className="flex h-9 w-9 items-center justify-center rounded border border-[#333] text-base transition hover:bg-white hover:text-black"
              >
                <ArrowLeft aria-hidden="true" size={18} strokeWidth={2} />
              </button>
            </div>

            <form
              className="mb-3 flex items-center gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                addNote();
              }}
            >
              <input
                type="text"
                value={newNote}
                onChange={(event) => setNewNote(event.target.value)}
                placeholder="Add a note"
                className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-transparent p-2 text-base outline-none focus:border-white sm:p-3"
              />
              <button
                type="submit"
                aria-label="Add note"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-gray-300 text-xl leading-none transition hover:bg-white hover:text-black sm:h-12 sm:w-12"
              >
                +
              </button>
            </form>

            <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
              {notes.map((note, index) => (
                <li
                  key={`${note.createdAt}-${index}`}
                  className="flex items-start justify-between gap-3 rounded-lg bg-[#111] p-3 text-base"
                >
                  <div className="min-w-0">
                    <p className="break-words">{note.text}</p>
                    <div className="mt-2 text-xs text-gray-600">
                      ■ {formatDate(note.createdAt)}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => copyNote(note, index)}
                      aria-label={
                        copiedNoteIndex === index ? "Copied note" : "Copy note"
                      }
                      title={copiedNoteIndex === index ? "Copied" : "Copy"}
                      className="flex h-8 w-8 items-center justify-center rounded border border-[#333] transition hover:bg-white hover:text-black"
                    >
                      {copiedNoteIndex === index ? (
                        <Check aria-hidden="true" size={16} strokeWidth={2} />
                      ) : (
                        <Copy aria-hidden="true" size={16} strokeWidth={2} />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteNote(index)}
                      aria-label="Delete note"
                      className="flex h-8 w-8 items-center justify-center rounded border border-[#333] text-sm transition hover:bg-red-500 hover:text-white"
                    >
                      ×
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      )}

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
                    title={`${day.count} task${day.count === 1 ? "" : "s"} completed on ${formatShortDate(day.date)}`}
                    aria-label={`${day.count} task${day.count === 1 ? "" : "s"} completed on ${formatShortDate(day.date)}`}
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
