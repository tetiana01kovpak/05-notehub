import axios from "axios";
import type { AxiosResponse } from "axios";
import type { Note, NoteTag } from "../types/note";

const api = axios.create({
  baseURL: "https://notehub-public.goit.study/api",
});

const getHeaders = () => {
  const token = import.meta.env.VITE_NOTEHUB_TOKEN;
  if (!token) {
    throw new Error("Missing VITE_NOTEHUB_TOKEN");
  }
  return { Authorization: `Bearer ${token}` };
};

export interface FetchNotesParams {
  page?: number;
  perPage?: number;
  search?: string;
  tag?: NoteTag;
  sortBy?: "created" | "updated";
}

export interface FetchNotesResponse {
  notes: Note[];
  totalPages: number;
}

export interface CreateNotePayload {
  title: string;
  content: string;
  tag: NoteTag;
}

export type CreateNoteResponse = Note;
export type DeleteNoteResponse = Note;

export const fetchNotes = async (
  params: FetchNotesParams
): Promise<FetchNotesResponse> => {
  const response: AxiosResponse<FetchNotesResponse> = await api.get("/notes", {
    headers: getHeaders(),
    params,
  });
  return response.data;
};

export const createNote = async (
  payload: CreateNotePayload
): Promise<CreateNoteResponse> => {
  const response: AxiosResponse<CreateNoteResponse> = await api.post(
    "/notes",
    payload,
    { headers: getHeaders() }
  );
  return response.data;
};

export const deleteNote = async (id: string): Promise<DeleteNoteResponse> => {
  const response: AxiosResponse<DeleteNoteResponse> = await api.delete(
    `/notes/${id}`,
    { headers: getHeaders() }
  );
  return response.data;
};
