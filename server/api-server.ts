import express from 'express';
import cors from 'cors';
import { storage } from './storage';
import { insertWhyChooseUsSectionSchema } from '../shared/schema';

const app = express();
const port = 8081;

app.use(cors());
app.use(express.json());

// Simple authentication middleware
const isAuthenticated = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Skip authentication for GET requests
  if (req.method === 'GET') {
    return next();
  }
  
  // For POST/PUT/DELETE, check if user is authenticated
  // This is a simplified check - in a real app you'd validate session/token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  next();
};

// Why Choose Us sections routes
app.get('/api/why-choose-us-sections', async (req, res) => {
  try {
    const sections = await storage.listWhyChooseUsSections();
    res.json(sections);
  } catch (error) {
    console.error('Error fetching why choose us sections:', error);
    res.status(500).json({ message: 'Failed to fetch why choose us sections' });
  }
});

app.get('/api/why-choose-us-sections/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid section ID' });
    }
    
    const section = await storage.getWhyChooseUsSection(id);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }
    
    res.json(section);
  } catch (error) {
    console.error('Error fetching why choose us section:', error);
    res.status(500).json({ message: 'Failed to fetch why choose us section' });
  }
});

app.post('/api/why-choose-us-sections', isAuthenticated, async (req, res) => {
  try {
    const validatedData = insertWhyChooseUsSectionSchema.parse(req.body);
    const newSection = await storage.createWhyChooseUsSection(validatedData);
    res.status(201).json(newSection);
  } catch (error) {
    console.error('Error creating why choose us section:', error);
    res.status(500).json({ message: 'Failed to create why choose us section' });
  }
});

app.put('/api/why-choose-us-sections/:id', isAuthenticated, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid section ID' });
    }
    
    const validatedData = insertWhyChooseUsSectionSchema.partial().parse(req.body);
    const updatedSection = await storage.updateWhyChooseUsSection(id, validatedData);
    
    if (!updatedSection) {
      return res.status(404).json({ message: 'Section not found' });
    }
    
    res.json(updatedSection);
  } catch (error) {
    console.error('Error updating why choose us section:', error);
    res.status(500).json({ message: 'Failed to update why choose us section' });
  }
});

app.delete('/api/why-choose-us-sections/:id', isAuthenticated, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid section ID' });
    }
    
    const deleted = await storage.deleteWhyChooseUsSection(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Section not found or could not be deleted' });
    }
    
    res.status(200).json({ message: 'Section deleted successfully' });
  } catch (error) {
    console.error('Error deleting why choose us section:', error);
    res.status(500).json({ message: 'Failed to delete why choose us section' });
  }
});

app.listen(port, () => {
  console.log(`API server running on port ${port}`);
});