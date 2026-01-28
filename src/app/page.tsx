export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="max-w-2xl w-full text-center space-y-6">
        <h1 className="text-5xl font-bold text-white tracking-tight">
          Next.js 16 + Tailwind 4
        </h1>
        <p className="text-xl text-slate-300">
          Installation réussie ! 🎉
        </p>
        <div className="flex gap-4 justify-center mt-8">
          <div className="px-6 py-3 bg-primary text-white rounded-lg font-medium shadow-lg shadow-blue-500/25">
            Primary Button
          </div>
          <div className="px-6 py-3 bg-secondary text-white rounded-lg font-medium shadow-lg shadow-purple-500/25">
            Secondary Button
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-8">
          <div className="p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-lg">
            <p className="text-emerald-400 font-semibold">Grid Item 1</p>
          </div>
          <div className="p-4 bg-amber-500/20 border border-amber-500/30 rounded-lg">
            <p className="text-amber-400 font-semibold">Grid Item 2</p>
          </div>
          <div className="p-4 bg-rose-500/20 border border-rose-500/30 rounded-lg">
            <p className="text-rose-400 font-semibold">Grid Item 3</p>
          </div>
        </div>
      </div>
    </main>
  );
}
