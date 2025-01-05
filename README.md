# Minimal TODO App

A simple and minimalistic TODO application built with **Next.js** and **TypeScript**. The app allows users to add tasks, mark them as completed, undo completed tasks, and delete tasks. Completed tasks are shown in a separate list. All tasks are persisted in a local `tasks.json` file.

## Features

- **Add Tasks**: Input tasks and add them to the list.
- **Mark as Completed**: Move tasks to a "Completed" list.
- **Undo Completed**: Move tasks back to the pending list.
- **Delete Tasks**: Remove tasks from either list.
- **Persistent Storage**: Tasks are saved locally in `tasks.json`.
- **Exportable Static App**: Package the app as a standalone static site for local use.

## Technologies Used

- [Next.js](https://nextjs.org/) (React Framework)
- TypeScript (for type safety)
- Tailwind CSS (for styling)
- Node.js (`fs` module for file handling)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/fabohax/todo.git
   cd todo
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Export as a Static App

You can export this app as a fully static application that can run locally without a server.

### Steps to Export

1. Build and Export the App:
   Run the following commands to build the app and export it as static files:

   ```bash
   npm run build
   npx next export
   ```

   This will generate an `out` directory in the root of your project, containing all the static files.

2. Open the Exported App:
   - Navigate to the `out` directory:
     ```bash
     cd out
     ```
   - Open the `index.html` file in your browser to use the app locally.

## How It Works

1. **Add Tasks**:
   - Enter a task in the input field and press the `+` button or hit `Enter`.
   - The task appears in the "Pending Tasks" list.

2. **Mark as Completed**:
   - Click the "Complete" button next to a task.
   - The task moves to the "Completed Tasks" list.

3. **Undo Completed Tasks**:
   - Click the "Undo" button next to a completed task.
   - The task moves back to the "Pending Tasks" list.

4. **Delete Tasks**:
   - Click the "Delete" button next to a task to remove it permanently.

5. **Persistent Storage**:
   - Tasks are saved in a `tasks.json` file.
   - The app reads this file when it starts to reload tasks.

6. **Static Export**:
   - The app can be exported as static files for offline or local use.

---

## Future Improvements

- Add due dates and priority levels for tasks.
- Implement search and filtering functionality.

## License

This project is open-source.