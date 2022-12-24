// import puppeteer from 'puppeteer';
const fs = require('fs');
const puppeteer = require('puppeteer');

(async () => {
    // Launch the browser
    const browser = await puppeteer.launch();

    // Create a page
    const page = await browser.newPage();

    // Go to your site
    await page.goto('https://www.jimmyklein.fr/calendrier-de-l-avent-2022');

    const courses =
        await page.evaluate(
            () => Array.from
                (
                    document.querySelectorAll("li.border-solid"),
                    (e) => ({
                        number: e.querySelector('div.text-white').textContent,
                        title: e.querySelector('a').textContent,
                        link: e.querySelector('a').href
                    })
                )
        );

    // Save data to JSON file
    fs.writeFile('courses.json', JSON.stringify(courses), (err) => {
        if (err) throw err;
        console.log('File saved');
    });

    const pagePromise = (link) => new Promise(async (resolve, reject) => {
        let dataCourse = {};
        let newPage = await browser.newPage();
        await newPage.goto(link);

        dataCourse['courseTitle'] = await newPage.$eval('.text-3xl', text => text.textContent);

        dataCourse['courseContent'] = await newPage.$eval('p.text-gray-700 + div', text => text.textContent);

        resolve(dataCourse);
        await newPage.close();
    });


    for (const course of courses) {
        let currentPageData = await pagePromise(course.link);
        // scrapedData.push(currentPageData);
        // console.log(currentPageData);
        fs.writeFile(`${course.number} - ${currentPageData.courseTitle}.txt`, currentPageData.courseContent, (err) => {
            if (err) throw err;
            console.log(`File ${course.number} saved`);
        });
    }

    await browser.close();
})();