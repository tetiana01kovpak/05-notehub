export const noteTags = [
  "Todo",
  "Work",
  "Personal",
  "Meeting",
  "Shopping",
] as const;

export type NoteTag = (typeof noteTags)[number];

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  tag: NoteTag;
}
