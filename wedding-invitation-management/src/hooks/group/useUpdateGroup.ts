import { useState, useCallback } from 'react';
import { groupService } from '../../services/group.service';
import type { Group } from '../../types/group/group.response';
import type { UpdateGroupPayload } from '../../types/group/group.payload';

interface UseUpdateGroupReturn {
    updateGroup: (id: string, payload: UpdateGroupPayload) => Promise<{ data: Group | null; errorMessage: string | null }>;
    isLoading: boolean;
    error: string | null;
}

export function useUpdateGroup(): UseUpdateGroupReturn {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateGroup = useCallback(async (id: string, payload: UpdateGroupPayload): Promise<{ data: Group | null; errorMessage: string | null }> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await groupService.updateGroup(id, payload);

            if (response.success && response.data?.group) {
                return { data: response.data.group, errorMessage: null };
            } else {
                const msg = response.message || 'Failed to update group';
                setError(msg);
                return { data: null, errorMessage: msg };
            }
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { message?: string } }; message?: string };
            const msg = axiosErr?.response?.data?.message || axiosErr?.message || 'An error occurred while updating group';
            setError(msg);
            return { data: null, errorMessage: msg };
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        updateGroup,
        isLoading,
        error,
    };
}
