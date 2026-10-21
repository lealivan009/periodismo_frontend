import type { ReactElement } from "react";

interface SocialLinkItem {
  href: string;
  label: string;
  icon: ReactElement;
}

interface SocialLinksProps {
  xUrl?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
}

export function SocialLinks({ xUrl, instagramUrl, facebookUrl }: SocialLinksProps) {
  const items: SocialLinkItem[] = [];
  if (xUrl) {
    items.push({ href: xUrl, label: "X", icon: <XIcon /> });
  }
  if (instagramUrl) {
    items.push({ href: instagramUrl, label: "Instagram", icon: <InstagramIcon /> });
  }
  if (facebookUrl) {
    items.push({ href: facebookUrl, label: "Facebook", icon: <FacebookIcon /> });
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="social-links">
      {items.map((item) => (
        <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" aria-label={item.label} title={item.label}>
          {item.icon}
        </a>
      ))}
    </div>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M14.7 10.3 21.4 3h-1.6l-5.8 6.4L9.2 3H3.4l7 10L3.4 21h1.6l6.2-6.8L14.8 21h5.8l-7.3-10.7Zm-2.2 2.4-.7-1-5.7-7.7h2.4l4.6 6.2.7 1 6 8.1h-2.4l-4.9-6.6Z"
      />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M8 3h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8a5 5 0 0 1 5-5Zm0 1.8A3.2 3.2 0 0 0 4.8 8v8A3.2 3.2 0 0 0 8 19.2h8a3.2 3.2 0 0 0 3.2-3.2V8A3.2 3.2 0 0 0 16 4.8H8Zm8.7 1.5a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2ZM12 7.2A4.8 4.8 0 1 1 7.2 12 4.8 4.8 0 0 1 12 7.2Zm0 1.8A3 3 0 1 0 15 12a3 3 0 0 0-3-3Z"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M14.2 21v-7.1h2.4l.4-2.8h-2.8V9.3c0-.8.2-1.4 1.4-1.4H17V5.4c-.3 0-1.1-.1-2.1-.1-2.1 0-3.5 1.3-3.5 3.6v2h-2.3v2.8H11.4V21h2.8Z"
      />
    </svg>
  );
}
