import { describe, expect, it } from 'vitest';

import {
  buildPageEnvelope,
  buildPageLinks,
  normalizePagination,
} from '../src/utils/pagination';

describe('pagination helpers', () => {
  it('normalizes missing pagination to defaults', () => {
    expect(normalizePagination()).toEqual({
      page: 1,
      limit: 10,
      offset: 0,
    });
  });

  it('clamps invalid values into safe bounds', () => {
    expect(normalizePagination({ page: 0, limit: 200 })).toEqual({
      page: 1,
      limit: 100,
      offset: 0,
    });
  });

  it('builds the expected navigation links', () => {
    expect(buildPageLinks(45, 2, 10)).toEqual({
      first: { page: 1, limit: 10 },
      prev: { page: 1, limit: 10 },
      next: { page: 3, limit: 10 },
      last: { page: 5, limit: 10 },
    });
  });

  it('returns the response envelope expected by the frontend', () => {
    expect(
      buildPageEnvelope(
        [{ id: 1 }],
        1,
        {
          page: 1,
          limit: 10,
          offset: 0,
        },
      ),
    ).toEqual({
      meta: {
        totalCount: 1,
      },
      links: {
        first: { page: 1, limit: 10 },
        prev: null,
        next: null,
        last: { page: 1, limit: 10 },
      },
      data: [{ id: 1 }],
    });
  });
});

