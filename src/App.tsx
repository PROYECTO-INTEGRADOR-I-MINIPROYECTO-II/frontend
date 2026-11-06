import BaseInfoCard from './components/BaseInfoCard';

export default function App() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-50 p-4">
      <h1 className="text-3xl font-bold text-slate-900">Synk</h1>
      <BaseInfoCard />
    </main>
  );
}
