import api from '../config/axios';
import type { NotesResponse, NoteDetailResponse, NoteCreateResponse, NoteUpdateResponse, NoteDeleteResponse } from '../types/note/note.response';
import type { CreateNotePayload, UpdateNotePayload } from '../types/note/note.payload';

export const noteService = {
  async getAllNotes(): Promise<NotesResponse> {
    const response = await api.get<NotesResponse>('/notes');
    return response.data;
  },

  async getNoteById(id: string): Promise<NoteDetailResponse> {
    const response = await api.get<NoteDetailResponse>(`/notes/${id}`);
    return response.data;
  },

  async createNote(payload: CreateNotePayload): Promise<NoteCreateResponse> {
    const response = await api.post<NoteCreateResponse>('/notes', payload);
    return response.data;
  },

  async updateNote(id: string, payload: UpdateNotePayload): Promise<NoteUpdateResponse> {
    const response = await api.put<NoteUpdateResponse>(`/notes/${id}`, payload);
    return response.data;
  },

  async deleteNote(id: string): Promise<NoteDeleteResponse> {
    const response = await api.delete<NoteDeleteResponse>(`/notes/${id}`);
    return response.data;
  },
};
