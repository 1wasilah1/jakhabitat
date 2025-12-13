import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/jakhabitat', express.static(path.join(__dirname, '../public')));
app.use('/api/files', express.static(path.join(__dirname, 'data')));

// Ensure media directories exist
const mediaTypes = ['panorama360', 'object360', 'icon', 'video'];
mediaTypes.forEach(type => {
  const dir = path.join(__dirname, '../public/media', type);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Get type from form data, default to panorama360
    const type = req.body.type || 'panorama360';
    const uploadPath = path.join(__dirname, '../public/media', type);
    
    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const type = req.body.type || 'panorama360';
    const customName = req.body.name;
    
    if (customName) {
      const cleanName = customName.replace(/[^a-zA-Z0-9\-_]/g, '-').toLowerCase();
      cb(null, `${cleanName}${ext}`);
    } else if (type === 'panorama360') {
      const { layerName, unitName, typeName, roomType } = req.body;
      const cleanLayer = (layerName || 'layer').replace(/\s+/g, '-').toLowerCase();
      const cleanUnit = (unitName || 'unit').replace(/\s+/g, '-').toLowerCase();
      const cleanType = (typeName || 'type').replace(/\s+/g, '-').toLowerCase();
      const cleanRoom = (roomType || 'room').replace(/\s+/g, '-').toLowerCase();
      cb(null, `${cleanLayer}_${cleanUnit}_${cleanType}_${cleanRoom}_${timestamp}${ext}`);
    } else {
      cb(null, `${type}_${timestamp}${ext}`);
    }
  }
});

const upload = multer({ storage });

