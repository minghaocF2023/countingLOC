import express from 'express';

const router = express.Router();

router.post('/upload', (req, res) => {
  const { image } = req.files;

  if (!image) {
    res.status(400).json({ message: 'no image' });
    return;
  }

  if (!/^image/.test(image.mimetype)) {
    res.status(400).json({ message: 'please upload imagev type' });
    return;
  }

  image.mv(`${req.app.get('public')}/upload/${image.name}`);

  res.status(200).json({ message: 'upload success' });
});

export default router;
