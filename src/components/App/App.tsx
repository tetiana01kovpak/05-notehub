import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import SearchBox from "../SearchBox/SearchBox";
import Pagination from "../Pagination/Pagination";
import NoteList from "../NoteList/NoteList";
import Modal from "../Modal/Modal";
import NoteForm from "../NoteForm/NoteForm";
import { fetchNotes } from "../../services/noteService";
import css from "./App.module.css";

const PER_PAGE = 12;

export default function App() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);
  const [debouncedSearch] = useDebounce(search, 500);

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

  const notes = notesQuery.data?.notes ?? [];
  const totalPages = notesQuery.data?.totalPages ?? 0;
  const showPagination = totalPages > 1;

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const closeModal = () => setModalOpen(false);
  const handleCreateSuccess = () => {
    setPage(1);
    setModalOpen(false);
  };

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
        {showPagination && (
          <Pagination
            pageCount={totalPages}
            currentPage={page}
            onChange={setPage}
          />
        )}
        <button className={css.button} onClick={() => setModalOpen(true)}>
          Create note +
        </button>
      </header>

      {notesQuery.isPending && <p>Loading notes...</p>}
      {notesQuery.isError && <p>{errorMessage}</p>}
      {canShowList && <NoteList notes={notes} />}
      {showEmptyState && <p>No notes yet.</p>}

      {isModalOpen && (
        <Modal onClose={closeModal}>
          <NoteForm onCancel={closeModal} onSuccess={handleCreateSuccess} />
        </Modal>
      )}
    </div>
  );
}
