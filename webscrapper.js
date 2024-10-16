const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function scrapeInvoice() {
    const browser = await puppeteer.launch({
        headless: false,
        slowMo: 75,
        defaultViewport: null,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    
    const page = await browser.newPage();

    try {
        // Set up download folder path
        const downloadPath = path.resolve(__dirname, 'downloads');
        if (!fs.existsSync(downloadPath)) {
            fs.mkdirSync(downloadPath);
        }

        // Configure Puppeteer to allow downloads in the defined folder
        const client = await page.target().createCDPSession();
        await client.send('Page.setDownloadBehavior', {
            behavior: 'allow',
            downloadPath: downloadPath,
        });

        // Navigate to the login page
        await page.goto('https://app-dev.condoworks.co');

        // Fill in login credentials
        await page.type('#Email', 'coop.test@condoworks.co');
        await page.type('#Password', 'TheTest139');
        await page.click('#btnSubmit');

        // Wait for page navigation to invoices
        await page.goto('https://app-dev.condoworks.co/invoices/all');

        // Search for the invoice number
        await page.type('input[name="invoices.InvoiceNumber"]', '123');
        await page.waitForSelector('td[role="gridcell"] a[title="View/Edit"]');
        await page.click('td[role="gridcell"] a[title="View/Edit"]');

        // Wait for and click on the Download link
        await page.waitForSelector('a[title="Download file"]', { visible: true });
        await page.evaluate(() => {
            console.log("Attempting to click download link");
            document.querySelector('a[title="Download file"]').click();
        });

        console.log("Download triggered!");

        // Wait for download to complete (poll for new file in the directory)
        const waitForFile = async (directory) => {
            while (true) {
                const files = fs.readdirSync(directory);
                if (files.length > 0) {
                    return path.join(directory, files[0]); // Return the first file found
                }
                await new Promise((resolve) => setTimeout(resolve, 500)); // Wait for a bit before checking again
            }
        };

        const downloadedFilePath = await waitForFile(downloadPath);
        console.log(`Invoice downloaded successfully: ${downloadedFilePath}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await browser.close();
    }
}

scrapeInvoice();
