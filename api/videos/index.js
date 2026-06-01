import { prisma } from "../../lib/prisma";

export default async function handler(
    req,
    res
) {

    const videos =
        await prisma.video.findMany({

            where: {
                status: "approved"
            },

            orderBy: {
                createdAt: "desc"
            }
        });

    res.json(videos);
}