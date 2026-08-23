import { useMemo, useRef, useState } from 'react';

export interface ArchiveItem {
  href: string;
  sequence: number;
  title: string;
  excerpt: string;
  tags: string[];
  status?: 'live' | 'built';
  date?: string;
}

interface Props {
  kind: 'projects' | 'journal';
  items: ArchiveItem[];
  initialPage?: number;
  pageSize?: number;
}

export default function ArchivePagination({
  kind,
  items,
  initialPage = 1,
  pageSize = 4
}: Props) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const firstPage = Math.min(Math.max(initialPage, 1), totalPages);
  const [page, setPage] = useState(firstPage);
  const containerRef = useRef<HTMLDivElement>(null);

  const visibleItems = useMemo(
    () => items.slice((page - 1) * pageSize, page * pageSize),
    [items, page, pageSize]
  );

  const changePage = (nextPage: number) => {
    const safePage = Math.min(Math.max(nextPage, 1), totalPages);
    if (safePage === page) return;
    setPage(safePage);

    const url = new URL(window.location.href);
    if (safePage === 1) url.searchParams.delete('page');
    else url.searchParams.set('page', String(safePage));
    window.history.replaceState({}, '', url);

    window.requestAnimationFrame(() => containerRef.current?.focus({ preventScroll: true }));
  };

  return (
    <div className="archive-pager" ref={containerRef} tabIndex={-1} aria-live="polite">
      <div className="archive-items">
        {visibleItems.map((item) => kind === 'projects' ? (
          <article className="project-row transition-mechanical" key={item.href}>
            <a className="card-hit-area" href={item.href} aria-label={`Open ${item.title} project record`}></a>
            <div className="project-top">
              <span className="project-index">Project // {String(item.sequence).padStart(2, '0')}</span>
              <h3>{item.title}</h3>
              {item.status && <span className={`status ${item.status}`}>Status / <b>{item.status}</b></span>}
            </div>
            <p>{item.excerpt}</p>
            <div className="row-foot"><div>{item.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div><span className="button-link">Open Record ↗</span></div>
          </article>
        ) : (
          <article className="journal-row" key={item.href}>
            <a className="card-hit-area" href={item.href} aria-label={`Read ${item.title}`}></a>
            <div className="journal-top">
              <span className="project-index signal">Entry // {String(item.sequence).padStart(2, '0')}</span>
              <h3>{item.title}</h3>
              {item.date && <span className="journal-date meta">Date // <b className="signal">{item.date}</b></span>}
            </div>
            <p>{item.excerpt}</p>
            <div className="row-foot"><div>{item.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div><span className="button-link">Read Entry ↗</span></div>
          </article>
        ))}
      </div>

      <nav className="pagination" aria-label={`${kind} pagination`}>
        <button type="button" onClick={() => changePage(page - 1)} disabled={page === 1} aria-label="Previous page">←</button>
        <div className="pagination-pages">
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
            <button
              type="button"
              className={pageNumber === page ? 'active' : undefined}
              aria-current={pageNumber === page ? 'page' : undefined}
              onClick={() => changePage(pageNumber)}
              key={pageNumber}
            >
              {String(pageNumber).padStart(2, '0')}
            </button>
          ))}
        </div>
        <button type="button" onClick={() => changePage(page + 1)} disabled={page === totalPages} aria-label="Next page">→</button>
        <span className="pagination-status">Page {String(page).padStart(2, '0')} // {String(totalPages).padStart(2, '0')}</span>
      </nav>
    </div>
  );
}
