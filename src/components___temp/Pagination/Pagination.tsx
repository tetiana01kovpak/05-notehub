import ReactPaginate from "react-paginate";
import css from "./Pagination.module.css";

export interface PaginationProps {
  pageCount: number;
  currentPage: number;
  onChange: (page: number) => void;
}

export default function Pagination({
  pageCount,
  currentPage,
  onChange,
}: PaginationProps) {
  if (pageCount <= 1) {
    return null;
  }

  return (
    <ReactPaginate
      breakLabel="..."
      nextLabel=">"
      previousLabel="<"
      containerClassName={css.pagination}
      activeClassName={css.active}
      pageCount={pageCount}
      forcePage={currentPage - 1}
      onPageChange={({ selected }) => onChange(selected + 1)}
      pageRangeDisplayed={3}
      marginPagesDisplayed={1}
      renderOnZeroPageCount={null}
    />
  );
}
