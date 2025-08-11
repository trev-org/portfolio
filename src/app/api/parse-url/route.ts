import { NextRequest } from "next/server";
import * as cheerio from "cheerio";
import { createClient } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return new Response(JSON.stringify({ error: "URL is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
      },
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: `Error: ${response.status}` }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const title = $("title").text() || null;
    const description =
      $('meta[name="description"]').attr("content") ||
      $('meta[property="og:description"]').attr("content") ||
      null;
    const favicon =
      $('link[rel="icon"]').attr("href") ||
      $('link[rel="shortcut icon"]').attr("href") ||
      "/favicon.ico";

    // Ensure favicon is absolute URL
    let faviconUrl = favicon;
    try {
      faviconUrl = new URL(favicon, url).href;
    } catch (e) {
      console.error("Failed to parse favicon URL:", e);
      // If favicon URL is invalid, use a default
      faviconUrl = "/favicon.ico";
    }

    const supabase = createClient();

    const { error } = await supabase
      .from("pocket")
      .insert({
        title,
        description,
        favicon: faviconUrl,
        has_read: false,
        link: url,
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to insert article:", error);
      return new Response(
        JSON.stringify({ message: "Failed to insert article", error: error }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ message: "Article added successfully" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Failed to parse URL:", error);
    return new Response(
      JSON.stringify({ message: "Failed to parse URL", error: error }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
