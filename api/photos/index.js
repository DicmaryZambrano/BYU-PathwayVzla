import { prisma } from '../../lib/prisma';

export default async function handler(req, res) {

    const page =
        parseInt(req.query.page || "1");

    const limit =
        parseInt(req.query.limit || "12");

    const search =
        req.query.search || "";

    const category =
        req.query.category || "all";

    const sort =
        req.query.sort || "recent";

    const skip =
        (page - 1) * limit;

    let orderBy = {
        createdAt: "desc"
    };

    if (sort === "oldest") {
        orderBy = {
            createdAt: "asc"
        };
    }

    if (sort === "popular") {
        orderBy = {
            likes: "desc"
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

    const photos =
        await prisma.photo.findMany({
            where,
            orderBy,
            skip,
            take: limit
        });

    const total =
        await prisma.photo.count({
            where
        });

    return res.status(200).json({
        photos,
        total,
        page,
        limit,
        hasMore:
            skip + photos.length < total
    });
}