import HomePage from "./pages/HomePage"

function App() {
  return (
    // The main container has been simplified
    <div className="min-h-screen container mx-auto p-4 md:p-8">
      
      {/* 1. The main title is kept */}
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold">Dataset Cleaner & Augmentor</h1>
      </header>
      
      {/* 2. The <p> tag with the "Streamline..." subtitle has been REMOVED. */}
      
      <main>
        <HomePage />
      </main>
      
      {/* 3. The <footer> and its "Built with..." text have been REMOVED. */}

    </div>
  )
}

export default App