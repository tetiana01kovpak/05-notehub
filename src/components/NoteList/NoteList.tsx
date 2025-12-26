import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Note } from "../../types/note";
import { deleteNote } from "../../services/noteService";
import css from "./NoteList.module.css";

export interface NoteListProps {
  notes: Note[];
}

export default function NoteList({ notes }: NoteListProps) {
  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  const deletingId =
    deleteMutation.isPending && typeof deleteMutation.variables === "string"
      ? deleteMutation.variables
      : null;

  const handleDelete = (id: string) => {
    if (deleteMutation.isPending) {
      return;
    }
    deleteMutation.mutate(id);
  };

  return (
    <ul className={css.list}>
      {notes.map((note) => (
        <li key={note.id} className={css.listItem}>
          <h2 className={css.title}>{note.title}</h2>
          <p className={css.content}>{note.content}</p>
          <div className={css.footer}>
            <span className={css.tag}>{note.tag}</span>
            <button
              type="button"
              className={css.button}
              onClick={() => handleDelete(note.id)}
              disabled={deletingId === note.id}
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
