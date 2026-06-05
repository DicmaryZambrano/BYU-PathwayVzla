import { prisma } from "../../lib/prisma";

export default async function handler(req, res) {

    try {

        const page = parseInt(req.query.page || "1");
        const limit = parseInt(req.query.limit || "12");

        const search = req.query.search || "";
        const category = req.query.category || "all";
        const sort = req.query.sort || "recent";

        const skip = (page - 1) * limit;

        let orderBy = {
            createdAt: "desc"
        };

        if (sort === "popular") {
            orderBy = {
                views: "desc"
            };
        }

        if (sort === "oldest") {
            orderBy = {
                createdAt: "asc"
            };
        }

        const where = {
            status: "approved",

            ...(category !== "all" && {
                category
            }),

            ...(search && {
                OR: [
                    {
                        title: {
                            contains: search,
                            mode: "insensitive"
                        }
                    },
                    {
                        uploader: {
                            contains: search,
                            mode: "insensitive"
                        }
                    }
                ]
            })
        };

        const videos = await prisma.video.findMany({
            where,
            orderBy,
            skip,
            take: limit
        });

        const total = await prisma.video.count({
            where
        });

        return res.status(200).json({
            videos,
            page,
            limit,
            total,
            hasMore:
                skip + videos.length < total
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error: error.message
        });
    }
}