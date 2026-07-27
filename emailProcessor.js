require('dotenv').config();
const imaps = require('imap-simple');
const { simpleParser } = require('mailparser');

// Mongo model
const ExportModel = require('./models/Export');


// -------------------------
// String similarity helper
// -------------------------
function levenshtein(a, b) {
  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}


function findClosestWiki(input, wikis) {
  let bestMatch = null;
  let lowestDistance = Infinity;

  for (const wiki of wikis) {
    const distance = levenshtein(
      input.toLowerCase(),
      wiki.toLowerCase()
    );

    if (distance < lowestDistance) {
      lowestDistance = distance;
      bestMatch = wiki;
    }
  }

  return bestMatch;
}



// -------------------------
// Main email parser
// -------------------------
async function processEmails() {

  // Email not configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || process.env.ENABLE_EMAIL=="false") {
    console.log("Email processing skipped (no credentials configured).");
    return;
  }

  const config = {
    imap: {
      user: process.env.EMAIL_USER,
      password: process.env.EMAIL_PASS,
      host: 'imap.gmail.com',
      port: 993,
      tls: true,
      tlsOptions: {
        rejectUnauthorized: false
      },
      authTimeout: 3000
    }
  };


  const connection = await imaps.connect(config);

  await connection.openBox('INBOX');


  const searchCriteria = [
    'UNSEEN',
    ['OR',
      ['SUBJECT', 'IDEA'],
      ['SUBJECT', 'IDEAS']
    ]
  ];


  const fetchOptions = {
    bodies: ['HEADER', 'TEXT', ''],
    struct: true,
    markSeen: true
  };


  const messages = await connection.search(
    searchCriteria,
    fetchOptions
  );


  // Get all wiki names
  const allWikis = await ExportModel.distinct('wiki');


  for (const item of messages) {

    const raw = item.parts.find(
      p => p.which === ''
    ).body;


    const parsed = await simpleParser(raw);


    const subject = parsed.subject || "";


    /*
        Expected:
        IDEA Strong Cursed Wizard

        Remove first word:
        Strong Cursed Wizard
    */
    const subjectParts = subject.trim().split(/\s+/);


    if (
      subjectParts.length < 2 ||
      !['IDEA', 'IDEAS'].includes(
        subjectParts[0].toUpperCase()
      )
    ) {
      console.log(
        `Skipping email: invalid subject "${subject}"`
      );
      continue;
    }


    const requestedWiki = subjectParts
      .slice(1)
      .join(' ');


    const wiki = findClosestWiki(
      requestedWiki,
      allWikis
    );


    if (!wiki) {
      console.log(
        `No wiki found for "${requestedWiki}"`
      );
      continue;
    }


    const text = parsed.text || "";


    const ideas = text
      .split('|')
      .map(entry => entry.trim())
      .filter(entry => entry.length > 0);



    if (ideas.length === 0) {
      console.log(
        `No ideas found for ${wiki}`
      );
      continue;
    }


    // Find Ideas page for this wiki
    const result = await ExportModel.updateOne(
      {
        title: "Ideas",
        wiki: wiki
      },
      {
        $push: {
          "sections.0.olist1": {
            $each: ideas
          }
        }
      }
    );


    if (result.matchedCount === 0) {

      console.log(
        `Ideas page not found for ${wiki}`
      );

      continue;
    }


    console.log(
      `Added ${ideas.length} ideas to "${wiki}" Ideas page`
    );
  }


  console.log(
    "Email processing complete."
  );


  connection.end();
}


module.exports = {
  processEmails
};