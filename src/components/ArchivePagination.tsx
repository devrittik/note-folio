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
  basePath: string;
}

export default function ArchivePagination({
  kind,
  items,
  initialPage = 1,
  pageSize = 4,
  basePath
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

  const pageHref = (pageNumber: number) => pageNumber === 1 ? basePath : `${basePath}?page=${pageNumber}`;

  return (
    <div className="archive-pager" ref={containerRef} tabIndex={-1} aria-live="polite">
      <div className="archive-items">
        {visibleItems.map((item) => kind === 'projects' ? (
          <article className="project-row transition-mechanical" key={item.href}>
            <a className="card-hit-area" href={item.href} aria-label={`Open ${item.title} project record`}><span className="sr-only">View project: {item.title}</span></a>
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
            <a className="card-hit-area" href={item.href} aria-label={`Read ${item.title}`}><span className="sr-only">Read journal entry: {item.title}</span></a>
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
        {page===1
          ? <span className="pagination-control disabled" aria-hidden="true">←</span>
          : <a className="pagination-control" href={pageHref(page-1)} rel="prev" aria-label="Previous page" onClick={(event)=>{event.preventDefault();changePage(page-1)}}>←</a>}
        <div className="pagination-pages">
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
            <a
              href={pageHref(pageNumber)}
              className={pageNumber === page ? 'active' : undefined}
              aria-current={pageNumber === page ? 'page' : undefined}
              onClick={(event)=>{event.preventDefault();changePage(pageNumber)}}
              key={pageNumber}
            >
              {String(pageNumber).padStart(2, '0')}
            </a>
          ))}
        </div>
        {page===totalPages
          ? <span className="pagination-control disabled" aria-hidden="true">→</span>
          : <a className="pagination-control" href={pageHref(page+1)} rel="next" aria-label="Next page" onClick={(event)=>{event.preventDefault();changePage(page+1)}}>→</a>}
        <span className="pagination-status">Page {String(page).padStart(2, '0')} // {String(totalPages).padStart(2, '0')}</span>
      </nav>
    </div>
  );
}
