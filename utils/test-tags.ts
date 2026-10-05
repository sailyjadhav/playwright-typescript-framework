// Every tag the suite uses. Data rows that carry tags use this type, so a mistyped tag fails the
// typecheck instead of silently selecting nothing.
export type TestTag = '@smoke' | '@creates-account';
