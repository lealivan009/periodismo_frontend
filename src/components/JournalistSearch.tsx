import { useEffect, useRef, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api, mediaUrl } from "../api/client";
import { displayName, journalistPath, type JournalistCard } from "../api/types";

function fold(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function matchesJournalist(journalist: JournalistCard, query: string) {
  const needle = fold(query).replace(/^@+/, "");
  if (!needle) {
    return true;
  }
  const haystack = fold(
    `${journalist.firstName} ${journalist.lastName} ${journalist.username ?? ""} ${journalist.specialty ?? ""} ${journalist.bio ?? ""}`
  );
  return haystack.includes(needle);
}

export function JournalistSearch() {
  const navigate = useNavigate();
  const location = useLocation();
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [journalists, setJournalists] = useState<JournalistCard[] | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (location.pathname === "/periodistas") {
      setQuery(params.get("q") ?? "");
    }
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!open) {
      return;
    }
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function ensureLoaded() {
    if (journalists) {
      return;
    }
    api
      .listJournalists()
      .then(setJournalists)
      .catch(() => setJournalists([]));
  }

  const matches = (journalists ?? []).filter((journalist) => matchesJournalist(journalist, query)).slice(0, 6);

  function goToList(event: FormEvent) {
    event.preventDefault();
    setOpen(false);
    const next = query.trim();
    navigate(next ? `/periodistas?q=${encodeURIComponent(next)}` : "/periodistas");
  }

  return (
    <div className={`nav-search${open ? " open" : ""}`} ref={rootRef}>
      <form onSubmit={goToList}>
        <span className="nav-search-icon" aria-hidden>
          <svg viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <path d="M16 16.5 20 20.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </span>
        <input
          type="search"
          value={query}
          placeholder="Buscar periodistas"
          aria-label="Buscar periodistas"
          autoComplete="off"
          onFocus={() => {
            ensureLoaded();
            setOpen(true);
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            ensureLoaded();
            setOpen(true);
          }}
        />
      </form>
      {open ? (
        <div className="nav-search-panel" role="listbox" aria-label="Periodistas">
          {journalists === null ? <p>Buscando…</p> : null}
          {journalists && matches.length === 0 ? <p>No hay periodistas con ese nombre o usuario.</p> : null}
          {matches.map((journalist) => {
            const photo = mediaUrl(journalist.avatarUrl);
            const initials = `${journalist.firstName?.[0] ?? ""}${journalist.lastName?.[0] ?? ""}`.toUpperCase();
            return (
              <button
                key={journalist.id}
                type="button"
                role="option"
                onClick={() => {
                  setOpen(false);
                  navigate(journalistPath(journalist));
                }}
              >
                {photo ? (
                  <img src={photo} alt="" />
                ) : (
                  <span className="avatar" aria-hidden>
                    {initials || "P"}
                  </span>
                )}
                <span>
                  <strong>{displayName(journalist)}</strong>
                  {journalist.username ? <small className="search-handle">@{journalist.username}</small> : null}
                  <small>{journalist.specialty || "Periodista"}</small>
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
