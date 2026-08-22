// Public Career Passport view for share links (blueprint §5 privacy rules).
// Exposes ONLY shared fields: name, area, availability, skills, languages, and
// verified/self-declared work records. Never phone, documents, or identity data.
// A revoked or expired link returns 410. HTML view for human readers (the link
// a recruiter opens), JSON for machine clients.
import { Router, Request, Response } from 'express';
import { prisma } from '../db/prisma';
import { asyncHandler } from '../middleware/validation';

const router = Router();

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

interface PublicPassport {
  fullName: string | null;
  preferredArea: string | null;
  availability: string | null;
  skills: string[];
  languages: string[];
  workRecords: {
    role: string;
    company: string;
    workplace: string | null;
    startDate: Date;
    endDate: Date | null;
    verified: boolean;
  }[];
}

function renderPage(data: PublicPassport | null, meta: { expiresAt?: Date; reason?: string }) {
  const { expiresAt, reason } = meta;
  const statusHtml = reason
    ? `<p class="status bad">${reason === 'revoked' ? 'This share has been revoked.' : 'This share has expired.'}</p>`
    : `<p class="status">Verified work record shared via SkillBridge · expires ${escapeHtml(
        expiresAt ? new Date(expiresAt).toLocaleString() : '',
      )}</p>`;

  const bodyHtml = data
    ? `
      <h1>${escapeHtml(data.fullName || 'SkillBridge worker')}</h1>
      ${data.preferredArea ? `<p class="meta">Prefers: ${escapeHtml(data.preferredArea)}</p>` : ''}
      ${data.availability ? `<p class="meta">Availability: ${escapeHtml(data.availability)}</p>` : ''}

      <h2>Skills</h2>
      <ul class="chips">${data.skills.map((s) => `<li>${escapeHtml(s)}</li>`).join('') || '<li class="empty">None listed</li>'}</ul>

      <h2>Languages</h2>
      <ul class="chips">${data.languages.map((l) => `<li>${escapeHtml(l)}</li>`).join('') || '<li class="empty">None listed</li>'}</ul>

      <h2>Work history</h2>
      ${data.workRecords
        .map(
          (r) => `
        <div class="record">
          <strong>${escapeHtml(r.role)}</strong> — ${escapeHtml(r.company)}
          ${r.workplace ? `<span class="dim"> · ${escapeHtml(r.workplace)}</span>` : ''}
          <div class="dim">${r.startDate.getFullYear()}–${r.endDate ? r.endDate.getFullYear() : 'Present'}</div>
          <span class="${r.verified ? 'tag ok' : 'tag'}">${r.verified ? '✓ Verified by employer' : 'Self-declared'}</span>
        </div>`,
        )
        .join('') || '<p class="dim">No work history listed.</p>'}`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>SkillBridge — Career Passport</title>
<style>
  body { font-family: -apple-system, 'Noto Sans Khmer', sans-serif; background: #F1EEF7; color: #33304A; margin: 0; padding: 24px; }
  .card { max-width: 640px; margin: 0 auto; background: #fff; border: 1px solid #E0DAEA; border-radius: 16px; padding: 24px; }
  h1 { font-size: 28px; margin: 0 0 8px; }
  h2 { font-size: 13px; letter-spacing: 0.12em; text-transform: uppercase; color: #6B5B95; margin: 20px 0 8px; }
  .meta { color: #6B6780; margin: 2px 0; }
  .chips { list-style: none; display: flex; flex-wrap: wrap; gap: 8px; padding: 0; margin: 0; }
  .chips li { background: #EFEBF5; border: 1px solid #E0DAEA; border-radius: 999px; padding: 6px 12px; font-size: 13px; }
  .chips li.empty { color: #9A95AB; }
  .record { border-top: 1px solid #E0DAEA; padding: 10px 0; }
  .dim { color: #9A95AB; font-size: 13px; }
  .tag { display: inline-block; margin-top: 6px; font-size: 12px; padding: 3px 10px; border-radius: 999px; border: 1px solid #E0DAEA; color: #6B6780; }
  .tag.ok { background: #E3F5EC; border-color: #2BA372; color: #1F7E54; }
  .status { color: #6B5B95; font-size: 13px; }
  .status.bad { color: #D23B2E; }
  footer { text-align: center; color: #9A95AB; font-size: 12px; margin-top: 16px; }
</style>
</head>
<body>
  <div class="card">
    ${statusHtml}
    ${bodyHtml}
  </div>
  <footer>SkillBridge · verified work for Cambodia · <a href="https://skillbridge.dev">skillbridge.dev</a></footer>
</body>
</html>`;
}

// GET /api/v1/public/passport/:token
router.get(
  '/passport/:token',
  asyncHandler(async (req: Request, res: Response) => {
    const share = await prisma.passportShare.findUnique({
      where: { token: req.params.token },
      include: { worker: { include: { workRecords: true } } },
    });

    if (!share) {
      return res.status(404).json({ error: 'Share not found' });
    }

    const active = !share.revokedAt && share.expiresAt.getTime() > Date.now();
    const wantsHtml = req.accepts(['html', 'json']) === 'html';

    if (!active) {
      const reason = share.revokedAt ? 'revoked' : 'expired';
      if (wantsHtml) return res.status(410).send(renderPage(null, { reason }));
      return res.status(410).json({ error: `Share ${reason}` });
    }

    const data: PublicPassport = {
      fullName: share.worker.fullName,
      preferredArea: share.worker.preferredArea,
      availability: share.worker.availability,
      skills: share.worker.skills,
      languages: share.worker.languages,
      workRecords: share.worker.workRecords.map((r) => ({
        role: r.role,
        company: r.company,
        workplace: r.workplace,
        startDate: r.startDate,
        endDate: r.endDate,
        verified: r.verified,
      })),
    };

    if (wantsHtml) {
      return res.send(renderPage(data, { expiresAt: share.expiresAt }));
    }
    res.json({ passport: data, expiresAt: share.expiresAt });
  }),
);

export default router;
