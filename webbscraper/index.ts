import puppeteer, { ElementHandle, Page } from 'puppeteer';

(async () => {
    // Launch the browser and open a new blank page
    const {page, browser} = await init();
    let data: string[] = []; 
    try {
        for (let i = 1; i < 3; i++) {
            const houses = await allHousesOnPage(page,i);
            data = await fetchHouseData(houses,data);
            await Bun.write("output.json", data);
        }
    } finally {
        await browser.close();
    }
})();

async  function init(){
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1024 });
    return {page, browser};
}

async function fetchHouseData(houses:ElementHandle[], data: string[]){
    try {
        for (let house of houses) {
            const links = await house.$$('a');
            for (let link of links) {
                let href = await (await link.getProperty('href')).jsonValue();
                data.push(await goAndScrape(href));
            }
        }
    } catch (e) {
        console.error(e);
    }
    return data;
}

async function allHousesOnPage(page:Page, index: number) {
    await page.goto(`https://www.booli.se/sok/till-salu?areaIds=1&isNewConstruction=0&objectType=L%C3%A4genhet&page=${index}`)
    return await page.$$(".object-card.gap-y-0.object-card--horizontal");
}




async function goAndScrape(link: string) {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.goto(link);
    await page.setViewport({ width: 1080, height: 1024 });
    const info = await page.$x('//*[@class="DfWRI _1Pdm1 _2zXIc sVQc-"]//div');
    const title = await page.$('h1');
    const titleText = await page.evaluate((element) => element.textContent, title);
    let houseData = `"name":"${titleText}",\n "link":"${link}",\n`;
    try {
        for (let i = 0; i < info.length - 1; i += 2) {
            try {
                const firstChildText = await info[i].evaluate(el => el.textContent);
                const secondChildText = await info[i + 1].evaluate(el => el.textContent);
                if (firstChildText === "Driftskostnad") break;
                houseData = houseData + `"${firstChildText}":"${secondChildText}",\n`
            } catch (e) {
                continue;
            }
        }
    } finally {
        await browser.close();
        return `{${houseData} },`
    }
}

