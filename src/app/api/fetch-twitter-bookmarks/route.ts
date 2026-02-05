// {"token_type":"bearer","expires_in":7200,"access_token":"VVZKb0R3YlJDVVFoSGtud2Zpc2ZSS2tBSWVMUG9OQjJpOXVtblRkbUlVaHBjOjE3NjY3NDQwNjMyMjU6MToxOmF0OjE","scope":"users.read tweet.read offline.access bookmark.read","refresh_token":"SVVQWjZLTURvNjdkVERkY2FDZEtUSDdIRHdNNWhVNko5bGdkYkNydXhXMk1TOjE3NjY3NDQwNjMyMjU6MToxOnJ0OjE"}

export async function GET(req: Request) {
  try {
    const response = await fetch(
      "https://api.x.com/2/users/1947315669365882880/bookmarks",
      {
        headers: {
          Authorization: `Bearer ${process.env.X_PCKE_ACCESS_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      return new Response(JSON.stringify({ error: response.statusText }), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    console.log("Twitter API response:", data);
    return Response.json(data);
  } catch (error) {
    console.error("Error fetching Twitter bookmarks:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
