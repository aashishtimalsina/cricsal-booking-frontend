import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { customerBookingOverview } from '../../api/customers';

const PER_PAGE_OPTIONS = [10, 15, 25, 50];

function buildPageList(current, last) {
  if (last <= 1) return [1];
  if (last <= 9) {
    return Array.from({ length: last }, (_, i) => i + 1);
  }
  const set = new Set([1, last]);
  for (let d = -2; d <= 2; d++) {
    const p = current + d;
    if (p >= 1 && p <= last) set.add(p);
  }
  return [...set].sort((a, b) => a - b);
}

function CustomerRowAvatar({ name, avatarUrl }) {
  const initial = (name || '?').trim().charAt(0).toUpperCase() || '?';
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt=""
        className="h-11 w-11 shrink-0 rounded-full border border-gray-200 object-cover"
      />
    );
  }
  return (
    <div
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-emerald-50 text-sm font-semibold text-emerald-900"
      aria-hidden
    >
      {initial}
    </div>
  );
}

export default function CustomerBookings() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['customer-booking-overview', search, page, perPage],
    queryFn: async () => (await customerBookingOverview({ page, per_page: perPage, search: search || undefined })).data,
  });

  const rows = data?.data ?? [];
  const meta = data?.meta;

  const canPrev = meta && meta.current_page > 1;
  const canNext = meta && meta.current_page < meta.last_page;

  const titleSuffix = useMemo(() => {
    if (!meta) return '';
    return ` · ${meta.total} customer${meta.total === 1 ? '' : 's'} with bookings`;
  }, [meta]);

  const pageList = useMemo(() => {
    if (!meta?.last_page) return [];
    return buildPageList(meta.current_page, meta.last_page);
  }, [meta]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer-wise bookings"
        subtitle={`Open a customer to see loyalty totals and up to 25 recent ground bookings.${titleSuffix}`}
      />

      <div className="flex flex-wrap items-end gap-3 rounded-xl bg-white p-4 shadow-sm">
        <div className="min-w-[200px] flex-1">
          <Input
            label="Search name, email, or phone"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Type to filter…"
          />
        </div>
        <label className="text-sm text-gray-700">
          <span className="mb-1 block font-medium">Per page</span>
          <select
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm"
            value={perPage}
            onChange={(e) => {
              setPerPage(Number(e.target.value));
              setPage(1);
            }}
          >
            {PER_PAGE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <Button
          variant="secondary"
          onClick={() => {
            setSearch('');
            setPage(1);
          }}
        >
          Clear
        </Button>
      </div>

      {isLoading ? (
        <p className="text-gray-600">Loading…</p>
      ) : (
        <>
          <div className="space-y-2">
            {rows.length === 0 ? (
              <p className="rounded-xl bg-white p-8 text-center text-gray-500 shadow-sm">
                No customers with bookings match this search.
              </p>
            ) : (
              rows.map((row) => (
                <Link
                  key={row.id}
                  to={`/admin/customers/bookings/${row.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50/30"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <CustomerRowAvatar name={row.name} avatarUrl={row.avatar_url} />
                    <div className="min-w-0 flex-1 flex-wrap items-baseline gap-x-3 gap-y-1 sm:flex">
                      <span className="block text-base font-semibold text-gray-900 sm:inline">{row.name}</span>
                      <span className="block text-sm text-gray-500 sm:inline">{row.email}</span>
                      <span className="block text-sm text-gray-500 sm:inline">{row.phone || '—'}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 font-medium">{row.bookings_count} bookings</span>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-900">
                      {row.confirmed_bookings_count} confirmed
                    </span>
                    <span className="font-medium text-emerald-700">View →</span>
                  </div>
                </Link>
              ))
            )}
          </div>

          {meta && meta.total > 0 && (
            <div className="space-y-3 rounded-xl border border-gray-100 bg-white px-4 py-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-gray-600">
                  Showing {(meta.from ?? 0) || 0}–{meta.to ?? 0} of {meta.total}
                  {meta.last_page > 1 ? (
                    <span className="text-gray-500">
                      {' '}
                      · Page {meta.current_page} of {meta.last_page}
                    </span>
                  ) : null}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    className="!text-sm"
                    disabled={!canPrev || isFetching}
                    onClick={() => setPage(1)}
                  >
                    First
                  </Button>
                  <Button
                    variant="secondary"
                    className="!text-sm"
                    disabled={!canPrev || isFetching}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    className="!text-sm"
                    disabled={!canNext || isFetching}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                  <Button
                    variant="secondary"
                    className="!text-sm"
                    disabled={!canNext || isFetching}
                    onClick={() => setPage(meta.last_page)}
                  >
                    Last
                  </Button>
                </div>
              </div>
              {meta.last_page > 1 && pageList.length > 0 && (
                <div className="flex flex-wrap items-center gap-1 border-t border-gray-100 pt-3">
                  <span className="mr-2 text-xs font-medium uppercase text-gray-500">Jump to</span>
                  {pageList.flatMap((p, idx) => {
                    const prev = pageList[idx - 1];
                    const nodes = [];
                    if (idx > 0 && p - prev > 1) {
                      nodes.push(
                        <span key={`ellipsis-${p}`} className="px-1 text-gray-400" aria-hidden>
                          …
                        </span>
                      );
                    }
                    nodes.push(
                      <button
                        key={p}
                        type="button"
                        disabled={isFetching || p === meta.current_page}
                        onClick={() => setPage(p)}
                        className={`min-w-[2.25rem] rounded-lg px-2 py-1 text-sm font-medium ${
                          p === meta.current_page
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200 disabled:opacity-50'
                        }`}
                      >
                        {p}
                      </button>
                    );
                    return nodes;
                  })}
                </div>
              )}
            </div>
          )}

          <p className="text-center text-sm text-gray-500">
            <Link to="/admin/dashboard" className="font-medium text-emerald-700 hover:text-emerald-900">
              ← Back to dashboard
            </Link>
            {' · '}
            <Link to="/admin/bookings" className="font-medium text-emerald-700 hover:text-emerald-900">
              All bookings
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
