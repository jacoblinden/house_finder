
import puppeteer, { Page } from 'puppeteer';
let page: Page; 
(async () => {
    const {browser} = await init();
    let links: string[] = []; 
    let data: string = "";
    try{
        await page!.goto(`https://www.hemnet.se/bostader?location_ids%5B%5D=18031=&page=${1}`);
        //await acceptCookie(page!);
        links = await fetchLinksDataOnAllPages(page!); 
        data += await allHouseData(links);  
    }   
    finally{
        await browser.close();
    }
})();

async  function init(){
    const browser = await puppeteer.launch({ headless: false});
    page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1024 });
    page!.setDefaultTimeout(4000);
    return {page, browser};
}

async function fetchLinksDataOnAllPages(page: Page) {
    console.log("fetchLinksDataOnAllPages");
    const linksArea =  [];
        let urls = [`https://polisen.se/om-polisen/medborgarloften-och-lokal-samverkan/?lpfm.loc=Stockholms%20l%C3%A4n`,'https://polisen.se/om-polisen/medborgarloften-och-lokal-samverkan/?lpfm.loc=Stockholm','https://polisen.se/om-polisen/medborgarloften-och-lokal-samverkan/?lpfm.loc=Solna'];
        for (const url of urls) {
            await page.goto(url, { waitUntil: 'networkidle0' });   
            const links = await fetchLinksOnPage(page);
            linksArea.push(...links);

        }

    return linksArea;
}

async function fetchLinksOnPage(page: Page) {
    try{
        await page.waitForXPath('(//form)[17]//a');
        const links = await page.$x('(//form)[17]//a');  
        const data: string[] = [];
        for (let link of links) {
            let href = await (await link.getProperty('href')).jsonValue();
            data.push(href);
        }
        return data;
    }catch(e){
        return [];
    }
}    

async function allHouseData(links: string[]) {
    console.log("allHouseData");
    let result = ""; 
    let id = 0;
    for (const link of links) {
        result = "";
        await page.goto(link, { waitUntil: 'networkidle0' });
        await page.waitForXPath('//*[@id="main-content"]/div');

        const textDiv = await page.$x('//*[@id="main-content"]/div//text()');
        
        for (const child of textDiv) {
            const text = await  (await child.getProperty('textContent')).jsonValue(); 
            if(text != null  &&text !=""){
                result += text;
            }
           
        }
            await Bun.write("./../ai/data/raw/"+id++ +'.json', result);
    }  

    return result;
}
