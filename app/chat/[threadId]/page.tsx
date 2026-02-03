import { Metadata } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import ClientPage from "./ClientPage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ threadId: string }>;
}): Promise<Metadata> {
  const { threadId } = await params;
  const thread = await fetchQuery(api.threads.get, { id: threadId as Id<"threads"> });

  return {
    title: thread?.title || "Thread Not Found | AutoNerds - AI",
    description: `Chat thread: ${thread?.title || "View this thread"}`,
    openGraph: {
      title: thread?.title || "Thread Not Found",
      description: `Chat thread: ${thread?.title || "View this thread"}`,
      // images: ["/default-og-image.png"],
    },
  };
}

export default function ThreadPage() {
  return <ClientPage />;
}