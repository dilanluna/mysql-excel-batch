const dotenv = require('dotenv');
const ExcelJS = require('exceljs');
const mysql = require('mysql2/promise');

dotenv.config();

async function main() {
  const filename = process.argv[2];
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  await connection.beginTransaction();

  const values = [];
  const workbookReader = new ExcelJS.stream.xlsx.WorkbookReader(filename);
  for await (const worksheetReader of workbookReader) {
    for await (const row of worksheetReader) {
      values.push([
        row.getCell(1).value, // id
        row.getCell(2).value, // name
      ]);
    }
  }

  await connection.query('INSERT INTO test(id, name) VALUES ?', [values]);

  await connection.commit();
  await connection.end();
}

main();
