"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shouldFailBuild = shouldFailBuild;
exports.parseFailOn = parseFailOn;
const RANK = { pass: 0, needs_work: 1, do_not_ship: 2 };
/**
 * Mirrors the same default threshold the PR/MR commit-status check uses
 * server-side (do_not_ship blocks a merge; needs_work doesn't) — a CI gate
 * is a reasonable place to want to be stricter, so it's configurable here
 * via --fail-on, unlike the server-side gate.
 */
function shouldFailBuild(verdict, failOn) {
    if (failOn === 'never' || verdict == null)
        return false;
    const threshold = failOn === 'needs_work' ? RANK.needs_work : RANK.do_not_ship;
    return (RANK[verdict] ?? 0) >= threshold;
}
function parseFailOn(raw) {
    if (raw === undefined)
        return 'do_not_ship';
    if (raw === 'do_not_ship' || raw === 'needs_work' || raw === 'never')
        return raw;
    console.error(`Invalid --fail-on value "${raw}" — expected one of: do_not_ship, needs_work, never.`);
    process.exit(1);
}
