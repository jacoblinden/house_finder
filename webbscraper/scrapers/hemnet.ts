import { sleep } from 'bun';
import puppeteer, { ElementHandle, Page } from 'puppeteer';
import { appendFile } from "node:fs/promises";

let page: Page; 
(async () => {
    const {browser} = await init();
    let links: string[] = []; 
    let data: string = "";
    try{
    // Read the contents of the current directory
        await Bun.write("./../ai/data/raw/output.json", "");
        await page!.goto(`https://www.hemnet.se/bostader?location_ids%5B%5D=18031=&page=${1}`);
        await acceptCookie(page!);
        links = await fetchLinksDataOnAllPages(page!);
        await Bun.write("links.json", links);
        data += await allHouseData(links);
    }   
    finally{
        await browser.close();
    }
})();


async function acceptCookie(page: Page) {
    await sleep(4000);
    const button = (await page.evaluateHandle(`document.querySelector("#usercentrics-root").shadowRoot.querySelector("#uc-center-container > div.sc-eBMEME.bWvhWN > div > div.sc-jsJBEP.iXSECa > div > button.sc-dcJsrY.kIAuBW")`)).asElement();
    await button?.click();
}

async  function init(){
    const browser = await puppeteer.launch({ headless: false});
    page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1024 });
    page!.setDefaultTimeout(4000);
    return {page, browser};
}

async function fetchLinksDataOnAllPages(page: Page) {
    console.log("fetchLinksDataOnAllPages");
    let isHousesOnPage = true;
    let i = 1;
    const data: string[] = [];
    
    while(isHousesOnPage){
        let url = `https://www.hemnet.se/bostader?location_ids%5B%5D=18031&page=${i++}`;
        console.log("links on page " + i + " is being fetched");
        await Promise.all([
             page.goto(url),
             page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 })
        ]);

        const links = await fetchLinksOnPage(page);

        if(links.length === 0){
            isHousesOnPage = false;
        }
        else{
            data.push(...links);
        }
    }
    return data;
}

async function fetchLinksOnPage(page: Page) {
    try{
        await page.waitForXPath('//*[@data-testid="result-list"]//a[starts-with(@href, "/bostad/")]');
        const links = await page.$x('//*[@data-testid="result-list"]//a[starts-with(@href, "/bostad/")]');  
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
    const result = [];
    let flushIndex = 0;
    let flushAt = 10;
    for (const link of links) {
        result.push(await houseData(link));
        if (flushIndex++ > flushAt) {
            await Bun.write("./../ai/data/raw/output.json", JSON.stringify(result, null, 2));
            flushIndex = 0;
        }
    }
        await Bun.write("./../ai/data/raw/output.json", JSON.stringify(result, null, 2));
}




function createSelectors(){
    const values = ["Bostadstyp","Upplåtelseform","Antal rum","Boarea","Balkong","Våning","Byggår","Förening","Energiklass","Avgift","Driftkostnad","Pris/m²","Antal besök"]
    
    const priseX = '//*[@id="huvudinnehall"]/div[3]/div[2]/div[2]/section[2]/div/div[1]/div/div[2]/span';
    const selectors = values.map((value) =>{
        return  {selector: `//*[text()="${value}"]/following-sibling::dd`, label: value} 
    });
    const expandButton = '//*[text()="Visa hela beskrivningen"]'
    const description = '//*[@id="huvudinnehall"]/div[3]/div[2]/div[2]/section[2]/div/div[3]/div[2]/div[1]/div[1]/p/span';


    const brfValues = ["Antal lägenheter","Registreringsår","Status",]
    const brfSelectors = brfValues.map((value) =>{
        return  {selector: `(//*[text()="${value}"]/parent::div/following-sibling::div)[1]`, label: value};
    });
    const ratingSelector = '//*[contains(@class, "active") and contains(@class, "Rating")]';

    return {priseX, selectors, expandButton, description,brfSelectors, ratingSelector};
}


async function  brfData(brfSelectors :any, ratingSelector: any, link: any){
    let brf:any= {};
    try{
        await page.waitForXPath(ratingSelector);
        try{
            const rating = await page.$x(ratingSelector);
            const ratingValue = await (await rating[0].getProperty('textContent')).jsonValue();
            brf.brf.score = ratingValue;
         }catch(e){
          
             console.log("Failed to find brf rating on link " + link);
             console.log(e);
             return brf;
         }
        for (const v of brfSelectors) {
        try{
             await page.waitForXPath(v.selector);
             const element = await page.$x(v.selector);
             const value = await (await element[0].getProperty('textContent')).jsonValue() as string; 
             brf.brf[v.label] = value;
         }catch(e){
             console.log("Failed to find brf info " + v.label + " on link " + link);
             console.log(e);
             return brf;
         }
         }
         return brf;
     } catch(e){
         console.log("Failed to find brf information on link " + link);
         console.log(e);
         return brf;
     }
     return brf;
}


async function generalInformation(priseX: any, selectors: any, expandButton: any, description: any, link: any){
    let information:any = {}
    try{    
        try{

            const h1Element = await page.$('h1');
            const h1Value = await (await h1Element!.getProperty('textContent')).jsonValue();
            information.adress = h1Value;
        }catch(e){
            console.log("Failed to find adress on link " + link);
            console.log(e);
        }
        
        try{
            await page.waitForXPath(priseX);
            const prise = await page.$x(priseX);
            const priseValue = await (await prise[0].getProperty('textContent')).jsonValue();
            information.pris = priseValue;

        }catch(e){
            console.log("Failed to find prise on link " + link);
            console.log(e);
        }

        
        for (const v of selectors) {
            try{
            await page.waitForXPath(v.selector);
            const element = await page.$x(v.selector);
            const value = await (await element[0].getProperty('textContent')).jsonValue();
            information[v.label] = value;
            }catch(e){
                console.log("Failed to find " + v.label + " on link " + link);
                console.log(e);
            }
        }   
        try{
            await page.waitForXPath(expandButton);
            const button = await page.$x(expandButton);
            await button[0].click();
            await page.waitForXPath(description);
            const desc = await page.$x(description);
            information.description = await (await desc[0].getProperty('textContent')).jsonValue();
        }catch(e){
            console.log("Failed to find description on link " + link);
            console.log(e);
        }
       
        information.länk = link;   
        return information
    }catch(e){
        console.log("Failed to find general information on link " + link);
        console.log(e);
        return information;
    }
}



async function houseData(link: any) {
    let data ={}
    try{
    const {priseX,selectors,expandButton,description,brfSelectors,ratingSelector } = createSelectors();
    await Promise.all([
        page.goto(link),
        page.waitForNavigation({ waitUntil: 'networkidle0',timeout: 10000})
   ]);
        const information = await generalInformation(priseX, selectors, expandButton, description, link)
        const brf = await brfData(brfSelectors, ratingSelector, link);
        data = ({information, ...brf});
    }catch(e){
    console.log(e);
    }
    return data
}

