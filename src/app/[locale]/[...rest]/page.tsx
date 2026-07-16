import { notFound } from "next/navigation";

// Force static so unknown paths return a real 404 status instead of a
// streamed 200 (soft 404) caused by the loading boundary.
export const dynamic = "force-static";

export default function CatchAll() {
  notFound();
}
