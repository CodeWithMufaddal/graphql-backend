const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

export interface PaginationInput {
  page?: number | null;
  limit?: number | null;
}

export interface PageOptions {
  page: number;
  limit: number;
  offset: number;
}

export interface PageLink {
  page: number;
  limit: number;
}

export interface PageLinks {
  first: PageLink;
  prev: PageLink | null;
  next: PageLink | null;
  last: PageLink;
}

export function normalizePagination(input?: PaginationInput | null): PageOptions {
  const page = Math.max(DEFAULT_PAGE, input?.page ?? DEFAULT_PAGE);
  const rawLimit = input?.limit ?? DEFAULT_LIMIT;
  const limit = Math.min(Math.max(1, rawLimit), MAX_LIMIT);

  return {
    page,
    limit,
    offset: (page - 1) * limit,
  };
}

export function buildPageLinks(
  totalCount: number,
  page: number,
  limit: number,
): PageLinks {
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));

  return {
    first: { page: 1, limit },
    prev: page > 1 ? { page: page - 1, limit } : null,
    next: page < totalPages ? { page: page + 1, limit } : null,
    last: { page: totalPages, limit },
  };
}

export function buildPageEnvelope<T>(
  rows: T[],
  totalCount: number,
  pageOptions: PageOptions,
) {
  return {
    meta: {
      totalCount,
    },
    links: buildPageLinks(totalCount, pageOptions.page, pageOptions.limit),
    data: rows,
  };
}

