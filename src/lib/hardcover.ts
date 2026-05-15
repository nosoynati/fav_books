import { HARDCOVER_API_KEY } from "astro:env/server";

// ─── Queries ──────────────────────────────────────────────────────────────────
//
// Two separate GraphQL queries are used:
//   1. GET_USER_BOOK_IDS_QUERY  — fetches the current user's book list (IDs + status)
//   2. BOOKS_WITH_AUTHORS_QUERY — fetches full book data + authors for a given set of IDs
//
// They are split because the Hardcover API exposes authors through the
// `contributions` table, not directly on `user_books`. We first get the IDs
// we care about, then ask contributions to return only those books.

// Fetches the authenticated user's book list.
// $where is optional — omitting it returns all books regardless of status.
// To add a new field to every book (e.g. page count), add it here.
export const GET_USER_BOOK_IDS_QUERY = `
  query GetUserBookIds($where: user_books_bool_exp) {
    me {
      user_books(where: $where) {
        book_id
        id
        status_id
        read_count
      }
    }
  }
`;

// Fetches full book details + author names for a list of book IDs.
// $ids comes from GET_USER_BOOK_IDS_QUERY — this keeps results scoped to
// the user's own library.
// To expose a new book field on the detail page, add it inside `book { }`.
export const BOOKS_WITH_AUTHORS_QUERY = `
  query BooksWithAuthors($ids: [Int!]!) {
    contributions(where: {book: {id: {_in: $ids}}}) {
      author {
        id
        name
      }
      book {
        id
        slug
        title
        subtitle
        description
        rating
        ratings_count
        image {
          url
        }
        editions {
          isbn_13
        }
      }
    }
  }
`;

// ─── Filter types ─────────────────────────────────────────────────────────────
//
// BookFilter controls which subset of the user's books to show.
// 'all'       — returns all user books (both read and want-to-read)
// 'read'      — only books with a last_read_date
// 'want-to-read' — only books without a last_read_date
export type BookFilter = 'all' | 'read' | 'want-to-read' | 'currently-reading';

// Maps each filter to a Hasura-style GraphQL where clause.
// 'all' is not listed here — it returns everything from the user's books.
const WHERE_CLAUSES: Partial<Record<BookFilter, object>> = {
  'currently-reading': { status_id: { _eq: 2 } },
  'read':              { status_id: { _eq: 3 } },
  'want-to-read':      { status_id: { _eq: 1 } },
};

// ─── Main fetch function ──────────────────────────────────────────────────────

export async function fetchUserBooks(
  limit: number = 12,   // items per page
  offset: number = 0,   // items to skip (for pagination)
  filter: BookFilter = 'all'
) {
  try {
    // Look up whether this filter has a where clause.
    // If not (e.g. 'all'), we send no `where` variable → API returns all books.
    const where = WHERE_CLAUSES[filter];

    // ── Step 1: get the user's book IDs and read status ──────────────────────
    const idsResponse = await fetch("https://api.hardcover.app/v1/graphql", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: HARDCOVER_API_KEY,
      },
      body: JSON.stringify({
        query: GET_USER_BOOK_IDS_QUERY,
        variables: where ? { where } : {},
      }),
    });
    const idsJson = await idsResponse.json();

    if (idsJson.errors) {
      throw new Error(`GraphQL error: ${idsJson.errors[0].message}`);
    }

    // me[0] is the authenticated user (the API returns an array)
    const userBooksRaw: Array<{ book_id: number; status_id: number }> =
      idsJson.data?.me?.[0]?.user_books ?? [];

    if (!userBooksRaw.length) return { books: [], total: 0 };

    // Extract just the IDs to pass to the next query
    const userBookIds = userBooksRaw.map((b) => b.book_id);

    // Build a lookup: book_id → "read" | "want to read"
    // Used to attach a human-readable status to each book later.
    const statusByBookId = new Map<number, string>();
    for (const ub of userBooksRaw) {
      statusByBookId.set(ub.book_id, ({ 1: 'want to read', 2: 'currently reading', 3: 'read' } as Record<number, string>)[ub.status_id] ?? 'other');
    }

    // ── Step 2: fetch books with authors from contributions ──────────────────
    // contributions returns one row per (book, author) pair, so a book with
    // two authors appears twice. We group them in the next step.
    const booksResponse = await fetch("https://api.hardcover.app/v1/graphql", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: HARDCOVER_API_KEY,
      },
      body: JSON.stringify({
        query: BOOKS_WITH_AUTHORS_QUERY,
        variables: { ids: userBookIds },
      }),
    });
    const booksJson = await booksResponse.json();

    if (booksJson.errors) {
      throw new Error(`GraphQL error: ${booksJson.errors[0].message}`);
    }

    const contributions: Array<{
      author: { id: number; name: string };
      book: any;
    }> = booksJson.data?.contributions ?? [];

    // ── Step 3: group contributions by book, collecting authors ──────────────
    // bookMap: book.id → { book: { ...fields, authors: [], status } }
    // First time we see a book we create the entry; each subsequent row for the
    // same book just pushes another author into the existing authors array.
    const bookMap = new Map<number, { book: any }>();
    for (const { book, author } of contributions) {
      if (!bookMap.has(book.id)) {
        bookMap.set(book.id, {
          book: {
            ...book,
            authors: [],
            status: statusByBookId.get(book.id) ?? 'unknown',
          },
        });
      }
      bookMap.get(book.id)!.book.authors.push(author);
    }

    // ── Step 4: paginate ─────────────────────────────────────────────────────
    // Pagination is done here in JS (not at the GraphQL level) because we need
    // to group by book first — GraphQL returns one row per author.
    const allBooks = Array.from(bookMap.values());
    const paginatedBooks = allBooks.slice(offset, offset + limit);

    return { books: paginatedBooks, total: allBooks.length };
  } catch (error) {
    console.error("Error fetching user books:", error);
    return { books: [], total: 0 };
  }
}

export const GET_BOOK_BY_SLUG_QUERY = `
  query GetBookBySlug($slug: String!) {
    contributions(where: {book: {slug: {_eq: $slug}}}) {
      author {
        id
        name
      }
      book {
        id
        slug
        title
        subtitle
        description
        rating
        ratings_count
        image {
          url
        }
        editions {
          isbn_13
        }
      }
    }
    me {
      user_books(where: {book: {slug: {_eq: $slug}}}) {
        status_id
      }
    }
  }
`;

export async function fetchBookBySlug(slug: string) {
  try {
    const response = await fetch("https://api.hardcover.app/v1/graphql", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: HARDCOVER_API_KEY,
      },
      body: JSON.stringify({
        query: GET_BOOK_BY_SLUG_QUERY,
        variables: { slug },
      }),
    });
    const json = await response.json();

    if (json.errors) throw new Error(`GraphQL error: ${json.errors[0].message}`);

    const contributions: Array<{ author: { id: number; name: string }; book: any }> =
      json.data?.contributions ?? [];

    if (!contributions.length) return null;

    const statusId = json.data?.me?.[0]?.user_books?.[0]?.status_id;
    const status = ({ 1: 'want to read', 2: 'currently reading', 3: 'read' } as Record<number, string>)[statusId];

    return {
      ...contributions[0].book,
      authors: contributions.map((c) => c.author),
      status,
    };
  } catch (error) {
    console.error("Error fetching book by slug:", error);
    return null;
  }
}
