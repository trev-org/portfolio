import type { MDXComponents } from "mdx/types";
import type { ComponentPropsWithoutRef } from "react";

function ArticleLink({
  href,
  target,
  rel,
  ...props
}: ComponentPropsWithoutRef<"a">) {
  const isExternal = href?.startsWith("http://") || href?.startsWith("https://");

  return (
    <a
      {...props}
      href={href}
      target={isExternal ? "_blank" : target}
      rel={isExternal ? "noreferrer" : rel}
    />
  );
}

const components = {
  a: ArticleLink,
} satisfies MDXComponents;

export function useMDXComponents(): MDXComponents {
  return components;
}
