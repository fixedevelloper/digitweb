// @/features/dashboard/hooks/use-dashboard-stats.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import {apiClient} from "../../../lib/api-client";

export interface DailyFlow {
    date: string;  // Format "YYYY-MM-DD" ou "DD MMM"
    credit: number;
    debit: number;
}

interface DashboardStats {
    monthlyVolume: number;
    successfulTransactionsCount: number;
    successRate: number;
    activeAccountsCount: number;
    dailyHistory: DailyFlow[]; // Séries pour notre diagramme de courbes
}

const fetchDashboardStats = async (): Promise<DashboardStats> => {
    const response = await apiClient.get('/admin/dashboard/stats');
    return response.data;
};

export function useDashboardStats() {
    return useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: fetchDashboardStats,
        refetchInterval: 60000,
    });
}