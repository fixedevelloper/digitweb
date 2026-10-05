'use client';

import { useState } from 'react';
import { AxiosInstance } from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { getErrorMessage } from '@/lib/utils';

interface Status { enabled: boolean; recovery_codes_left: number; required_for_sensitive_actions: boolean }

const input = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500';

/**
 * Activation / désactivation de la 2FA du compte connecté. `client` est l'instance Axios
 * authentifiée (admin ou marchand), `basePath` la racine des routes (/admin/2fa ou /merchants/2fa).
 */
export function TwoFactorSettings({ client, basePath }: { client: AxiosInstance; basePath: string }) {
  const queryClient = useQueryClient();
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [setup, setSetup] = useState<{ secret: string; otpauth_url: string } | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);

  const status = useQuery<Status>({
    queryKey: ['2fa-status', basePath],
    queryFn: async () => (await client.get(basePath)).data.data,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['2fa-status', basePath] });

  const start = useMutation({
    mutationFn: async () => (await client.post(`${basePath}/setup`, { password })).data.data,
    onSuccess: (d) => { setSetup(d); setPassword(''); },
  });
  const confirm = useMutation({
    mutationFn: async () => (await client.post(`${basePath}/confirm`, { code })).data.data,
    onSuccess: (d) => { setRecoveryCodes(d.recovery_codes); setSetup(null); setCode(''); refresh(); },
  });
  const disable = useMutation({
    mutationFn: async () => (await client.post(`${basePath}/disable`, { password, code })).data,
    onSuccess: () => { setPassword(''); setCode(''); refresh(); },
  });
  const regenerate = useMutation({
    mutationFn: async () => (await client.post(`${basePath}/recovery-codes`, { password, code })).data.data,
    onSuccess: (d) => { setRecoveryCodes(d.recovery_codes); setPassword(''); setCode(''); refresh(); },
  });

  const error = [start, confirm, disable, regenerate].find((m) => m.isError)?.error;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-5 max-w-xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Authentification à deux facteurs</h2>
          <p className="text-xs text-slate-500">Code à usage unique généré par Google Authenticator, Authy, 1Password…</p>
        </div>
        <span className={`text-[11px] font-bold uppercase px-2.5 py-1 rounded-full ${status.data?.enabled ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
          {status.data?.enabled ? 'Activée' : 'Désactivée'}
        </span>
      </div>

      {status.data?.required_for_sensitive_actions && !status.data.enabled && (
        <p className="text-xs bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-3">
          Les actions sensibles (ajustements de solde, rapprochement, plafonds KYC…) sont bloquées tant que la 2FA n&apos;est pas activée sur votre compte.
        </p>
      )}

      {recoveryCodes && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
          <p className="text-xs font-semibold text-amber-900">
            Conservez ces codes de secours en lieu sûr. Chacun ne sert qu&apos;une fois et ils ne seront plus affichés.
          </p>
          <div className="grid grid-cols-2 gap-1 font-mono text-sm">{recoveryCodes.map((c) => <span key={c}>{c}</span>)}</div>
          <div className="flex gap-4 text-xs font-bold text-amber-800">
            <button onClick={() => navigator.clipboard.writeText(recoveryCodes.join('\n'))}>Copier</button>
            <button onClick={() => setRecoveryCodes(null)}>J&apos;ai conservé les codes</button>
          </div>
        </div>
      )}

      {status.data && !status.data.enabled && !setup && (
        <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); start.mutate(); }}>
          <input type="password" className={input} placeholder="Mot de passe actuel" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Button type="submit" disabled={start.isPending}>Activer la 2FA</Button>
        </form>
      )}

      {setup && (
        <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); confirm.mutate(); }}>
          <p className="text-xs text-slate-600">1. Scannez ce QR code avec votre application d&apos;authentification.</p>
          <div className="flex justify-center p-3 bg-white border border-slate-100 rounded-xl"><QRCodeSVG value={setup.otpauth_url} size={176} /></div>
          <p className="text-xs text-slate-600">Ou saisissez la clé manuellement : <code className="font-mono font-bold break-all">{setup.secret}</code></p>
          <p className="text-xs text-slate-600">2. Entrez le code à 6 chiffres affiché pour confirmer.</p>
          <input className={`${input} text-center font-mono tracking-widest`} inputMode="numeric" maxLength={7} placeholder="123456" value={code} onChange={(e) => setCode(e.target.value)} required />
          <Button type="submit" disabled={confirm.isPending}>Confirmer et activer</Button>
        </form>
      )}

      {status.data?.enabled && (
        <div className="space-y-3 border-t border-slate-100 pt-4">
          <p className="text-xs text-slate-500">Codes de secours restants : <b>{status.data.recovery_codes_left}</b></p>
          <input type="password" className={input} placeholder="Mot de passe actuel" value={password} onChange={(e) => setPassword(e.target.value)} />
          <input className={`${input} font-mono`} inputMode="numeric" maxLength={7} placeholder="Code à 6 chiffres" value={code} onChange={(e) => setCode(e.target.value)} />
          <div className="flex gap-3">
            <Button variant="outline" disabled={regenerate.isPending || !password || !code} onClick={() => regenerate.mutate()}>Nouveaux codes de secours</Button>
            <Button variant="outline" disabled={disable.isPending || !password || !code}
              onClick={() => window.confirm('Désactiver la 2FA ? Votre compte sera moins protégé.') && disable.mutate()}>
              Désactiver
            </Button>
          </div>
        </div>
      )}

      {error && <p className="text-xs font-medium text-red-600">{getErrorMessage(error)}</p>}
    </div>
  );
}
