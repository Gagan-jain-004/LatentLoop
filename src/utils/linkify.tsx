import type { ReactNode } from 'react';

const URL_REGEX = /((?:https?:\/\/|www\.)[^\s<]+)/gi;

function splitUrlAndTrailing(rawUrl: string): { url: string; trailing: string } {
  let url = rawUrl;
  let trailing = '';

  while (url.length > 0) {
    const lastChar = url[url.length - 1];

    if (/[.,!?;:]/.test(lastChar)) {
      trailing = `${lastChar}${trailing}`;
      url = url.slice(0, -1);
      continue;
    }

    if (lastChar === ')') {
      const opens = (url.match(/\(/g) || []).length;
      const closes = (url.match(/\)/g) || []).length;
      if (closes > opens) {
        trailing = `${lastChar}${trailing}`;
        url = url.slice(0, -1);
        continue;
      }
    }

    break;
  }

  return { url, trailing };
}

function toSafeHref(candidate: string): string | null {
  const href = candidate.startsWith('www.') ? `https://${candidate}` : candidate;

  try {
    const parsed = new URL(href);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

export function linkifyText(text: string): ReactNode[] {
  if (!text) {
    return [text];
  }

  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let matchIndex = 0;

  for (const match of text.matchAll(URL_REGEX)) {
    const start = match.index ?? 0;
    const rawMatch = match[0];

    if (start > lastIndex) {
      nodes.push(text.slice(lastIndex, start));
    }

    const { url, trailing } = splitUrlAndTrailing(rawMatch);
    const href = toSafeHref(url);

    if (href) {
      nodes.push(
        <a
          key={`link-${start}-${matchIndex}`}
          href={href}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="break-all font-medium text-cyan-700 underline decoration-cyan-500/60 underline-offset-2 hover:text-cyan-800 dark:text-cyan-300 dark:hover:text-cyan-200"
        >
          {url}
        </a>
      );

      if (trailing) {
        nodes.push(trailing);
      }
    } else {
      nodes.push(rawMatch);
    }

    lastIndex = start + rawMatch.length;
    matchIndex += 1;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}