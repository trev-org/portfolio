import React from "react";

type PocketPostParams = {
  slug: string;
};

export async function generateStaticParams(): Promise<PocketPostParams[]> {
  // Placeholder - return at least one slug for static export to work
  return [{ slug: "placeholder" }];
}

export default async function PocketPost({
  params,
}: {
  params: Promise<PocketPostParams>;
}) {
  const { slug } = await params;

  return <div>Coming soon... ({slug})</div>;
}
