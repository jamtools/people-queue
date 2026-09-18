import { expect, test } from '@playwright/test';

test('Open Stage /signup submits a performer into the lineup', async ({ page }) => {
  const uniqueName = `Test Stage Name ${Date.now()}`;

  await page.goto('/signup');
  await expect(page.getByRole('heading', { name: 'Open Stage Night' })).toBeVisible();

  await page.getByLabel('Name (or stage name)').fill(uniqueName);
  await page.getByLabel('Tell us about yourself').fill('Acoustic songs inspired by late-night city walks.');
  await page.getByLabel('Email').fill('artist@example.com');
  await page.getByLabel('Equipment needs').fill('One vocal mic and one DI.');
  await page.getByLabel('Instagram Handle').fill('@songdrive_artist');
  await page.getByLabel('TikTok Handle').fill('@songdrive_tiktok');
  await page.getByLabel('Other Handle').fill('https://example.com/artist');
  await page.getByLabel('Yes, send me my private performance video').check();
  await page.getByLabel('I understand SongDrive may use event photos for promotion.').check();
  await page.getByLabel('I understand SongDrive may use short recap clips.').check();
  await page.getByLabel('Yes, send me SongDrive updates').check();

  await page.getByRole('button', { name: 'Join the lineup' }).click();
  await expect(page.getByText('You are in the lineup.')).toBeVisible();

  await page.goto('/queue');
  await expect(page.getByText(uniqueName)).toBeVisible();
});

test('kiosk welcome screen includes a compact QR link to signup', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('signup-qr-badge')).toBeVisible();
  await expect(page.getByText('/signup')).toBeVisible();
});
