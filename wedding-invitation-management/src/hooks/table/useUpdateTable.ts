import { useState } from 'react';
import { toast } from 'sonner';
import { tableService } from '../../services/table.service';
import type { UpdateTablePayload } from '../../types/table/table.payload';

export const useUpdateTable = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateTable = async (id: string, payload: UpdateTablePayload) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await tableService.updateTable(id, payload);
            if (response.success) {
                toast.success(response.message || 'Table updated successfully');
                return true;
            }
            return false;
        } catch (err: any) {
            const message = err.response?.data?.message || 'Failed to update table';
            toast.error(message);
            setError(message);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return { updateTable, isLoading, error };
};
