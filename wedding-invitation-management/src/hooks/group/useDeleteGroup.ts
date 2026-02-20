import { useState, useCallback } from 'react';
import { groupService } from '../../services/group.service';

interface UseDeleteGroupReturn {
    deleteGroup: (id: string) => Promise<{ success: boolean; errorMessage: string | null }>;
    isLoading: boolean;
    error: string | null;
}

export function useDeleteGroup(): UseDeleteGroupReturn {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const deleteGroup = useCallback(async (id: string): Promise<{ success: boolean; errorMessage: string | null }> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await groupService.deleteGroup(id);

            if (response.success) {
                return { success: true, errorMessage: null };
            } else {
                const msg = response.message || 'Failed to delete group';
                setError(msg);
                return { success: false, errorMessage: msg };
            }
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { message?: string } }; message?: string };
            const msg = axiosErr?.response?.data?.message || axiosErr?.message || 'An error occurred while deleting group';
            setError(msg);
            return { success: false, errorMessage: msg };
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        deleteGroup,
        isLoading,
        error,
    };
}
