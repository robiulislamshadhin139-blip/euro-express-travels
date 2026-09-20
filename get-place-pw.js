const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Intercept requests to see where it redirects
  page.on('response', response => {
    if (response.url().includes('kgmid=')) {
      console.log("Found kgmid URL:", response.url());
    }
  });

  await page.goto('https://share.google/C8bquWcJXuMNkfc0b', { waitUntil: 'domcontentloaded' });
  
  // Wait a bit to let any JS redirect happen
  await page.waitForTimeout(3000);
  
  console.log("Final URL:", page.url());
  
  // Extract all links
  const links = await page.$$eval('a', as => as.map(a => a.href));
  const placeLinks = links.filter(l => l.includes('place_id=') || l.includes('ludocid='));
  console.log("Place Links:", placeLinks);

  // See if there's a data-pid or data-place-id attribute anywhere
  const pid = await page.evaluate(() => {
    const el = document.querySelector('[data-pid], [data-place-id]');
    if (el) return el.getAttribute('data-pid') || el.getAttribute('data-place-id');
    return null;
  });
  console.log("Data PID:", pid);

  await browser.close();
})();
