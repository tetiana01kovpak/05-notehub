import { useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import SearchBox from "../SearchBox/SearchBox";
import Pagination from "../Pagination/Pagination";
import NoteList from "../NoteList/NoteList";
import Modal from "../Modal/Modal";
import NoteForm from "../NoteForm/NoteForm";
import { fetchNotes, createNote, deleteNote } from "../../services/noteService";
import type { CreateNotePayload } from "../../services/noteService";
import css from "./App.module.css";

const PER_PAGE = 12;

export default function App() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);
  const [debouncedSearch] = useDebounce(search, 500);
  const queryClient = useQueryClient();

  const notesQuery = useQuery({
    queryKey: ["notes", page, PER_PAGE, debouncedSearch],
    queryFn: () =>
      fetchNotes({
        page,
        perPage: PER_PAGE,
        search: debouncedSearch.trim() || undefined,
      }),
    placeholderData: keepPreviousData,
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateNotePayload) => createNote(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      setModalOpen(false);
      setPage(1);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  const notes = notesQuery.data?.notes ?? [];
  const totalPages = notesQuery.data?.totalPages ?? 0;
  const deletingId = (deleteMutation.variables as string | undefined) ?? null;

  const handleCreate = async (values: CreateNotePayload): Promise<void> => {
    await createMutation.mutateAsync(values);
  };

  const handleDelete = (id: string) => {
    if (deleteMutation.isPending) {
      return;
    }
    deleteMutation.mutate(id);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const closeModal = () => setModalOpen(false);

  const canShowList = notes.length > 0;
  const showEmptyState =
    !notesQuery.isPending && !notesQuery.isError && !canShowList;

  const errorMessage =
    notesQuery.error instanceof Error
      ? notesQuery.error.message
      : "Unable to load notes.";

  return (
    <div className={css.app}>
      <header className={css.toolbar}>
        <SearchBox value={search} onChange={handleSearchChange} />
        <Pagination
          pageCount={totalPages}
          currentPage={page}
          onChange={setPage}
        />
        <button className={css.button} onClick={() => setModalOpen(true)}>
          Create note +
        </button>
      </header>

      {notesQuery.isPending && <p>Loading notes...</p>}
      {notesQuery.isError && <p>{errorMessage}</p>}
      {canShowList && (
        <NoteList
          notes={notes}
          onDelete={handleDelete}
          deletingId={deletingId}
        />
      )}
      {showEmptyState && <p>No notes yet.</p>}

      {isModalOpen && (
        <Modal onClose={closeModal}>
          <NoteForm
            onSubmit={handleCreate}
            onCancel={closeModal}
            isSubmitting={createMutation.isPending}
          />
        </Modal>
      )}
    </div>
  );
}
