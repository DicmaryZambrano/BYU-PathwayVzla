import { prisma } from '../../lib/prisma';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {

    if (req.method !== 'POST') {
        return res.status(405).json({
            error: 'Method not allowed'
        });
    }

    try {

        const { username, password } = req.body;

        const admin =
            await prisma.adminUser.findUnique({
                where: { username }
            });

        if (!admin) {
            return res.status(401).json({
                error: 'Invalid credentials'
            });
        }

        const validPassword =
            await bcrypt.compare(
                password,
                admin.password
            );

        if (!validPassword) {
            return res.status(401).json({
                error: 'Invalid credentials'
            });
        }

        return res.status(200).json({
            success: true
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error: 'Server error'
        });
    }
}