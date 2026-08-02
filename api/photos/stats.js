import { prisma } from '../../lib/prisma';

export default async function handler(req, res) {

    try {

        const totalPhotos =
            await prisma.photo.count({
                where: {
                    status: "approved"
                }
            });

        const uploaders =
            await prisma.photo.findMany({
                where: {
                    status: "approved"
                },
                select: {
                    uploader: true
                }
            });

        const totalUploaders =
            new Set(
                uploaders.map(p => p.uploader)
            ).size;

        return res.status(200).json({
            totalPhotos,
            totalUploaders
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error: "Internal server error"
        });
    }
}
