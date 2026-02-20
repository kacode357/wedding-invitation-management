import { useState } from 'react';
import { toast } from 'sonner';
import { tableService } from '../../services/table.service';

export const useRenameTable = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const renameTable = async (id: string, tableName: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await tableService.renameTable(id, { tableName });
            if (response.success) {
                toast.success(response.message || 'Table renamed successfully');
                return true;
            }
            return false;
        } catch (err: any) {
            const message = err.response?.data?.message || 'Failed to rename table';
            toast.error(message);
            setError(message);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return { renameTable, isLoading, error };
};
