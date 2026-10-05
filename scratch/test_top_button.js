const puppeteer = require('puppeteer');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function testTopWebhookButton() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:3007/', { waitUntil: 'networkidle0' });

  console.log('1. Page loaded successfully.');

  // Click the top button: "⚡ Webhook Dispatch to Make.com"
  const topBtn = await page.$('.app-header .btn-success');
  if (topBtn) {
    console.log('2. Top Webhook Dispatch button found. Clicking...');
    await topBtn.click();
    await delay(500);

    const isModalVisible = await page.evaluate(() => {
      const modal = document.getElementById('webhook-modal') || document.getElementById('dispatch-webhook-modal');
      return modal && window.getComputedStyle(modal).display !== 'none';
    });

    console.log('3. Is Webhook Modal Visible after clicking top button?:', isModalVisible);

    // Now test clicking "🟢 Test Make.com Link" inside the modal
    const testLinkBtn = await page.$('#webhook-modal .btn-secondary, #dispatch-webhook-modal .btn-secondary');
    if (testLinkBtn) {
      console.log('4. Clicking "Test Make.com Link" button inside modal...');
      await testLinkBtn.click();
      await delay(2500);

      const statusText = await page.evaluate(() => {
        const box = document.getElementById('webhook-dispatch-status-box') || document.getElementById('dispatch-status-box');
        return box ? box.innerText : '';
      });
      console.log('5. Status box result after clicking test link:\n', statusText);
    }
  } else {
    console.error('❌ Top Webhook Dispatch button not found');
  }

  await browser.close();
}

testTopWebhookButton().catch(console.error);
