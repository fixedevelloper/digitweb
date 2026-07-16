export default function DashboardOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Vue d'ensemble</h1>
        <p className="text-slate-500">Suivi en temps réel de vos flux et transferts d'argent.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Volume Transféré (Mois)</p>
          <p className="text-2xl font-bold text-slate-900">14,250,000 XAF</p>
        </div>
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Transactions Réussies</p>
          <p className="text-2xl font-bold text-emerald-600">1,240</p>
        </div>
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Taux de succès</p>
          <p className="text-2xl font-bold text-slate-900">99.2%</p>
        </div>
      </div>
    </div>
  );
}
