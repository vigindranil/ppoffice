'use client'

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis
} from "@/components/ui/pagination";

export default function SmartPagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const maxVisible = 5;
  const sideCount = Math.floor(maxVisible / 2);
  let start = Math.max(1, currentPage - sideCount);
  let end = Math.min(totalPages, currentPage + sideCount);

  if (currentPage <= sideCount) {
    end = Math.min(totalPages, maxVisible);
  } else if (currentPage + sideCount > totalPages) {
    start = Math.max(1, totalPages - maxVisible + 1);
  }

  const renderPageLinks = () => {
    const pageLinks = [];

    if (start > 1) {
      pageLinks.push(
        <PaginationItem key="start-ellipsis">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    for (let i = start; i <= end; i++) {
      pageLinks.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => onPageChange(i)}
            isActive={currentPage === i}
            className="cursor-pointer"
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    if (end < totalPages) {
      pageLinks.push(
        <PaginationItem key="end-ellipsis">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    return pageLinks;
  };

  return (
    <Pagination>
      <PaginationContent className="flex flex-wrap gap-1">
        {/* First + Previous */}
        <PaginationItem>
          <PaginationLink
            onClick={() => onPageChange(1)}
            className={`cursor-pointer ${currentPage === 1 ? 'pointer-events-none opacity-50' : ''}`}
          >
            «
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            className={`cursor-pointer ${currentPage === 1 ? 'pointer-events-none opacity-50' : ''}`}
          />
        </PaginationItem>

        {/* Page numbers */}
        {renderPageLinks()}

        {/* Next + Last */}
        <PaginationItem>
          <PaginationNext
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            className={`cursor-pointer ${currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}`}
          />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink
            onClick={() => onPageChange(totalPages)}
            className={`cursor-pointer ${currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}`}
          >
            »
          </PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}