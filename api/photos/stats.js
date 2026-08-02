import { prisma } from '../../lib/prisma';

export default async function handler(req, res) {

    try {

        const totalPhotos =
            await prisma.photo.count({
                where: {
                    status: "approved"
                }
            });

        return res.status(200).json({
            totalPhotos
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error: "Internal server error"
        });
    }
}
