'use client';

import { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { getErrorMessage } from '@/lib/utils';

interface Props {
  /** Espace concerné : le relais Next.js pose le cookie de session une fois le code validé. */
  area: 'admin' | 'merchant';
  challenge: string;
  onSuccess: (data: unknown) => void;
  onCancel: () => void;
}

/** Seconde étape de connexion : code de l'application d'authentification ou code de secours. */
export function TwoFactorStep({ area, challenge, onSuccess, onCancel }: Props) {
  const [code, setCode] = useState('');
  const [useRecovery, setUseRecovery] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const res = await axios.post(`/bff/auth/${area}/two-factor`, {
        challenge,
        ...(useRecovery ? { recovery_code: code.trim() } : { code: code.replace(/\s/g, '') }),
      }, { headers: { Accept: 'application/json' } });
      onSuccess(res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="text-center">
        <h2 className="text-xl font-bold text-slate-900">Vérification en deux étapes</h2>
        <p className="text-sm text-slate-500 mt-1">
          {useRecovery
            ? 'Saisissez un de vos codes de secours (usage unique).'
            : 'Saisissez le code à 6 chiffres de votre application d\'authentification.'}
        </p>
      </div>

      <input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        autoFocus
        required
        inputMode={useRecovery ? 'text' : 'numeric'}
        autoComplete="one-time-code"
        maxLength={useRecovery ? 12 : 7}
        placeholder={useRecovery ? 'xxxxx-xxxxx' : '123456'}
        className="w-full px-3.5 py-3 border border-slate-200 rounded-xl text-center text-xl tracking-widest font-mono focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
      />

      {error && <p className="text-xs font-medium text-red-700 bg-red-50 border border-red-100 rounded-xl p-3">{error}</p>}

      <Button type="submit" className="w-full py-2.5 rounded-xl bg-blue-600 font-semibold text-white hover:bg-blue-500" disabled={pending}>
        {pending ? 'Vérification...' : 'Valider'}
      </Button>

      <div className="flex justify-between text-xs font-medium">
        <button type="button" className="text-blue-600 hover:text-blue-500" onClick={() => { setUseRecovery(!useRecovery); setCode(''); setError(null); }}>
          {useRecovery ? 'Utiliser l\'application' : 'Utiliser un code de secours'}
        </button>
        <button type="button" className="text-slate-500 hover:text-slate-700" onClick={onCancel}>Retour</button>
      </div>
    </form>
  );
}
