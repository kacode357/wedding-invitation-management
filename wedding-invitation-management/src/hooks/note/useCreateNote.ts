import { useState, useCallback } from 'react';
import { noteService } from '../../services/note.service';
import type { Note } from '../../types/note/note.response';
import type { CreateNotePayload } from '../../types/note/note.payload';

interface UseCreateNoteReturn {
  createNote: (payload: CreateNotePayload) => Promise<Note | null>;
  isLoading: boolean;
  error: string | null;
}

export function useCreateNote(): UseCreateNoteReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createNote = useCallback(async (payload: CreateNotePayload): Promise<Note | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await noteService.createNote(payload);

      if (response.success && response.data?.note) {
        return response.data.note;
      } else {
        setError(response.message || 'Failed to create note');
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while creating note';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    createNote,
    isLoading,
    error,
  };
}
