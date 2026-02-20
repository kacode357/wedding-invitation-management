import { useState, useCallback } from 'react';
import { noteService } from '../../services/note.service';

interface UseDeleteNoteReturn {
  deleteNote: (id: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

export function useDeleteNote(): UseDeleteNoteReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteNote = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await noteService.deleteNote(id);

      if (response.success) {
        return true;
      } else {
        setError(response.message || 'Failed to delete note');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while deleting note';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    deleteNote,
    isLoading,
    error,
  };
}
