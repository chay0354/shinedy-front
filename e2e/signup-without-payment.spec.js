import { test, expect } from '@playwright/test';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const API = 'http://127.0.0.1:4000';

function israeliId() {
  const base = String(Date.now()).slice(-8).padStart(8, '0');
  let sum = 0;
  for (let i = 0; i < 8; i += 1) {
    let n = Number(base[i]) * ((i % 2) + 1);
    if (n > 9) n -= 9;
    sum += n;
  }
  return base + String((10 - (sum % 10)) % 10);
}

function tinyPng() {
  return Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64',
  );
}

async function smsCode(national) {
  const file = join(tmpdir(), 'shinedy-qa-otp.json');
  const started = Date.now();
  while (Date.now() - started < 20000) {
    try {
      const data = JSON.parse(readFileSync(file, 'utf8'));
      const last = data.last;
      const fresh = last?.at && Date.now() - Date.parse(last.at) < 60000;
      if (last?.channel === 'sms' && fresh && String(last.dest || '').endsWith(national)) return String(last.code);
    } catch {
      /* the code is written when the phone step sends it */
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error('קוד האימות לא נכתב');
}

function removeTestUser(email) {
  const script = `
    import 'dotenv/config';
    import { getSupabase } from './src/supabase.js';
    import { deleteCustomerAccount } from './src/db.js';
    const email = process.env.CLEAN_EMAIL;
    const client = getSupabase();
    const { data, error } = await client.from('profiles').select('id').ilike('email', email).maybeSingle();
    if (error) throw error;
    if (!data) {
      console.log('cleanup: none');
      process.exit(0);
    }
    await deleteCustomerAccount(data.id);
    console.log('cleanup: removed');
  `;
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', script], {
    cwd: join(import.meta.dirname, '..', '..', 'backend'),
    env: { ...process.env, CLEAN_EMAIL: email },
    encoding: 'utf8',
  });
  const output = `${result.stdout || ''}\n${result.stderr || ''}`;
  if (result.status !== 0 && !/cleanup:/.test(output) && !/UV_HANDLE_CLOSING/.test(output)) {
    throw new Error(output.trim() || 'cleanup failed');
  }
}

async function dismissCookies(page) {
  const button = page.getByRole('button', { name: 'הכרחיות בלבד' });
  if (await button.isVisible().catch(() => false)) await button.click();
}

async function clickContinue(page) {
  const now = page.locator('.signup-step-now');
  const before = ((await now.textContent()) || '').trim();
  const button = page.getByRole('button', { name: 'המשך', exact: true });
  for (let attempt = 0; attempt < 2; attempt += 1) {
    await button.click();
    try {
      await expect(now).not.toHaveText(before, { timeout: attempt === 0 ? 8000 : 20000 });
      return;
    } catch (error) {
      const message = (await page.locator('.form-err').textContent().catch(() => '')) || '';
      if (attempt === 0 && /לא ניתן להתחבר/.test(message)) {
        await page.waitForTimeout(1500);
        continue;
      }
      throw error;
    }
  }
}

test('signup opens a member without the payment page', async ({ page }) => {
  const stamp = Date.now();
  const email = `playwright-${stamp}@example.com`;
  const phone = `052${String(stamp).slice(-7)}`;
  const national = phone.slice(1);
  const password = 'Testpass1';
  const checkoutCalls = [];
  page.on('request', (request) => {
    if (request.url().includes('/api/payments/checkout') || /hyp|creditguard|yaad/i.test(request.url())) {
      checkoutCalls.push(request.url());
    }
  });

  try {
    await expect.poll(async () => {
      const health = await page.request.get(`${API}/api/health`).catch(() => null);
      return health?.ok() ? (await health.json()).paymentsRequired : null;
    }).toBe(false);

    await page.goto('/signup');
    await dismissCookies(page);
    await expect(page.locator('.signup-steps')).not.toContainText('תשלום', { timeout: 15000 });

    await page.locator('#s-name').fill('בדיקת הרשמה');
    await page.locator('#s-id').fill(israeliId());
    await page.locator('#s-phone').fill(phone);
    await page.locator('#s-email').fill(email);
    await page.locator('#s-city').fill('תל אביב');
    await page.locator('#s-city').locator('xpath=ancestor::div[contains(@class,"address-combo")]').getByRole('option').first().click();
    await page.locator('#s-street').fill('הרצל');
    await page.locator('#s-street').locator('xpath=ancestor::div[contains(@class,"address-combo")]').getByRole('option').first().click();
    await page.locator('#s-house').fill('10');
    await page.locator('#s-pass').fill(password);
    await page.locator('#s-pass2').fill(password);
    await clickContinue(page);

    await page.getByRole('button', { name: /Essential/ }).click();
    await page.getByRole('checkbox').nth(0).check();
    await page.getByRole('checkbox').nth(1).check();
    await clickContinue(page);

    await page.locator('#s-id-file').setInputFiles({
      name: 'id.png',
      mimeType: 'image/png',
      buffer: tinyPng(),
    });
    await expect(page.getByText(/הועלה/)).toBeVisible();
    await clickContinue(page);

    await expect(page.locator('#s-phone-code')).toBeVisible();
    await expect(page.getByRole('button', { name: 'סיום הרשמה' })).toBeVisible();
    await page.locator('#s-phone-code').fill(await smsCode(national));
    await page.getByRole('button', { name: 'סיום הרשמה' }).click();

    await expect(page).toHaveURL(/\/catalog/, { timeout: 60000 });
    await expect(page.locator('iframe.signup-pay-frame')).toHaveCount(0);
    expect(checkoutCalls).toEqual([]);

    const token = await page.evaluate(() => localStorage.getItem('shinedy_token'));
    expect(token).toBeTruthy();
    const state = await page.request.get(`${API}/api/state`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(state.ok()).toBeTruthy();
    const body = await state.json();
    expect(body.subscribed).toBe(true);
    expect(body.payment?.onFile).not.toBe(true);
  } finally {
    removeTestUser(email);
  }
});
