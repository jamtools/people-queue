import { expect, test, type Page, type TestInfo } from '@playwright/test';

type PerformerCase = {
  slug: string;
  name: string;
};

const performerCases: PerformerCase[] = [
  {
    slug: 'normal-name',
    name: 'Maya Stone',
  },
  {
    slug: 'long-spaced-name',
    name: 'The Extremely Long Experimental Folk Collective',
  },
  {
    slug: 'long-single-token-name',
    name: 'SupercalifragilisticexpialidociousDreamwaveOrchestraCollective',
  },
  {
    slug: 'extreme-name',
    name: 'A Very Very Very Very Very Long Performer Name That Used To Break The Kiosk Layout',
  },
];

async function addPerformerAndSetCurrent(page: Page, performer: PerformerCase) {
  await page.goto('/backstage');
  await expect(page.getByRole('heading', { name: /Backstage - Queue Management/i })).toBeVisible();

  const uniqueName = `${performer.name} ${Date.now()}`;
  await page.getByPlaceholder('Participant name').fill(uniqueName);

  await page.getByRole('button', { name: 'Add Link' }).click();
  await page.getByPlaceholder('username or URL').last().fill(`social-${performer.slug}`);
  await page.getByRole('button', { name: 'Add Participant' }).click();

  const performerCard = page
    .getByTestId('participant-item')
    .filter({ has: page.getByText(uniqueName, { exact: true }) })
    .last();

  await expect(performerCard).toBeVisible();
  await performerCard.getByRole('button', { name: 'Add to Queue' }).click();

  const queuedCard = page
    .getByTestId('participant-item')
    .filter({ has: page.getByText(uniqueName, { exact: true }) })
    .filter({ has: page.getByRole('button', { name: /Set As Performing|Now Performing/ }) })
    .first();

  await queuedCard.getByRole('button', { name: /Set As Performing|Now Performing/ }).click();
  return uniqueName;
}

async function expectDisplayLayoutIsSafe(page: Page, testInfo: TestInfo, slug: string) {
  await page.goto('/display');
  await expect(page.getByTestId('kiosk-display')).toBeVisible();
  await expect(page.getByTestId('performer-name')).toBeVisible();
  await expect(page.getByTestId('performer-social-links')).toBeVisible();
  await expect(page.getByTestId('performer-qr')).toBeVisible();

  await page.screenshot({
    path: testInfo.outputPath(`${slug}.png`),
    fullPage: true,
  });

  const contentBox = await page.getByTestId('performer-content').boundingBox();
  const nameBox = await page.getByTestId('performer-name').boundingBox();
  const socialBox = await page.getByTestId('performer-social-links').boundingBox();
  const qrBox = await page.getByTestId('performer-qr').boundingBox();

  expect(contentBox, 'performer content should be measurable').not.toBeNull();
  expect(nameBox, 'performer name should be measurable').not.toBeNull();
  expect(socialBox, 'social links should be measurable').not.toBeNull();
  expect(qrBox, 'QR code should be measurable').not.toBeNull();

  if (!contentBox || !nameBox || !socialBox || !qrBox) return;

  expect(contentBox.x + contentBox.width, 'text column must not overlap QR column').toBeLessThanOrEqual(qrBox.x);
  expect(nameBox.x + nameBox.width, 'performer name must not overlap QR column').toBeLessThanOrEqual(qrBox.x);
  expect(socialBox.x + socialBox.width, 'social links must not overlap QR column').toBeLessThanOrEqual(qrBox.x);
  expect(nameBox.height, 'performer name should be clamped to at most three kiosk lines').toBeLessThanOrEqual(230);
  expect(contentBox.y + contentBox.height, 'text content should stay inside the 1080p kiosk viewport').toBeLessThanOrEqual(1080);
}

test.describe('kiosk display long performer names', () => {
  for (const performer of performerCases) {
    test(`keeps ${performer.slug} clear of the QR code`, async ({ page }, testInfo) => {
      const uniqueName = await addPerformerAndSetCurrent(page, performer);
      await expectDisplayLayoutIsSafe(page, testInfo, performer.slug);
      await expect(page.getByTestId('performer-name')).toContainText(uniqueName);
    });
  }
});
