import { useState, useCallback } from 'react';
import { guestService } from '../../services/guest.service';
import type { Guest } from '../../types/guest/guest.response';

interface UseCreateInvitationReturn {
    isLoading: boolean;
    error: string | null;
    createInvitation: (id: string | number) => Promise<{ success: boolean; guest?: Guest }>;
}

export function useCreateInvitation(): UseCreateInvitationReturn {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createInvitation = useCallback(async (id: string | number): Promise<{ success: boolean; guest?: Guest }> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await guestService.createInvitation(id);

            if (response.success) {
                const guest = response.data?.guest || response.guest;
                return { success: true, guest };
            } else {
                setError(response.message || 'Failed to create e-invitation');
                return { success: false };
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred while creating e-invitation';
            setError(errorMessage);
            return { success: false };
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        isLoading,
        error,
        createInvitation,
    };
}
