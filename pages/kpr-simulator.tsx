import KPRSimulator from '../components/KPRSimulator';

export default function KPRSimulatorPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Simulasi Cicilan KPR
        </h1>
        <KPRSimulator />
      </div>
    </div>
  );
}