import HomePage from "./pages/HomePage"

function App() {
  return (
    <div className="min-h-screen container mx-auto p-4 md:p-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white">Dataset Cleaner & Augmentor</h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 mt-2">Streamline your YOLO dataset preparation workflow.</p>
      </header>
      <main>
        <HomePage />
      </main>
      <footer className="text-center mt-12 text-sm text-gray-400">
        <p>Built with React, FastAPI, and TailwindCSS.</p>
      </footer>
    </div>
  )
}

export default App