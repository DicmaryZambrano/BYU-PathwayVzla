import { imagekit } from "../../lib/imagekit";
import { prisma } from "../../lib/prisma";

const avatarStyles = [
  'identicon',
  'pixel-art',
  'rings',
  'thumbs'
];

function getRandomAvatarStyle(name) {
  const hash = name
    .split('')
    .reduce((acc, char) =>
      acc + char.charCodeAt(0), 0);

  return avatarStyles[
    hash % avatarStyles.length
  ];
}

export default async function handler(
    req,
    res
) {
    try {
        const {
            videoBase64,
            category,
            title,
            description,
            uploader
        } = req.body;

        const uploaded =
            await imagekit.upload({
                file: videoBase64,
                fileName:
                    `${Date.now()}.mp4`,
                folder:
                    "/graduacion-2026/videos",
                useUniqueFileName: true
            });

        const video =
            await prisma.video.create({

                data: {
                    title,
                    uploader,
                    category: category,
                    avatar:
                        `https://api.dicebear.com/7.x/${getRandomAvatarStyle(uploader)}/svg?seed=${encodeURIComponent(uploader)}`,
                    videoUrl:
                        uploaded.url,
                    tumbnailUrl:
                        `${uploaded.url}/ik-thumbnail.jpg`,
                    type: "upload"
                }
            });

        return res
            .status(200)
            .json(video);

    } catch(error) {

        console.error(error);

        return res
            .status(500)
            .json({
                error:
                    error.message
            });
    }
}