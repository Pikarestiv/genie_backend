const ExportToCsv = require('export-to-csv').ExportToCsv;
const db = require('../models'); 
const GrantService = require('../services/Grant');

main();

async function main () {
  const data = await GrantService.getAll({ withTags: true });

  const options = { 
    fieldSeparator: ',',
    quoteStrings: '"',
    decimalSeparator: '.',
    showLabels: true, 
    showTitle: true,
    title: 'Grants Data',
    useTextFile: false,
    useBom: true,
    useKeysAsHeaders: true,
  };
   
  const csvExporter = new ExportToCsv(options);
  const fs = require('fs')
  const csvData = csvExporter.generateCsv(data, true)
  fs.writeFileSync('data.csv',csvData)
}