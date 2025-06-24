import { Express, Request, Response } from "express";
import { storage } from './storage';

export function setupHeroSlidesRoutes(app: Express) {
  // Get all hero slides (admin)
  app.get('/api/hero-slides', async (req: Request, res: Response) => {
    try {
      const slides = await storage.getActiveHeroSlides();
      res.json(slides);
    } catch (error) {
      console.error('Error fetching hero slides:', error);
      res.status(500).json({ message: 'Failed to fetch slides' });
    }
  });

  // Get active hero slides (public)
  app.get('/api/hero-slides/active', async (req: Request, res: Response) => {
    try {
      const slides = [
        {
          id: 1,
          title: "Welcome to Sahara Journeys",
          subtitle: "Discover the Magic of the Middle East",
          description: "Experience unforgettable adventures across Egypt, Jordan, and Morocco with our expertly crafted tours.",
          imageUrl: "/uploads/hero-1.jpg",
          buttonText: "Explore Packages",
          buttonLink: "/packages",
          order: 0,
          active: true
        },
        {
          id: 2,
          title: "Cairo & Pyramids",
          subtitle: "Ancient Wonders Await", 
          description: "Step into history with our exclusive tours of the Great Pyramids and bustling Cairo markets.",
          imageUrl: "/uploads/hero-2.jpg",
          buttonText: "Book Cairo Tour",
          buttonLink: "/packages/cairo",
          order: 0,
          active: true
        }
      ];
      res.json(slides);
    } catch (error) {
      console.error('Error fetching active hero slides:', error);
      res.status(500).json({ message: 'Failed to fetch active slides' });
    }
  });

  // Create new hero slide
  app.post('/api/hero-slides', async (req: Request, res: Response) => {
    try {
      const {
        title,
        subtitle,
        description,
        imageUrl,
        buttonText,
        buttonLink,
        secondaryButtonText,
        secondaryButtonLink,
        order = 0,
        active = true
      } = req.body;

      if (!title || !imageUrl) {
        return res.status(400).json({ message: 'Title and image URL are required' });
      }

      const newSlide = await storage.createHeroSlide({
        title,
        subtitle,
        description,
        imageUrl,
        buttonText,
        buttonLink,
        secondaryButtonText,
        secondaryButtonLink,
        order,
        active
      });

      res.status(201).json(newSlide);
    } catch (error) {
      console.error('Error creating hero slide:', error);
      res.status(500).json({ message: 'Failed to create slide' });
    }
  });
}