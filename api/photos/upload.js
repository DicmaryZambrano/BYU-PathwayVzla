import { imagekit } from '../../lib/imagekit';
import { prisma } from '../../lib/prisma';

// =========================
// API AVATAR GENERATION
// =========================

const avatarStyles = ['identicon', 'pixel-art', 'rings', 'thumbs'];

function getRandomAvatarStyle(name) {
    // Usa el nombre como semilla para consistencia
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return avatarStyles[hash % avatarStyles.length];
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {

    const {
      imageBase64,
      title,
      category,
      uploader
    } = req.body;

    const uploaded = await imagekit.upload({
      file: imageBase64,
      fileName: `${Date.now()}.jpg`,
      folder: "/graduacion-2026"
    });

    const photo =
    await prisma.photo.create({

        data: {
            title,
            category,
            uploader,
            avatar: `https://api.dicebear.com/7.x/${getRandomAvatarStyle(uploader)}/svg?seed=${encodeURIComponent(uploader)}&backgroundColor=0A3D6D`,
            imageUrl: uploaded.url,
            status: "pending"
        }
    });

    res.status(200).json(photo);
    console.log("Uploading image...");

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message
    });
  }
}