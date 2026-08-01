import type { Prisma } from '../generated/prisma/client.ts';
import { getPrisma } from './prisma.ts';

/**
 * The old MySQL queries used CURRENT_DATE(), WEEKDAY() and MONTH(), which were
 * evaluated in the database server's local timezone. Postgres on Prisma
 * Postgres runs in UTC, so "this week" and "this month" are computed here
 * against an explicit timezone to keep the dashboard counts meaningful.
 */
const REPORT_TIMEZONE = process.env.REPORT_TIMEZONE ?? 'Asia/Kolkata';

export type FeedbackFilters = {
  student_reg_no?: string;
  mess_name?: string;
  block_name?: string;
  start_date?: string;
  end_date?: string;
};

/** How far the given timezone is ahead of UTC at that instant, in milliseconds. */
function timeZoneOffsetMs(instant: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(instant);

  const field: Record<string, number> = {};
  for (const part of parts) {
    if (part.type !== 'literal') field[part.type] = Number(part.value);
  }

  const asIfUtc = Date.UTC(
    field.year,
    field.month - 1,
    field.day,
    field.hour,
    field.minute,
    field.second
  );

  return asIfUtc - Math.floor(instant.getTime() / 1000) * 1000;
}

/** Wall-clock date fields in the report timezone for a given instant. */
function localFields(instant: Date) {
  const offset = timeZoneOffsetMs(instant, REPORT_TIMEZONE);
  const shifted = new Date(instant.getTime() + offset);

  return {
    offset,
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth(),
    day: shifted.getUTCDate(),
    weekday: shifted.getUTCDay(), // 0 = Sunday
  };
}

function startOfWeek(now: Date): Date {
  const { offset, year, month, day, weekday } = localFields(now);
  // Match MySQL's WEEKDAY(): the week starts on Monday.
  const daysSinceMonday = (weekday + 6) % 7;
  return new Date(Date.UTC(year, month, day - daysSinceMonday) - offset);
}

function startOfMonth(now: Date): Date {
  const { offset, year, month } = localFields(now);
  return new Date(Date.UTC(year, month, 1) - offset);
}

/** Parses a YYYY-MM-DD filter value into an instant in the report timezone. */
function parseBoundary(value: string, edge: 'start' | 'end'): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());

  if (!match) {
    const fallback = new Date(value);
    return Number.isNaN(fallback.getTime()) ? null : fallback;
  }

  const [, year, month, day] = match.map(Number);
  const approximate = new Date(Date.UTC(year, month - 1, day, 12));
  const offset = timeZoneOffsetMs(approximate, REPORT_TIMEZONE);

  return edge === 'start'
    ? new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0) - offset)
    : new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999) - offset);
}

export function buildWhere(filters: FeedbackFilters): Prisma.FeedbackWhereInput {
  const where: Prisma.FeedbackWhereInput = {};

  if (filters.student_reg_no) where.student_reg_no = filters.student_reg_no;
  if (filters.mess_name) where.mess_name = filters.mess_name;
  if (filters.block_name) where.block_name = filters.block_name;

  const gte = filters.start_date ? parseBoundary(filters.start_date, 'start') : null;
  const lte = filters.end_date ? parseBoundary(filters.end_date, 'end') : null;

  if (gte || lte) {
    where.submitted_at = { ...(gte && { gte }), ...(lte && { lte }) };
  }

  return where;
}

export async function findFeedback(filters: FeedbackFilters) {
  const prisma = await getPrisma();

  return prisma.feedback.findMany({
    where: buildWhere(filters),
    orderBy: { submitted_at: 'desc' },
  });
}

export async function getStats() {
  const prisma = await getPrisma();
  const now = new Date();

  const [totalCount, weeklyCount, monthlyCount] = await Promise.all([
    prisma.feedback.count(),
    prisma.feedback.count({ where: { submitted_at: { gte: startOfWeek(now) } } }),
    prisma.feedback.count({ where: { submitted_at: { gte: startOfMonth(now) } } }),
  ]);

  return { totalCount, weeklyCount, monthlyCount };
}

/** The statistics block the admin dashboard expects. */
export function toStatisticsPayload(stats: Awaited<ReturnType<typeof getStats>>) {
  return {
    totalFeedbacks: stats.totalCount,
    weeklyFeedbacks: stats.weeklyCount,
    monthlyFeedbacks: stats.monthlyCount,
  };
}
