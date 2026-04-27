import { HARDCOVER_API_KEY } from "astro:env/server";

export const USER_BOOKS_QUERY = `
  query UserBooks {
    me {
      user_books(limit: 10) {
        book_id
        book {
        editions {
          isbn_13
        }
          title
          description
          image { 
            id
            url 
          }
            
          rating
          ratings_count
          slug
          id
        }
      }
    }
  }
`;
export const USER_AUTHORS = `
  query USER_AUTHORS {
    authors {
      name
      contributions {
        book {
          book_mappings {
            book_id
          }
        }
      }
    }
  }
`;
export async function fetchUserBooks() {
  const response = await fetch("https://api.hardcover.app/v1/graphql", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: HARDCOVER_API_KEY,
    },
    body: JSON.stringify({ query: USER_BOOKS_QUERY }),
  });
  const { data } = await response.json();
  return data.me[0]["user_books"];
}
