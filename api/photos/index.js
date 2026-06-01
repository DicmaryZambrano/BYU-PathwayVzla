import { prisma } from '../../lib/prisma';

export default async function handler(req, res) {

  const photos =
    await prisma.photo.findMany({
    where: {
      status: "approved"
    },
    orderBy: {
      createdAt: "desc"
    }
    });

  res.status(200).json(photos);
}