/**
 * Pagination utilities for handling large datasets
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Paginate an array of items
 */
export function paginate<T>(
  items: T[],
  page: number = 1,
  pageSize: number = 10
): PaginatedResult<T> {
  const total = items.length;
  const totalPages = Math.ceil(total / pageSize);

  // Validate page number
  if (page < 1) page = 1;
  if (page > totalPages && totalPages > 0) page = totalPages;

  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const data = items.slice(start, end);

  return {
    data,
    total,
    page,
    pageSize,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

/**
 * Build pagination metadata for API responses
 */
export function buildPaginationMeta(
  total: number,
  page: number,
  pageSize: number
) {
  const totalPages = Math.ceil(total / pageSize);

  return {
    total,
    page,
    pageSize,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

/**
 * Validate pagination parameters
 */
export function validatePaginationParams(
  page: number,
  pageSize: number
): { page: number; pageSize: number } {
  // Ensure page is at least 1
  if (page < 1) page = 1;

  // Ensure pageSize is between 1 and 100
  if (pageSize < 1) pageSize = 10;
  if (pageSize > 100) pageSize = 100;

  return { page, pageSize };
}
