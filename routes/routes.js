// routes/routes.js
const express = require('express');
const path = require('path')
const fs = require('fs')
const multer = require('multer')
const router = express.Router();
const ExportModel = require('../models/Export');
const { default: mongoose } = require('mongoose');
const { askOllama, buildContext } = require('../services/chatbotConnection');

const uploadPath = path.join(__dirname, '../public/images');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    // Append timestamp before the extension
    cb(null, `${baseName}-${timestamp}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only images allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Helper function: Get the current wiki
async function getCurrentWiki() {
  const db = mongoose.connection.db;
  const settings = await db.collection('Settings').findOne({});

  return settings.currentWiki;
}

// ------------------------ Routes ------------------------

//Root
router.get('/', async (req, res) => {
  res.redirect('/wiki%20selector');
});

// Save a web page
router.post('/save', async (req, res) => {
  try {
    const jsonExport = req.body;

    const db = mongoose.connection.db
    const wikiSettings = await db.collection('Settings').findOne({});
    const currentWiki = wikiSettings.currentWiki

    const collection  = db.collection('pages')

    await collection.deleteMany({ title: jsonExport.title, wiki: currentWiki });

    const size = Buffer.byteLength(JSON.stringify(jsonExport), 'utf8');

    const newExport = new ExportModel({
      ...jsonExport,
      wiki: currentWiki,
      size
    })
    
    await newExport.save();
    console.log(`${jsonExport.title} page has been saved to the database!`)

    res.status(201).json({ message: 'Data saved successfully!', data: newExport });

  } catch (err) {
    console.error('Error saving data:', err);

    // Duplicate title error
    if (err.code === 11000) {
      return res.status(400).json({ error: `An entry with title "${req.body.title}" already exists.` });
    }

    res.status(500).json({ error: 'Failed to save data', details: err.message });
  }
});

// Create web page
router.get('/create%20page', async (req, res) => {
  res.sendFile(path.join(__dirname, '../public/html/create.html'));
});

// Get list of all web pages in database
router.get('/titles', async (req, res) => {
  try {
    const db = mongoose.connection.db
    const currentWiki = await getCurrentWiki();

    const pages = await db
      .collection('pages')
      .find({wiki: currentWiki}, { projection: { _id: 0, title: 1, parent: 1 } })
      .toArray();

    res.json(pages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch titles' });
  }
});

// See site's graph structure
router.get('/graph', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/html/graph.html'))
})

// Get list of images in public/images/
router.get('/images', (req, res) => {
  const imagesDir = path.join(__dirname, '../public/images'); // folder with images
  fs.readdir(imagesDir, (err, files) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // Optional: filter only images by extension
    const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif|webp)$/.test(file));
    
    res.json(imageFiles);
  });
});

// Save images to application
router.post('/uploadImage', upload.array('files'), (req, res) => {
  try {
    const filenames = req.files.map(file => file.filename)
    res.json({
      success: true,
      files: filenames
    })
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// Get search results
router.get('/searchQuery', async (req, res) => {
  const q = req.query.q;
  if (!q) return res.json([]); // return empty if no query

  try {
    const currentWiki = await getCurrentWiki();
    const results = await ExportModel.find(
      { $text: { $search: q }, wiki: currentWiki },       // Mongo full-text search
      { score: { $meta: "textScore" }, title: 1, bio: 1 } // return only title + bio
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(20);

    // Send only what the frontend needs
    res.json(
      results.map(r => ({
        id: r._id,
        title: r.title,
        bio: r.bio
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
})

// See site links
router.get('/Links', async (req, res) => {
  res.sendFile(path.join(__dirname, '../public/html/links.html'));
});

// Get all pages from the database
router.get('/pages', async (req, res) => {
  try {
    const currentWiki = await getCurrentWiki();
    const pages = await ExportModel.find({wiki: currentWiki});
    res.json(pages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Show the "Page Sizes" page
router.get('/Page%20Sizes', async (req, res) => {
  res.sendFile(path.join(__dirname, '../public/html/pageSizes.html'));
})

router.get('/getPageSizes', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection('pages');
    const currentWiki = await getCurrentWiki();

    const pages = await collection
      .find({wiki: currentWiki}, {
        projection: {
          title: 1,
          coverImages: 1,
          size: 1,
          _id: 0
        }
      })
      .toArray();

    res.status(200).json(pages);

  } catch (err) {
    console.error('Error fetching pages:', err);
    res.status(500).json({ error: 'Failed to fetch pages', details: err.message });
  }
})

// Route to select which wiki you want to use
router.get('/wiki%20selector', async (req, res) => {
  res.sendFile(path.join(__dirname, '../public/html/selector.html'));
})

// Get list of all wiki names in database
router.get('/wikiNames', async (req, res) => {
  try {
    const db = mongoose.connection.db;

    const wikiNames = await db
      .collection('pages')
      .distinct('wiki');

    res.json(wikiNames);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch wiki names' });
  }
});

// Select current wiki
router.post('/selectWiki', async (req, res) => {
  try {
    const { wikiName } = req.body;

    if (!wikiName) {
      return res.status(400).json({ error: 'No wiki name provided' });
    }

    const db = mongoose.connection.db;

    // Set current wiki
    const result = await db.collection('Settings').updateOne(
      {},
      {
        $set: {
          currentWiki: wikiName
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Settings document not found' });
    }

    // Create home page if making wiki for first time
    const homePage = await db.collection('pages').findOne({
      title: "Home",
      wiki: wikiName
    });

    // If no Home page exists, create it
    if (!homePage) {
      await db.collection('pages').insertOne({
        title: "Home",
        parent: "root",
        bio: `Welcome to ${wikiName} Wiki!`,
        searchText: ``,
        coverImages: {},
        coverInfo: [],
        sections: [],
        size: 0,
        wiki: wikiName
      });
    }

    res.json({
      success: true,
      currentWiki: wikiName
    });

  } catch (err) {
    console.error('Error updating wiki:', err);
    res.status(500).json({ error: 'Failed to update current wiki' });
  }
});

// Wiki Settings
router.get('/wiki%20settings', async (req, res) => {
  res.sendFile(path.join(__dirname, '../public/html/settings.html'));
})

// Get current wiki
router.get('/getCurrentWiki', async (req, res) => {
  try {
    const db = mongoose.connection.db;

    let wikiSettings = await db.collection('Settings').findOne({});

    // Initialize Settings if it doesn't exist
    if (!wikiSettings) {
      wikiSettings = {
        currentWiki: ""
      };

      await db.collection('Settings').insertOne(wikiSettings);
    }

    res.json(wikiSettings.currentWiki);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get current wiki." });
  }
});

// Save wiki settings images
router.post('/saveWikiSettings', async (req, res) => {
  try {
    const { filenames } = req.body;

    if (!filenames || filenames.length < 2) {
      return res.status(400).json({
        error: "Need background image and logo filenames"
      });
    }

    const db = mongoose.connection.db;

    const settings = await db.collection('Settings').findOne({});
    const currentWiki = settings.currentWiki;

    // Get existing wiki settings, and delete
    const currentWikiSettings = await db.collection('WikiSettings').findOne({
      wiki: currentWiki
    });

    // Delete files before replacing them
    if (currentWikiSettings) {
      const backgroundPath = path.join(
        __dirname,
        '../public/images',
        currentWikiSettings["background-image"]
      );

      const logoPath = path.join(
        __dirname,
        '../public/images',
        currentWikiSettings.logo
      );

      // Delete background image if it exists
      if (fs.existsSync(backgroundPath)) {
        fs.unlinkSync(backgroundPath);
      }

      // Delete logo if it exists
      if (fs.existsSync(logoPath)) {
        fs.unlinkSync(logoPath);
      }
    }

    await db.collection('WikiSettings').updateOne(
      { wiki: currentWiki },
      {
        $set: {
          wiki: currentWiki,
          "background-image": filenames[0],
          logo: filenames[1]
        }
      },
      {
        upsert: true
      }
    );

    res.json({
      success: true,
      wiki: currentWiki,
      background: filenames[0],
      logo: filenames[1]
    });

  } catch (err) {
    console.error("Error saving wiki settings:", err);
    res.status(500).json({
      error: "Failed to save wiki settings"
    });
  }
});

// Get current wiki settings images
router.get('/wikiSettings', async (req, res) => {
  try {
    const db = mongoose.connection.db;

    // Get current wiki
    const settings = await db.collection('Settings').findOne({});

    if (!settings) {
      return res.status(404).json({ error: 'Settings not found' });
    }

    const currentWiki = settings.currentWiki;

    // Find wiki settings
    const wikiSettings = await db.collection('WikiSettings').findOne({
      wiki: currentWiki
    });

    if (!wikiSettings) {
      return res.status(404).json({ error: 'Wiki settings not found' });
    }

    res.json({
      backgroundImage: wikiSettings["background-image"],
      logo: wikiSettings.logo
    });

  } catch (err) {
    console.error('Error fetching wiki settings:', err);
    res.status(500).json({
      error: 'Failed to fetch wiki settings'
    });
  }
});

// Delete the current wiki
router.delete('/deleteWiki', async (req, res) => {
  try {
    const db = mongoose.connection.db;

    // Get current wiki
    const settings = await db.collection('Settings').findOne({});

    if (!settings || !settings.currentWiki) {
      return res.status(400).json({ error: "No wiki selected" });
    }

    const currentWiki = settings.currentWiki;

    // -------------------------
    // Find all pages for wiki
    // -------------------------
    const pages = await db.collection('pages')
      .find({ wiki: currentWiki })
      .toArray();


    // -------------------------
    // Collect page images
    // -------------------------
    const pageImages = new Set();

    for (const page of pages) {

      // coverImages object
      if (page.coverImages && typeof page.coverImages === "object") {
        for (const image of Object.values(page.coverImages)) {
          if (image) {
            pageImages.add(image);
          }
        }
      }


      // sections array
      if (Array.isArray(page.sections)) {
        for (const section of page.sections) {

          if (!section || typeof section !== "object") {
            continue;
          }

          for (const key of Object.keys(section)) {

            // Find attributes like image1, image7, imageSomething
            if (key.startsWith("image")) {

              const imageData = section[key];

              // Expected format:
              // [
              //   "caption",
              //   "filename.png"
              // ]
              if (Array.isArray(imageData) && imageData.length > 1) {
                const imageName = imageData[1];

                if (imageName) {
                  pageImages.add(imageName);
                }
              }
            }
          }
        }
      }
    }


    // -------------------------
    // Delete page images
    // -------------------------
    for (const image of pageImages) {
      const imagePath = path.join(
        __dirname,
        '../public/images',
        image
      );

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log(`Deleted image: ${image}`);
      }
    }


    // -------------------------
    // Delete pages
    // -------------------------
    const pagesDeleted = await db.collection('pages').deleteMany({
      wiki: currentWiki
    });


    // -------------------------
    // Delete WikiSettings images
    // -------------------------
    const wikiSettings = await db.collection('WikiSettings').findOne({
      wiki: currentWiki
    });


    if (wikiSettings) {
      const images = [
        wikiSettings["background-image"],
        wikiSettings.logo
      ];

      for (const image of images) {
        if (image) {
          const imagePath = path.join(
            __dirname,
            '../public/images',
            image
          );

          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
            console.log(`Deleted image: ${image}`);
          }
        }
      }
    }


    // Delete wiki settings
    const settingsDeleted = await db.collection('WikiSettings').deleteMany({
      wiki: currentWiki
    });


    // -------------------------
    // Clear current wiki
    // -------------------------
    await db.collection('Settings').updateOne(
      {},
      {
        $set: {
          currentWiki: ""
        }
      }
    );


    res.json({
      success: true,
      message: `Deleted wiki: ${currentWiki}`,
      pagesDeleted: pagesDeleted.deletedCount,
      settingsDeleted: settingsDeleted.deletedCount,
      imagesDeleted: pageImages.size
    });


  } catch (err) {
    console.error("Error deleting wiki:", err);

    res.status(500).json({
      error: "Failed to delete wiki",
      details: err.message
    });
  }
});

router.get('/chatbot', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/html/chatbot.html'));
});


// ------------------------ Placeholder routes ------------------------

// Redirecting to search results
router.get('/search/:title', async (req, res) => {
  res.sendFile(path.join(__dirname, '../public/html/search.html'));
})

// Redirect /edit and /edit/ to /create page
router.get(['/edit', '/edit/'], (req, res) => {
  res.redirect('/create%20page');
});

// Load web page
router.get('/:title', async (req, res) => {
  res.sendFile(path.join(__dirname, '../public/html/page.html'));
});

//Edit web page
router.get('/edit/:title', async (req, res) => {
  res.sendFile(path.join(__dirname, '../public/html/create.html'));
})

// Delete web page: Execution
router.delete('/delete/page/:title', async (req, res) => {
  try {
    const title = decodeURIComponent(req.params.title);
    const currentWiki = await getCurrentWiki();

    // Find the page first
    const page = await ExportModel.findOne({
      title,
      wiki: currentWiki
    });

    if (!page) {
      return res.status(404).send('Page not found');
    }

    // -------------------------
    // Collect page images
    // -------------------------
    const pageImages = new Set();

    // Cover images
    if (page.coverImages && typeof page.coverImages === "object") {
      for (const image of Object.values(page.coverImages)) {
        if (image) {
          pageImages.add(image);
        }
      }
    }

    // Images inside sections
    if (Array.isArray(page.sections)) {
      for (const section of page.sections) {

        if (!section || typeof section !== "object") {
          continue;
        }

        for (const key of Object.keys(section)) {

          // image1, image2, imageWhatever...
          if (key.startsWith("image")) {

            const imageData = section[key];

            // Expected format:
            // [
            //   "caption",
            //   "filename.png"
            // ]
            if (Array.isArray(imageData) && imageData.length > 1) {
              const imageName = imageData[1];

              if (imageName) {
                pageImages.add(imageName);
              }
            }
          }
        }
      }
    }

    // -------------------------
    // Delete image files
    // -------------------------
    for (const image of pageImages) {
      const imagePath = path.join(
        __dirname,
        '../public/images',
        image
      );

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log(`Deleted image: ${image}`);
      }
    }

    // -------------------------
    // Delete page
    // -------------------------
    await ExportModel.deleteOne({
      _id: page._id
    });

    res.status(200).json({
      success: true,
      message: 'Page deleted successfully',
      imagesDeleted: pageImages.size
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Delete web page: Confirmation
router.get('/delete/:title', async (req, res) => {
  res.sendFile(path.join(__dirname, '../public/html/delete.html'));
})

// Delete files from storage
router.delete('/deleteImage', async (req, res) => {
  try {
    const { fileName } = req.body;

    if (!fileName) {
      return res.status(400).send('No filename provided');
    }

    const filePath = path.join(__dirname, '../public/images', fileName);

    fs.unlink(filePath, (err) => {
      if (err) {
        return res.status(500).send('Error deleting file');
      }
      res.send('File deleted');
      console.log(`${fileName} has been deleted!`)
    });

  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Fetch a web page from database 
router.get('/contents/:title', async (req, res) => {
  try {
    const currentWiki = await getCurrentWiki();
    const page = await ExportModel.findOne({title: req.params.title, wiki: currentWiki})
    if (!page) return res.status(404).json({error: 'Page not found'})
    res.json(page)
  } catch (error){
    res.status(500).json({error: 'Server error', details:  error.message})
  }
})

// Chat with wiki AI
router.post('/chat', async (req, res) => {
    try {
        const { question } = req.body;

        if (!question) {
            return res.status(400).json({
                error: "No question provided"
            });
        }

        const currentWiki = await getCurrentWiki();

        const pages = await ExportModel.find(
            {
                $text: {
                    $search: question
                },
                wiki: currentWiki
            },
            {
                title: 1,
                bio: 1,
                searchText: 1,
                score: {
                    $meta: "textScore"
                }
            }
        )
        .sort({
            score: {
                $meta: "textScore"
            }
        })
        .limit(5);


        const context = buildContext(pages);

        const answer = await askOllama(
            question,
            context
        );

        res.json({
            answer,
            sources: pages.map(page => page.title)
        });

    } catch (err) {
        console.error("Chat error:", err);

        res.status(500).json({
            error: "Failed to process chat request",
            details: err.message
        });
    }
});


// ------------------------ Export router

module.exports = router;