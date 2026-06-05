import { prisma } from "../lib/prisma";

export default async function handler(req, res) {

    try {

        const totalMessages =
            await prisma.message.count({
                where: {
                    status: "approved"
                }
            });

        const likesResult =
            await prisma.message.aggregate({
                _sum: {
                    likes: true
                },
                where: {
                    status: "approved"
                }
            });

        const participants =
            await prisma.message.findMany({
                where: {
                    status: "approved"
                },
                select: {
                    name: true,
                    location: true
                }
            });

        const uniqueParticipants =
            new Set(
                participants.map(
                    p => `${p.name}-${p.location}`
                )
            ).size;

        return res.status(200).json({
            totalMessages,
            totalLikes: likesResult._sum.likes || 0,
            totalParticipants: uniqueParticipants
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error: "Internal server error"
        });
    }
}