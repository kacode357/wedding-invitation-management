import { useState, useCallback } from 'react';
import { noteService } from '../../services/note.service';
import type { Note } from '../../types/note/note.response';

interface UseGetNoteReturn {
  getNoteById: (id: string) => Promise<Note | null>;
  isLoading: boolean;
  error: string | null;
}

export function useGetNote(): UseGetNoteReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getNoteById = useCallback(async (id: string): Promise<Note | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await noteService.getNoteById(id);

      if (response.success && response.data?.note) {
        return response.data.note;
      } else {
        setError(response.message || 'Failed to fetch note');
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching note';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    getNoteById,
    isLoading,
    error,
  };
}
