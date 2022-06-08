const fs = require('fs/promises');

// Read text from a file and convert it to a tsv


const DE_NOTE = /(\{.+?\}|\[.+?\]|\(.+?\))/g;

function parseLine(line)
{
    const arr = [];

    const [deBlock, enBlock] = line
        .split('::');
    
    if(!deBlock || !enBlock)
    {
        console.warn(`Undefined!!!: ${line}`);
        return [];
    }
    
    const deWords = deBlock.split('|');
    const enWords = enBlock.split('|');

    if (deWords.length !== enWords.length)
    {
        console.warn(`Different number of words in line: ${line}`);
    }

    // Make pairs
    const pairs = [];
    for (let i = 0; i < deWords.length; i++)
    {
        pairs.push({
            de: deWords[i],
            en: enWords[i],
        });
    }

    for(let pair of pairs)
    {
        const deWords = pair.de.split(';');
        for(let deWord of deWords)
        {
            const notes = [...deWord.matchAll(DE_NOTE)];
            // console.log(notes);
            const notesEn = notes.map(n => n[0]).join(' ');
            arr.push(`${deWord.replace(DE_NOTE, '').trim()}\t${notesEn} ${pair.en.trim()}`);
        }
    }
    
    return arr;
}

async function main()
{
    const originalText = await fs.readFile('de-en.txt', { encoding: 'utf8' });
    const lines = originalText.split('\n')
    // Remove comments
    lines.splice(0, 5);

    const tsvLines = [];
    for (const line of lines)
    {
        tsvLines.push(...parseLine(line));
    }

    await fs.writeFile('de-en.tsv', tsvLines.join('\n'));
    console.log('Done!');
}

function test(input)
{
    console.log(parseLine(input));
}

// test('Einpassen mit Gummibandfunktion :: rubber banding');
// test('Einpauker {m} [ugs.] [school] | Einpauker {pl} :: crammer [Br.] (person) | crammers');
// test('Einrichtung {f}; Institution {f}; Anstalt {f}; Haus {n} [adm.] | Einrichtungen {pl}; Institutionen {pl}; Anstalten {pl}; Häuser {pl} | Anstalt des öffentlichen Rechts | Bildungseinrichtung {f}; Bildungsstätte {f}; Bildungsinstitution {f} [school] | Forschungeinrichtung {f} :: establishment; institution | establishments; institutions | public agency | educational institution; education institution; educational establishment | research establishment');
// test('Abtrünnige {m,f}; Abtrünniger | Abtrünnigen {pl}; Abtrünnige :: renegade | renegades');

main();
