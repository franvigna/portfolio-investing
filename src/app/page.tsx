export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white">Portfolio Investing</h1>
          <p className="text-gray-400 mt-1">Registro de compra y venta de acciones</p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
            <p className="text-sm text-gray-400">Capital invertido</p>
            <p className="text-2xl font-semibold text-white mt-1">$0.00</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
            <p className="text-sm text-gray-400">Valor actual</p>
            <p className="text-2xl font-semibold text-white mt-1">$0.00</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
            <p className="text-sm text-gray-400">Ganancia / Perdida</p>
            <p className="text-2xl font-semibold text-gray-400 mt-1">$0.00</p>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Transacciones</h2>
            <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors">
              + Nueva transaccion
            </button>
          </div>
          <p className="text-gray-500 text-sm text-center py-8">
            Sin transacciones. Agrega tu primera compra.
          </p>
        </div>
      </div>
    </main>
  );
}
