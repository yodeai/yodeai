export default function Search() {
    return (
      <main className="container mx-auto px-8 py-12">
        <div className="flex items-center justify-between">
          <h1 className="font-bold tracking-tight text-4xl mb-4">Search</h1>
          <input
            type="text"
            className="bg-white py-2 px-4 rounded border border-gray-200 shadow-sm"
            placeholder="Enter a search..."
          />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-12"></div>
      </main>
    );
  }