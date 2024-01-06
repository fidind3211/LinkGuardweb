import axios from 'axios';
import cheerio from 'cheerio';
import fs from 'fs';

export default async () => {
    return JSON.parse(fs.readFileSync('./db/leakers.json', 'utf-8'));

    let users = {};

    try {
        const response = await axios.get('https://docs.google.com/spreadsheets/d/1t3Prko-nEoxpBnNotYUS3fsYeZli-ASr9mXwXYRj96U/edit#gid=0');
        const $ = cheerio.load(response.data);
        
        $('table tbody tr:gt(0)').each((index, row) => {
            const columns = $(row).find('td');
            if (index === 0 || columns.eq(0).text().includes('Quotes') || columns.eq(0).text().trim() === '') return;
            
            users[columns.eq(0).text().trim().match(/<@(.*?)>/)[1]] = {
                mention: columns.eq(0).text().trim(),
                username: columns.eq(1).text().trim(),
                reason: columns.eq(2).text().trim(),
                added: columns.eq(3).text().trim(),
                proof: columns.eq(4).text().trim(),
            };
        });
        
        fs.writeFileSync('./db/leakers.json', JSON.stringify(users, null, 4));

        return users;
    } catch (error) {
        console.error('Error', error);
        return [];
    };
};