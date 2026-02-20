import { useState, useCallback } from 'react';
import { noteService } from '../../services/note.service';
import type { Note } from '../../types/note/note.response';
import type { UpdateNotePayload } from '../../types/note/note.payload';

interface UseUpdateNoteReturn {
  updateNote: (id: string, payload: UpdateNotePayload) => Promise<Note | null>;
  isLoading: boolean;
  error: string | null;
}

export function useUpdateNote(): UseUpdateNoteReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateNote = useCallback(async (id: string, payload: UpdateNotePayload): Promise<Note | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await noteService.updateNote(id, payload);

      if (response.success && response.data?.note) {
        return response.data.note;
      } else {
        setError(response.message || 'Failed to update note');
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while updating note';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    updateNote,
    isLoading,
    error,
  };
}
