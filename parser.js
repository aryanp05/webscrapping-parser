const fs = require('fs');

// Uses command line argument as filepath
if (!process.argv[2]) {
    console.log("Usage: node parser.js <file path>");
    return;
}
const filePath = process.argv[2];

// Reads file (sync since that is the only point of this code)
const fileContent = fs.readFileSync(filePath, 'utf8');

// Regular Expressions to parse
const customerAccount = /Customer no\. - Account no\.\s*(\d+) - (\d+)/;
const billPeriod = /Bill period:\s*Service address:.*?\s+(\w+\s\d{1,2},\s\d{4})\s*to\s*(\w+\s\d{1,2},\s\d{4})/;
const billNumber = /Bill number:\s*(\d+)/;
const billDate = /Bill date:\s*([A-Za-z]+\s\d{1,2},\s\d{4})/;
const totalNewCharges = /Total new charges\s*\$([\d,]+\.\d{2})/;

// Extracts the values 
const customerAccountMatch = fileContent.match(customerAccount);
const billPeriodMatch = fileContent.match(billPeriod);
const billNumberMatch = fileContent.match(billNumber);
const billDateMatch = fileContent.match(billDate);
const totalNewChargesMatch = fileContent.match(totalNewCharges);

// Nicely formats the results of the values
const result = {
    "Customer Number": customerAccountMatch ? customerAccountMatch[1] : 'Not found',
    "Account Number": customerAccountMatch ? customerAccountMatch[2] : 'Not found',
    "Bill Period": billPeriodMatch ? billPeriodMatch[1] : 'Not found',
    "Bill Number": billNumberMatch ? billNumberMatch[1] : 'Not found',
    "Bill Date": billDateMatch ? billDateMatch[1] : 'Not found',
    "Total New Charges": totalNewChargesMatch ? totalNewChargesMatch[1] : 'Not found'
};

// Prints them
console.log(result)