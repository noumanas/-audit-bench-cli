export type FailOnLevel = 'do_not_ship' | 'needs_work' | 'never';

const RANK: Record<string, number> = { pass: 0, needs_work: 1, do_not_ship: 2 };

/**
 * Mirrors the same default threshold the PR/MR commit-status check uses
 * server-side (do_not_ship blocks a merge; needs_work doesn't) — a CI gate
 * is a reasonable place to want to be stricter, so it's configurable here
 * via --fail-on, unlike the server-side gate.
 */
export function shouldFailBuild(verdict: string | null | undefined, failOn: FailOnLevel): boolean {
  if (failOn === 'never' || verdict == null) return false;
  const threshold = failOn === 'needs_work' ? RANK.needs_work : RANK.do_not_ship;
  return (RANK[verdict] ?? 0) >= threshold;
}

export function parseFailOn(raw: string | undefined): FailOnLevel {
  if (raw === undefined) return 'do_not_ship';
  if (raw === 'do_not_ship' || raw === 'needs_work' || raw === 'never') return raw;
  console.error(`Invalid --fail-on value "${raw}" — expected one of: do_not_ship, needs_work, never.`);
  process.exit(1);
}
