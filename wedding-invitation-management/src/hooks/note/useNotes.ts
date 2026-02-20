import { useState, useCallback } from 'react';
import { noteService } from '../../services/note.service';
import { useCreateNote } from './useCreateNote';
import { useGetNote } from './useGetNote';
import { useUpdateNote } from './useUpdateNote';
import { useDeleteNote } from './useDeleteNote';
import type { Note } from '../../types/note/note.response';
import type { CreateNotePayload, UpdateNotePayload } from '../../types/note/note.payload';

interface UseNotesReturn {
  notes: Note[];
  isLoading: boolean;
  error: string | null;
  fetchNotes: () => Promise<void>;
  createNote: (payload: CreateNotePayload) => Promise<Note | null>;
  getNoteById: (id: string) => Promise<Note | null>;
  updateNote: (id: string, payload: UpdateNotePayload) => Promise<Note | null>;
  deleteNote: (id: string) => Promise<boolean>;
  createLoading: boolean;
  createError: string | null;
  getLoading: boolean;
  getError: string | null;
  updateLoading: boolean;
  updateError: string | null;
  deleteLoading: boolean;
  deleteError: string | null;
}

export function useNotes(): UseNotesReturn {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use individual hooks
  const { createNote: createNoteFn, isLoading: createLoading, error: createError } = useCreateNote();
  const { getNoteById: getNoteByIdFn, isLoading: getLoading, error: getError } = useGetNote();
  const { updateNote: updateNoteFn, isLoading: updateLoading, error: updateError } = useUpdateNote();
  const { deleteNote: deleteNoteFn, isLoading: deleteLoading, error: deleteError } = useDeleteNote();

  const fetchNotes = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await noteService.getAllNotes();

      // Handle both response structures: direct or wrapped in data
      const notesData = response.data?.notes;

      if (response.success && notesData) {
        setNotes(notesData);
      } else {
        setError(response.message || 'Failed to fetch notes');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching notes';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Wrapped createNote that also updates local state
  const createNote = useCallback(async (payload: CreateNotePayload): Promise<Note | null> => {
    const result = await createNoteFn(payload);
    if (result) {
      setNotes((prev) => [...prev, result]);
    }
    return result;
  }, [createNoteFn]);

  // Wrapped getNoteById
  const getNoteById = useCallback(async (id: string): Promise<Note | null> => {
    return await getNoteByIdFn(id);
  }, [getNoteByIdFn]);

  // Wrapped updateNote that also updates local state
  const updateNote = useCallback(async (id: string, payload: UpdateNotePayload): Promise<Note | null> => {
    const result = await updateNoteFn(id, payload);
    if (result) {
      setNotes((prev) =>
        prev.map((note) => (note._id === id ? result : note))
      );
    }
    return result;
  }, [updateNoteFn]);

  // Wrapped deleteNote that also updates local state
  const deleteNote = useCallback(async (id: string): Promise<boolean> => {
    const result = await deleteNoteFn(id);
    if (result) {
      setNotes((prev) => prev.filter((note) => note._id !== id));
    }
    return result;
  }, [deleteNoteFn]);

  return {
    notes,
    isLoading,
    error,
    fetchNotes,
    createNote,
    getNoteById,
    updateNote,
    deleteNote,
    createLoading,
    createError,
    getLoading,
    getError,
    updateLoading,
    updateError,
    deleteLoading,
    deleteError,
  };
}
