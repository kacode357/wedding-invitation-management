import { useState, useCallback } from 'react';
import { groupService } from '../../services/group.service';
import type { Group } from '../../types/group/group.response';
import type { CreateGroupPayload } from '../../types/group/group.payload';

interface UseCreateGroupReturn {
    createGroup: (payload: CreateGroupPayload) => Promise<{ data: Group | null; errorMessage: string | null }>;
    isLoading: boolean;
    error: string | null;
}

export function useCreateGroup(): UseCreateGroupReturn {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createGroup = useCallback(async (payload: CreateGroupPayload): Promise<{ data: Group | null; errorMessage: string | null }> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await groupService.createGroup(payload);

            if (response.success && response.data?.group) {
                return { data: response.data.group, errorMessage: null };
            } else {
                const msg = response.message || 'Failed to create group';
                setError(msg);
                return { data: null, errorMessage: msg };
            }
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { message?: string } }; message?: string };
            const msg = axiosErr?.response?.data?.message || axiosErr?.message || 'An error occurred while creating group';
            setError(msg);
            return { data: null, errorMessage: msg };
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        createGroup,
        isLoading,
        error,
    };
}