// File upload endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const type = req.body.type || 'panorama360';
    console.log('Upload type:', type, 'File:', req.file.filename);
    
    const fileUrl = `/jakhabitat/media/${type}/${req.file.filename}`;
    
    res.json({
      success: true,
      url: fileUrl,
      filename: req.file.filename,
      size: req.file.size,
      type: type
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Data endpoints - move to backend
const dataPath = path.join(__dirname, 'data');

// Ensure data directory exists
if (!fs.existsSync(dataPath)) {
  fs.mkdirSync(dataPath, { recursive: true });
}

// Get data
app.get('/api/data/:type', (req, res) => {
  try {
    const { type } = req.params;
    const filePath = path.join(dataPath, `${type}.json`);
    
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      res.json(data);
    } else {
      res.json({ [type]: [] });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save data with auto-increment ID
app.post('/api/data/:type', (req, res) => {
  try {
    const { type } = req.params;
    const filePath = path.join(dataPath, `${type}.json`);
    
    // Auto-increment IDs for new items
    if (req.body[type] && Array.isArray(req.body[type])) {
      req.body[type].forEach(item => {
        if (!item.id || item.id === 0) {
          const existingIds = req.body[type].map(i => i.id || 0);
          item.id = Math.max(...existingIds, 0) + 1;
        }
      });
    }
    
    fs.writeFileSync(filePath, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// Create Marzipano tiles from panorama image
async function createMarzipanoTiles(imagePath, outputDir, sceneId) {
  try {
    const image = sharp(imagePath);
    const metadata = await image.metadata();
    
    // Create tiles directory for this scene
    const tilesDir = path.join(outputDir, 'tiles', sceneId);
    if (!fs.existsSync(tilesDir)) {
      fs.mkdirSync(tilesDir, { recursive: true });
    }

    // Generate multiple resolution levels
    const levels = [
      { size: 256, tileSize: 256 },
      { size: 512, tileSize: 512 },
      { size: 1024, tileSize: 512 },
      { size: 2048, tileSize: 512 },
      { size: 4096, tileSize: 512 }
    ];

    for (let level = 0; level < levels.length; level++) {
      const { size, tileSize } = levels[level];
      const levelDir = path.join(tilesDir, level.toString());
      
      if (!fs.existsSync(levelDir)) {
        fs.mkdirSync(levelDir, { recursive: true });
      }

      // Resize image to level size
      const resizedImage = await image.resize(size * 2, size).jpeg({ quality: 85 });
      
      // Create tiles for this level
      const tilesX = Math.ceil((size * 2) / tileSize);
      const tilesY = Math.ceil(size / tileSize);
      
      for (let face = 0; face < 6; face++) {
        const faceDir = path.join(levelDir, face.toString());
        if (!fs.existsSync(faceDir)) {
          fs.mkdirSync(faceDir, { recursive: true });
        }
        
        for (let y = 0; y < tilesY; y++) {
          const yDir = path.join(faceDir, y.toString());
          if (!fs.existsSync(yDir)) {
            fs.mkdirSync(yDir, { recursive: true });
          }
          
          for (let x = 0; x < tilesX; x++) {
            const tilePath = path.join(yDir, `${x}.jpg`);
            
            // Extract tile from resized image
            await resizedImage
              .clone()
              .extract({
                left: Math.min(x * tileSize, size * 2 - tileSize),
                top: Math.min(y * tileSize, size - tileSize),
                width: Math.min(tileSize, size * 2 - x * tileSize),
                height: Math.min(tileSize, size - y * tileSize)
              })
              .jpeg({ quality: 85 })
              .toFile(tilePath);
          }
        }
      }
    }

    // Create preview image
    await image
      .resize(512, 256)
      .jpeg({ quality: 80 })
      .toFile(path.join(outputDir, 'preview.jpg'));

    // Clean up original file
    fs.unlinkSync(imagePath);
    
    console.log(`Tiles created for scene ${sceneId}`);
  } catch (error) {
    console.error('Error creating tiles:', error);
    throw error;
  }
}







// Layer1 hotspots management
app.get('/api/hotspots/layer1', (req, res) => {
  try {
    const filePath = path.join(dataPath, 'layer1-hotspots.json');
    
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      res.json(data);
    } else {
      // Return default hotspots if file doesn't exist
      const defaultHotspots = {
        hotspots: [
          { id: '1', x: '50.6%', y: '56.4%', label: 'Cap & Cip', timeStart: 0, timeEnd: 10 },
          { id: '2', x: '52.5%', y: '47.9%', label: 'KTV', timeStart: 13, timeEnd: 18 },
          { id: '3', x: '68.2%', y: '48.3%', label: 'HTM', timeStart: 19, timeEnd: 33 },
          { id: '4', x: '75.7%', y: '65.3%', label: 'Cap & Cip', timeStart: 44, timeEnd: 54 }
        ]
      };
      res.json(defaultHotspots);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/hotspots/layer1', (req, res) => {
  try {
    const filePath = path.join(dataPath, 'layer1-hotspots.json');
    fs.writeFileSync(filePath, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Layer2 links management
app.get('/api/layer2/links', (req, res) => {
  try {
    const filePath = path.join(dataPath, 'layer2-links.json');
    
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      res.json(data);
    } else {
      res.json({ links: [] });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/layer2/links', (req, res) => {
  try {
    const filePath = path.join(dataPath, 'layer2-links.json');
    fs.writeFileSync(filePath, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Layer3 hotspots management
app.get('/api/hotspots/layer3', (req, res) => {
  try {
    const filePath = path.join(dataPath, 'layer3-hotspots.json');
    
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      res.json(data);
    } else {
      res.json({ hotspots: [] });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/hotspots/layer3', (req, res) => {
  try {
    const filePath = path.join(dataPath, 'layer3-hotspots.json');
    fs.writeFileSync(filePath, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add scene to existing panorama project
app.post('/api/panorama/:projectId/add-scene', upload.single('image'), async (req, res) => {
  try {
    const { projectId } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const projectPath = path.join(__dirname, '../public/panorama', projectId);
    const appFilesPath = path.join(projectPath, 'app-files');
    const dataPath = path.join(appFilesPath, 'data.js');
    
    if (!fs.existsSync(dataPath)) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Read existing data
    const content = fs.readFileSync(dataPath, 'utf8');
    const match = content.match(/var APP_DATA = ({[\s\S]*?});/);
    if (!match) {
      return res.status(400).json({ error: 'Invalid project format' });
    }

    const appData = JSON.parse(match[1]);
    const sceneIndex = appData.scenes.length;
    const sceneId = `${sceneIndex}-scene-${sceneIndex + 1}`;
    
    // Compress and save image
    const imagePath = path.join(appFilesPath, `scene-${sceneIndex}.jpg`);
    await sharp(req.file.path)
      .resize(4096, 2048, { fit: 'cover' })
      .jpeg({ quality: 85 })
      .toFile(imagePath);
    fs.unlinkSync(req.file.path);
    
    // Add new scene
    const newScene = {
      id: sceneId,
      name: `Scene ${sceneIndex + 1}`,
      levels: [
        {"tileSize": 256, "size": 256, "fallbackOnly": true},
        {"tileSize": 512, "size": 512},
        {"tileSize": 512, "size": 1024},
        {"tileSize": 512, "size": 2048}
      ],
      faceSize: 2048,
      initialViewParameters: {
        pitch: 0,
        yaw: 0,
        fov: 1.5707963267948966
      },
      linkHotspots: [],
      infoHotspots: []
    };
    
    appData.scenes.push(newScene);
    
    // Update data.js
    const newContent = content.replace(
      /var APP_DATA = {[\s\S]*?};/,
      `var APP_DATA = ${JSON.stringify(appData, null, 2)};`
    );
    
    fs.writeFileSync(dataPath, newContent);
    
    res.json({ success: true, sceneId: sceneId, message: 'Scene added successfully' });
  } catch (error) {
    console.error('Failed to add scene:', error);
    res.status(500).json({ error: 'Failed to add scene' });
  }
});

// Create new Marzipano project
app.post('/api/marzipano/create-project', upload.array('images', 10), async (req, res) => {
  try {
    console.log('Received files:', req.files?.length || 0);
    console.log('Project name:', req.body.projectName);
    
    if (!req.files || req.files.length === 0) {
      console.error('No files received');
      return res.status(400).json({ error: 'No images uploaded' });
    }

    const projectName = req.body.projectName || 'new-project';
    const projectId = projectName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now();
    
    // Create project directory in panorama folder
    const panoramaDir = path.join(__dirname, '../public/panorama');
    const projectPath = path.join(panoramaDir, projectId);
    const appFilesPath = path.join(projectPath, 'app-files');
    
    console.log('Creating directories:');
    console.log('- Panorama dir:', panoramaDir);
    console.log('- Project path:', projectPath);
    console.log('- App files path:', appFilesPath);
    
    // Ensure panorama directory exists
    if (!fs.existsSync(panoramaDir)) {
      fs.mkdirSync(panoramaDir, { recursive: true });
      console.log('Created panorama directory');
    }
    
    // Create project directories
    fs.mkdirSync(projectPath, { recursive: true });
    fs.mkdirSync(appFilesPath, { recursive: true });
    console.log('Created project directories');

    // Process multiple images and create scenes
    const scenes = [];
    console.log('Processing', req.files.length, 'files');
    
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const sceneId = `${i}-scene-${i + 1}`;
      const sceneName = `Scene ${i + 1}`;
      
      console.log(`Processing file ${i + 1}:`, file.originalname, 'Size:', file.size);
      
      // Copy the image to app-files directory
      const imagePath = path.join(appFilesPath, `scene-${i}.jpg`);
      
      try {
        // Compress and save image
        await sharp(file.path)
          .resize(4096, 2048, { fit: 'cover' })
          .jpeg({ quality: 85 })
          .toFile(imagePath);
        fs.unlinkSync(file.path); // Clean up temp file
        console.log(`Compressed and saved file to:`, imagePath);
        
        // Verify file was copied
        if (fs.existsSync(imagePath)) {
          const stats = fs.statSync(imagePath);
          console.log(`File verified, size: ${stats.size} bytes`);
        } else {
          throw new Error('File copy failed');
        }
      } catch (error) {
        console.error(`Error copying file ${i}:`, error);
        throw error;
      }
      
      scenes.push({
        id: sceneId,
        name: sceneName,
        levels: [
          {"tileSize": 256, "size": 256, "fallbackOnly": true},
          {"tileSize": 512, "size": 512},
          {"tileSize": 512, "size": 1024},
          {"tileSize": 512, "size": 2048}
        ],
        faceSize: 2048,
        initialViewParameters: {
          pitch: 0,
          yaw: 0,
          fov: 1.5707963267948966
        },
        linkHotspots: [],
        infoHotspots: []
      });
    }
    
    console.log('Created', scenes.length, 'scenes');

    // Create Marzipano structure with multiple scenes
    const dataJs = `var APP_DATA = {
  "scenes": ${JSON.stringify(scenes, null, 2)},
  "name": "${projectName}",
  "settings": {
    "mouseViewMode": "drag",
    "autorotateEnabled": false,
    "fullscreenButton": true,
    "viewControlButtons": true
  }
};`;

    // Create basic HTML
    const indexHtml = `<!DOCTYPE html>
<html>
<head>
  <title>${projectName}</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.jsdelivr.net/npm/marzipano@0.10.2/build/marzipano.js"></script>
  <style>
    body { margin: 0; font-family: Arial, sans-serif; }
    #pano { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
  </style>
</head>
<body>
  <div id="pano"></div>
  <script src="data.js"></script>
  <script>
    var viewer = new Marzipano.Viewer(document.getElementById('pano'));
    var source = Marzipano.ImageUrlSource.fromString('scene-0.jpg');
    var geometry = new Marzipano.EquirectGeometry(APP_DATA.scenes[0].levels);
    var view = new Marzipano.RectilinearView(APP_DATA.scenes[0].initialViewParameters);
    var scene = viewer.createScene({ source: source, geometry: geometry, view: view });
    scene.switchTo();
  </script>
</body>
</html>`;

    try {
      fs.writeFileSync(path.join(appFilesPath, 'data.js'), dataJs);
      fs.writeFileSync(path.join(appFilesPath, 'index.html'), indexHtml);
      console.log('Written data.js and index.html');
      
      // Verify project structure
      const files = fs.readdirSync(appFilesPath);
      console.log('Files in app-files:', files);
      
      console.log('Project created successfully:', projectId);
      res.json({ success: true, projectId: projectId, message: 'Project created successfully' });
    } catch (writeError) {
      console.error('Error writing project files:', writeError);
      throw writeError;
    }
  } catch (error) {
    console.error('Failed to create project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Create dedicated panorama hotspot handler
function savePanoramaHotspot(projectId, hotspot, sceneId) {
  const dataPath = path.join(__dirname, `../public/panorama/${projectId}/app-files/data.js`);
  
  if (!fs.existsSync(dataPath)) {
    throw new Error('Project data.js not found');
  }
  
  let content = fs.readFileSync(dataPath, 'utf8');
  const appDataMatch = content.match(/var APP_DATA = ({[\s\S]*?});/);
  if (!appDataMatch) {
    throw new Error('Invalid data.js format');
  }
  
  const appData = JSON.parse(appDataMatch[1]);
  const sceneIndex = parseInt(sceneId);
  const targetScene = appData.scenes[sceneIndex];
  
  if (!targetScene) {
    throw new Error(`Scene ${sceneId} not found`);
  }
  
  if (!targetScene.infoHotspots) {
    targetScene.infoHotspots = [];
  }
  
  targetScene.infoHotspots = targetScene.infoHotspots.filter(h => h.id !== hotspot.id);
  targetScene.infoHotspots.push(hotspot);
  
  const newContent = content.replace(
    /var APP_DATA = {[\s\S]*?};/,
    `var APP_DATA = ${JSON.stringify(appData, null, 2)};`
  );
  
  fs.writeFileSync(dataPath, newContent);
}

function getPanoramaHotspots(projectId, sceneId) {
  const dataPath = path.join(__dirname, `../public/panorama/${projectId}/app-files/data.js`);
  
  if (!fs.existsSync(dataPath)) {
    return [];
  }
  
  const content = fs.readFileSync(dataPath, 'utf8');
  const appDataMatch = content.match(/var APP_DATA = ({[\s\S]*?});/);
  
  if (!appDataMatch) {
    return [];
  }
  
  const appData = JSON.parse(appDataMatch[1]);
  const sceneIndex = parseInt(sceneId);
  const scene = appData.scenes[sceneIndex];
  
  if (!scene || !scene.infoHotspots) {
    return [];
  }
  
  return scene.infoHotspots;
}



app.post('/api/panorama/:project/hotspots', (req, res) => {
  const { project } = req.params;
  const sceneId = req.query.scene;
  
  try {
    const newHotspot = {
      id: req.body.id || 'hotspot-' + Date.now(),
      x: req.body.x,
      y: req.body.y,
      title: req.body.title,
      description: req.body.description,
      type: req.body.type,
      targetUrl: req.body.targetUrl,
      targetScene: req.body.targetScene,
      targetProject: req.body.targetProject,
      assetUrl: req.body.assetUrl,
      sceneId: sceneId
    };
    
    savePanoramaHotspot(project, newHotspot, sceneId);
    res.json({ success: true, message: 'Hotspot saved' });
  } catch (error) {
    console.error('Failed to save panorama hotspot:', error);
    res.status(500).json({ error: 'Failed to save hotspot' });
  }
});



// Set default scene for panorama project
app.put('/api/panorama/:projectId/default-scene/:sceneId', (req, res) => {
  try {
    const { projectId, sceneId } = req.params;
    const projectPath = path.join(__dirname, '../public/panorama', projectId);
    const appFilesPath = path.join(projectPath, 'app-files');
    const dataPath = path.join(appFilesPath, 'data.js');
    
    if (!fs.existsSync(dataPath)) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const content = fs.readFileSync(dataPath, 'utf8');
    const match = content.match(/var APP_DATA = ({[\s\S]*?});/);
    if (!match) {
      return res.status(400).json({ error: 'Invalid project format' });
    }

    const appData = JSON.parse(match[1]);
    appData.defaultScene = sceneId;
    
    const newContent = content.replace(
      /var APP_DATA = {[\s\S]*?};/,
      `var APP_DATA = ${JSON.stringify(appData, null, 2)};`
    );
    
    fs.writeFileSync(dataPath, newContent);
    
    res.json({ success: true, message: 'Default scene updated' });
  } catch (error) {
    console.error('Failed to set default scene:', error);
    res.status(500).json({ error: 'Failed to set default scene' });
  }
});

// Delete scene from panorama project
app.delete('/api/panorama/:projectId/scene/:sceneId', (req, res) => {
  try {
    const { projectId, sceneId } = req.params;
    const projectPath = path.join(__dirname, '../public/panorama', projectId);
    const appFilesPath = path.join(projectPath, 'app-files');
    const dataPath = path.join(appFilesPath, 'data.js');
    
    if (!fs.existsSync(dataPath)) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const content = fs.readFileSync(dataPath, 'utf8');
    const match = content.match(/var APP_DATA = ({[\s\S]*?});/);
    if (!match) {
      return res.status(400).json({ error: 'Invalid project format' });
    }

    const appData = JSON.parse(match[1]);
    const sceneIndex = parseInt(sceneId);
    
    if (appData.scenes.length <= 1) {
      return res.status(400).json({ error: 'Cannot delete the last scene' });
    }
    
    // Delete scene image file
    const imagePath = path.join(appFilesPath, `scene-${sceneIndex}.jpg`);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
    
    // Remove scene from data
    appData.scenes.splice(sceneIndex, 1);
    
    // Reindex remaining scene files
    for (let i = sceneIndex; i < appData.scenes.length; i++) {
      const oldPath = path.join(appFilesPath, `scene-${i + 1}.jpg`);
      const newPath = path.join(appFilesPath, `scene-${i}.jpg`);
      if (fs.existsSync(oldPath)) {
        fs.renameSync(oldPath, newPath);
      }
    }
    
    // Update data.js
    const newContent = content.replace(
      /var APP_DATA = {[\s\S]*?};/,
      `var APP_DATA = ${JSON.stringify(appData, null, 2)};`
    );
    
    fs.writeFileSync(dataPath, newContent);
    
    res.json({ success: true, message: 'Scene deleted successfully' });
  } catch (error) {
    console.error('Failed to delete scene:', error);
    res.status(500).json({ error: 'Failed to delete scene' });
  }
});

// Panorama projects list (from panorama folder)
app.get('/api/panorama/projects', (req, res) => {
  try {
    const panoramaPath = path.join(__dirname, '../public/panorama');
    
    if (fs.existsSync(panoramaPath)) {
      const folders = fs.readdirSync(panoramaPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => ({
          id: dirent.name,
          name: dirent.name.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ')
        }));
      
      res.json({ projects: folders });
    } else {
      // Create panorama directory if it doesn't exist
      fs.mkdirSync(panoramaPath, { recursive: true });
      res.json({ projects: [] });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Marzipano projects list
app.get('/api/marzipano/projects', (req, res) => {
  try {
    const marzipanoPath = path.join(__dirname, '../public/marzipano');
    
    if (fs.existsSync(marzipanoPath)) {
      const folders = fs.readdirSync(marzipanoPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => ({
          id: dirent.name,
          name: dirent.name.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ')
        }));
      
      res.json({ projects: folders });
    } else {
      res.json({ projects: [] });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Layer4 projects management
app.get('/api/layer4/projects', (req, res) => {
  try {
    const filePath = path.join(dataPath, 'layer4-projects.json');
    
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      res.json(data);
    } else {
      res.json({ projects: [] });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/layer4/projects', (req, res) => {
  try {
    const filePath = path.join(dataPath, 'layer4-projects.json');
    fs.writeFileSync(filePath, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Layer5 projects management
app.get('/api/layer5/projects', (req, res) => {
  try {
    const filePath = path.join(dataPath, 'layer5-projects.json');
    
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      res.json(data);
    } else {
      res.json({ projects: [] });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/layer5/projects', (req, res) => {
  try {
    const filePath = path.join(dataPath, 'layer5-projects.json');
    fs.writeFileSync(filePath, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Layer5 hotspots management
app.get('/api/hotspots/layer5', (req, res) => {
  try {
    const filePath = path.join(dataPath, 'layer5-hotspots.json');
    
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      res.json(data);
    } else {
      res.json({ hotspots: [] });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/hotspots/layer5', (req, res) => {
  try {
    const filePath = path.join(dataPath, 'layer5-hotspots.json');
    fs.writeFileSync(filePath, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add single layer5 hotspot
app.post('/api/hotspots/layer5/add', (req, res) => {
  try {
    const filePath = path.join(dataPath, 'layer5-hotspots.json');
    let data = { hotspots: [] };
    
    if (fs.existsSync(filePath)) {
      data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    
    const newHotspot = {
      id: req.body.id || Date.now(),
      mediaId: req.body.mediaId,
      x: req.body.x,
      y: req.body.y,
      type: req.body.type || 'asset',
      hotspotType: req.body.hotspotType || 'asset',
      title: req.body.title,
      description: req.body.description || '',
      active: true,
      ...(req.body.targetMediaId && { targetMediaId: req.body.targetMediaId }),
      ...(req.body.targetLayerId && { targetLayerId: req.body.targetLayerId }),
      ...(req.body.targetUnitId && { targetUnitId: req.body.targetUnitId }),
      ...(req.body.assetUrl && { assetUrl: req.body.assetUrl }),
      ...(req.body.assetType && { assetType: req.body.assetType })
    };
    
    data.hotspots.push(newHotspot);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    res.json({ success: true, hotspot: newHotspot });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete layer5 hotspot
app.delete('/api/hotspots/layer5/:id', (req, res) => {
  try {
    const { id } = req.params;
    const filePath = path.join(dataPath, 'layer5-hotspots.json');
    
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      data.hotspots = data.hotspots.filter(h => h.id != id);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Hotspots file not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Assets listing endpoints
app.get('/api/assets/:type', (req, res) => {
  try {
    const { type } = req.params;
    const assetsPath = path.join(__dirname, '../public/media', type);
    
    if (fs.existsSync(assetsPath)) {
      const files = fs.readdirSync(assetsPath)
        .filter(file => !file.startsWith('.'))
        .map(file => {
          const filePath = path.join(assetsPath, file);
          const stats = fs.statSync(filePath);
          return {
            name: file,
            size: stats.size,
            modified: stats.mtime
          };
        });
      
      res.json({ files });
    } else {
      res.json({ files: [] });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Layer2 link management
app.get('/api/layer2/link', (req, res) => {
  try {
    const filePath = path.join(dataPath, 'layer2-link.json');
    
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      res.json(data);
    } else {
      // Return default link if file doesn't exist
      const defaultLink = { url: '/jakhabitat/cms' };
      res.json(defaultLink);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/layer2/link', (req, res) => {
  try {
    const filePath = path.join(dataPath, 'layer2-link.json');
    fs.writeFileSync(filePath, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});