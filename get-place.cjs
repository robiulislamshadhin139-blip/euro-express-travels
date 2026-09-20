const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  const url = "https://www.google.com/search?q=Euro+Express+Travels&stick=H4sIAAAAAAAA_-NgU1I1qEhMMk41T05OSktKNE6yME6zMqgwSUsyM09MtEg0MjUzMjA3X8Qq4lpalK_gWlFQlFpcrBBSlFiWmlMMANtct4NAAAAA&hl=en&mat=CWdRh3L3j4NFElcBzAmVZrSJR-EKvvNA7igrgeRN2FQg21r5_phZjzNrkegAV595JIMwMjS_tDKmyXVJCNgFdnJxtm3Bn0EKFuN2cCsGJM6Go2tPaXowh0d5tH_ZqHMLRjA&authuser=4&ved=1t:350944";
  
  await page.goto(url, { waitUntil: 'networkidle2' });
  
  const placeId = await page.evaluate(() => {
    // Look for attributes that might contain the Place ID
    // Often it is in a data-pid attribute or data-place-id
    let element = document.querySelector('[data-pid]');
    if (element) return element.getAttribute('data-pid');
    
    // Check URLs for place/id/ or ludocid
    const links = Array.from(document.querySelectorAll('a'));
    for (let a of links) {
      if (a.href && a.href.includes('place_id=')) {
        const urlParams = new URL(a.href).searchParams;
        return urlParams.get('place_id');
      }
      if (a.href && a.href.includes('ludocid=')) {
          const urlParams = new URL(a.href).searchParams;
          return urlParams.get('ludocid');
      }
    }
    return null;
  });

  const bodyHTML = await page.evaluate(() => document.body.innerHTML);
  require('fs').writeFileSync('search-rendered.html', bodyHTML);
  
  console.log("Found Place ID:", placeId);
  await browser.close();
})();
