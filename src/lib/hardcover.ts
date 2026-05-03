import { HARDCOVER_API_KEY } from "astro:env/server";

export const GET_USER_BOOK_IDS_QUERY = `
  query GetUserBookIds($where: user_books_bool_exp) {
    me {
      user_books(where: $where) {
        book_id
        id
        last_read_date
      }
    }
  }
`;

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

export type BookFilter = 'all' | 'read' | 'want-to-read' | 'favorites';

const WHERE_CLAUSES: Partial<Record<BookFilter, object>> = {
  'read':        { last_read_date: { _is_null: false } },
  'want-to-read': { last_read_date: { _is_null: true } },
};

export async function fetchUserBooks(
  limit: number = 12,
  offset: number = 0,
  filter: BookFilter = 'all'
) {
  try {
    const where = WHERE_CLAUSES[filter];

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

    const userBooksRaw: Array<{ book_id: number; last_read_date: string | null }> =
      idsJson.data?.me?.[0]?.user_books ?? [];

    if (!userBooksRaw.length) return { books: [], total: 0 };

    const userBookIds = userBooksRaw.map((b) => b.book_id);
    const statusByBookId = new Map<number, string>();
    for (const ub of userBooksRaw) {
      statusByBookId.set(ub.book_id, ub.last_read_date ? 'read' : 'want to read');
    }

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

    const allBooks = Array.from(bookMap.values());
    const paginatedBooks = allBooks.slice(offset, offset + limit);

    return { books: paginatedBooks, total: allBooks.length };
  } catch (error) {
    console.error("Error fetching user books:", error);
    return { books: [], total: 0 };
  }
}
