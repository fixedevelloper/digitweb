'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { CoveredCountry } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

/** Couverture publique (aucune authentification) : pays actifs et services ouverts par l'administration. */
export function useCoverage() {
  return useQuery<CoveredCountry[]>({
    queryKey: ['public-coverage'],
    queryFn: async () => (await axios.get<{ data: CoveredCountry[] }>(`${API_URL}/public/coverage`)).data.data,
    staleTime: 1000 * 60 * 10,
  });
}
