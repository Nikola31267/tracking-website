import axios from "axios";
import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  console.log(url);

  if (!url) {
    return NextResponse.json(
      { error: "Missing 'url' query parameter" },
      { status: 400 }
    );
  }

  try {
    const response = await axios.get(url);
    const html = response.data;

    const snippetFound = html.includes(
      '<script src="https://tracking-website-rosy.vercel.app/js/tracker.js"'
    );
    return NextResponse.json({ snippetFound });
  } catch (error) {
    console.error("Error checking snippet:", error.message);
    return NextResponse.json(
      { error: "Unable to fetch or process the website." },
      { status: 500 }
    );
  }
}
