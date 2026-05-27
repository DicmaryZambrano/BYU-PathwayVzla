import { prisma } from '../../lib/prisma';

export default async function handler(req, res) {
    // Verificar autenticación (implementa tu sistema de admin)
    const adminToken = req.headers['admin-token'];
    if (adminToken !== process.env.ADMIN_SECRET_TOKEN) {
        return res.status(401).json({ error: 'No autorizado' });
    }

    try {
        // GET - Obtener mensajes pendientes
        if (req.method === 'GET') {
            const messages = await prisma.message.findMany({
                where: {
                    status: 'pending'
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });

            return res.status(200).json(messages);
        }

        // PUT - Aprobar/Rechazar mensaje
        if (req.method === 'PUT') {
            const { id, action, reviewerName } = req.body; // action: 'approve' o 'reject'

            if (!id || !action) {
                return res.status(400).json({ error: 'Faltan campos requeridos' });
            }

            const newStatus = action === 'approve' ? 'approved' : 'rejected';

            const updatedMessage = await prisma.message.update({
                where: { id: Number(id) },
                data: {
                    status: newStatus,
                    reviewedAt: new Date(),
                    reviewedBy: reviewerName || 'Admin'
                }
            });

            return res.status(200).json(updatedMessage);
        }

        // DELETE - Eliminar mensaje rechazado
        if (req.method === 'DELETE') {
            const { id } = req.body;

            await prisma.message.delete({
                where: { id: Number(id) }
            });

            return res.status(200).json({ message: 'Mensaje eliminado' });
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error interno' });
    }
}