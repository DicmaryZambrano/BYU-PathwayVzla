import { prisma } from "../../lib/prisma";

const avatarStyles = [
  'identicon',
  'pixel-art',
  'gridy',
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
            videoUrl,
            category,
            title,
            uploader
        } = req.body;

        const video =
            await prisma.video.create({

                data: {
                    title,
                    uploader,
                    videoUrl,
                    category: category,
                    type: "youtube",
                    avatar:
                        `https://api.dicebear.com/7.x/${getRandomAvatarStyle(uploader)}/svg?seed=${encodeURIComponent(uploader)}`
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