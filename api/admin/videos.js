import { prisma } from '../../lib/prisma';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {

    // =========================
    // AUTHENTICATION
    // =========================

    const username = req.headers.username;
    const password = req.headers.password;

    const admin = await prisma.adminUser.findUnique({
        where: { username }
    });

    if (!admin) {
        return res.status(401).json({
            error: 'Unauthorized'
        });
    }

    const validPassword =
        await bcrypt.compare(
            password,
            admin.password
        );

    if (!validPassword) {
        return res.status(401).json({
            error: 'Unauthorized'
        });
    }

    // =========================
    // API LOGIC
    // =========================

    try {

        // GET
        if (req.method === 'GET') {

            const videos =
                await prisma.video.findMany({
                    where: {
                        status: 'pending'
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                });

            return res.status(200).json(videos);
        }

        // PUT
        if (req.method === 'PUT') {

            const {
                id,
                action,
                reviewerName
            } = req.body;

            const newStatus =
                action === 'approve'
                    ? 'approved'
                    : 'rejected';

            const updatedVideo =
                await prisma.video.update({
                    where: {
                        id: Number(id)
                    },
                    data: {
                        status: newStatus,
                        reviewedAt: new Date(),
                        reviewerName: reviewerName
                    }
                });

            return res.status(200).json(
                updatedVideo
            );
        }

        // DELETE
        if (req.method === 'DELETE') {

            const { id } = req.body;

            await prisma.video.delete({
                where: {
                    id: Number(id)
                }
            });

            return res.status(200).json({
                success: true
            });
        }

        return res.status(405).json({
            error: 'Method not allowed'
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error: 'Internal server error'
        });
    }
}