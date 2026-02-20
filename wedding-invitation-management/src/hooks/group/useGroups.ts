import { useState, useCallback } from 'react';
import { groupService } from '../../services/group.service';
import type { Group } from '../../types/group/group.response';

interface UseGroupsReturn {
    groups: Group[];
    isLoading: boolean;
    error: string | null;
    fetchGroups: () => Promise<void>;
}

export function useGroups(): UseGroupsReturn {
    const [groups, setGroups] = useState<Group[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchGroups = useCallback(async (): Promise<void> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await groupService.getAllGroups();

            if (response.success && response.data?.groups) {
                setGroups(response.data.groups);
            } else {
                setError(response.message || 'Failed to fetch groups');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching groups';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        groups,
        isLoading,
        error,
        fetchGroups,
    };
}
