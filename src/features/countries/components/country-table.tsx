'use client';

import { useCountries } from '../hooks/use-countries';

export function CountryTable() {/*
    const { data: countries, isLoading, isError, toggleCountryStatus } = useCountries();

    const handleToggle = (id: number, currentStatus: boolean) => {
        toggleCountryStatus({ id, data: { status: !currentStatus } });
    };

    if (isLoading) return <div className="text-center py-12 text-sm text-slate-500 animate-pulse">Analyse des corridors de la passerelle...</div>;
    if (isError) return <div className="text-center py-12 text-sm text-red-500 font-medium">⚠️ Échec de récupération des pays.</div>;
*/
    return (
        <></>
       /* <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Corridors & Zones Économiques</h2>
                <p className="text-xs text-slate-500 mt-0.5">Activez ou coupez globalement les transferts pour une région spécifique.</p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="px-6 py-3.5">Pays / ISO</th>
                        <th className="px-6 py-3.5">Devise Régionale</th>
                        <th className="px-6 py-3.5">Indicatif Télécom</th>
                        <th className="px-6 py-3.5">Num Code</th>
                        <th className="px-6 py-3.5">Statut de la Zone</th>
                    </tr>
                    </thead>
                    <tbody className="text-xs divide-y divide-slate-100 text-slate-700 font-medium">
                    {countries?.map((country) => (
                        <tr key={country.id} className="hover:bg-slate-50/40 transition-colors">
                            {/!* Nom & ISO *!/}
                            <td className="px-6 py-4 flex items-center gap-3">
                                <span className="text-lg">{country.flag || '🌍'}</span>
                                <div>
                                    <div className="font-bold text-slate-900">{country.name}</div>
                                    <div className="text-[10px] text-slate-400 font-mono font-bold uppercase mt-0.5">
                                        {country.iso} {country.iso3 ? `/ ${country.iso3}` : ''}
                                    </div>
                                </div>
                            </td>

                            {/!* Devise *!/}
                            <td className="px-6 py-4">
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-mono font-bold text-[11px]">
                    {country.currency || 'N/A'}
                  </span>
                            </td>

                            {/!* Indicatif Téléphone *!/}
                            <td className="px-6 py-4 text-slate-600 font-mono font-bold">
                                +{country.phonecode}
                            </td>

                            {/!* Numcode *!/}
                            <td className="px-6 py-4 text-slate-400 font-mono">
                                {country.numcode || '—'}
                            </td>

                            {/!* Statut Toggle Interrupteur *!/}
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => handleToggle(country.id, country.status)}
                                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                            country.status ? 'bg-blue-600' : 'bg-slate-200'
                                        }`}
                                    >
                      <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              country.status ? 'translate-x-4' : 'translate-x-0'
                          }`}
                      />
                                    </button>
                                    <span className={`text-[11px] font-bold ${country.status ? 'text-blue-600' : 'text-slate-400'}`}>
                      {country.status ? 'Ouvert' : 'Fermé'}
                    </span>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>*/
    );
}