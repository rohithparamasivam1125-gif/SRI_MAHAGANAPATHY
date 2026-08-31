/**
 * COUNT-BASED Multi-Page A4 Paginator for Invoices and Quotations
 *
 * Provides calibrated page capacities to match physical A4 print heights:
 *  - Single page bill (header + items + totals):       up to 22 items
 *  - Page 1 of multi-page bill (header + items):       up to 26 items (fills page with no awkward bottom gap)
 *  - Middle continuation pages (mini-header + items):  up to 32 items
 *  - Final page (mini-header + items + totals block):  up to 18 items
 */

const PAGE1_MAX  = 26;   // Page 1 of multi-page: full branding header + items
const MIDDLE_MAX = 32;   // Middle continuation pages: compact mini-header + items
const LAST_MAX   = 18;   // Final page: items + totals/terms/signature block
const SINGLE_MAX = 22;   // Single-page bill: header + items + totals

export const paginateBillItems = (items = []) => {
  if (!items || items.length === 0) {
    return [
      {
        pageNumber: 1,
        totalPages: 1,
        isFirstPage: true,
        isLastPage: true,
        items: [],
        startIndex: 0
      }
    ];
  }

  // --- SINGLE PAGE: all items fit on one page with totals ---
  if (items.length <= SINGLE_MAX) {
    return [
      {
        pageNumber: 1,
        totalPages: 1,
        isFirstPage: true,
        isLastPage: true,
        items: [...items],
        startIndex: 0
      }
    ];
  }

  // --- MULTI-PAGE: split into ranges ---
  const pageRanges = []; // [{start, end}] — end is exclusive
  let cursor = 0;
  let isFirstPage = true;

  while (cursor < items.length) {
    const remaining = items.length - cursor;

    // If remaining items fit on a final page (with totals block), take them all
    if (!isFirstPage && remaining <= LAST_MAX) {
      pageRanges.push({ start: cursor, end: items.length });
      cursor = items.length; // mark done
      break;
    }

    // Take up to the current page limit
    const limit = isFirstPage ? PAGE1_MAX : MIDDLE_MAX;
    const take = Math.min(limit, remaining);

    pageRanges.push({ start: cursor, end: cursor + take });
    cursor += take;
    isFirstPage = false;
  }

  // --- SAFETY NET: extend last page if cursor never reached items.length ---
  if (cursor < items.length) {
    if (pageRanges.length > 0) {
      pageRanges[pageRanges.length - 1].end = items.length;
    } else {
      pageRanges.push({ start: 0, end: items.length });
    }
  }

  // --- Build final page objects ---
  const totalPages = pageRanges.length;
  return pageRanges.map(({ start, end }, idx) => ({
    pageNumber: idx + 1,
    totalPages,
    isFirstPage: idx === 0,
    isLastPage: idx === totalPages - 1,
    items: items.slice(start, end),
    startIndex: start
  }));
};
