// frontend/pages/api/mountains.js
export default async function handler(req, res) {
    try {
      const response = await fetch(`${process.env.API_BASE_URL}/api/mountains`);
      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      console.error('Mountains API error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
  