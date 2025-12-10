import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

class CredentialsController {
  
  // GET /api/admin/credentials
  async listCredentials(req: Request, res: Response) {
    try {
      const credsDir = path.join(process.cwd(), 'creds');
      
      if (!fs.existsSync(credsDir)) {
        return res.json([]);
      }

      const files = fs.readdirSync(credsDir)
        .filter(file => file.endsWith('.json'))
        .map(file => ({
          name: file,
          path: `creds/${file}`
        }));

      res.json(files);
    } catch (error) {
      console.error('List Credentials error:', error);
      res.status(500).json({ message: 'Error listing credentials' });
    }
  }
}

export const credentialsController = new CredentialsController();
