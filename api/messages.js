import { prisma } from '../lib/prisma';

// =========================
// API AVATAR GENERATION
// =========================

const avatarStyles = ['identicon', 'pixel-art', 'gridy', 'rings', 'thumbs'];

function getRandomAvatarStyle(name) {
    // Usa el nombre como semilla para consistencia
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return avatarStyles[hash % avatarStyles.length];
}

// =========================
// RELATIVE TIME
// =========================
function getRelativeTime(dateString) {

    const now = new Date();
    const created = new Date(dateString);

    const diffMs = now - created;

    const minutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMs / 3600000);
    const days = Math.floor(diffMs / 86400000);

    if (minutes < 1) return "Ahora";
    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;

    return `Hace ${days} día${days > 1 ? 's' : ''}`;
}

export default async function handler(req, res) {

    try {

        // =========================
        // GET
        // =========================
        if (req.method === 'GET') {

            const messages = await prisma.message.findMany({
                orderBy: {
                    createdAt: 'desc'
                }
            });

            const formattedMessages = messages.map(message => ({
                ...message,
                time: getRelativeTime(message.createdAt)
            }));

            return res.status(200).json(formattedMessages);
        }

        // =========================
        // CREATE
        // =========================
        if (req.method === 'POST') {

            const { name, location, message } = req.body;

            

            if (!name || !location || !message) {

                return res.status(400).json({
                    error: 'All fields are required'
                });
            }

            const newMessage = await prisma.message.create({
                data: {
                    name: name.trim(),
                    location: location.trim(),
                    text: message.trim(),
                    likes: 0,
                    likedBy: [],
                    avatar: `https://api.dicebear.com/7.x/${getRandomAvatarStyle(name)}/svg?seed=${encodeURIComponent(name)}&backgroundColor=0A3D6D`
                }
            });

            return res.status(201).json({
                ...newMessage,
                time: "Ahora"
            });
        }

        // =========================
        // LIKE
        // =========================
        if (req.method === 'PATCH') {

            const { id, userId } = req.body;

            if (!id || !userId) {
                return res.status(400).json({
                    error: 'id and userId required'
                });
            }

            const message = await prisma.message.findUnique({
                where: {
                    id: Number(id)
                }
            });

            if (!message) {

                return res.status(404).json({
                    error: 'Message not found'
                });
            }

            const alreadyLiked = message.likedBy.includes(userId);

            let updatedMessage;

            if (alreadyLiked) {

                updatedMessage = await prisma.message.update({
                    where: {
                        id: Number(id)
                    },
                    data: {
                        likes: {
                            decrement: 1
                        },
                        likedBy: {
                            set: message.likedBy.filter(id => id !== userId)
                        }
                    }
                });

            } else {

                updatedMessage = await prisma.message.update({
                    where: {
                        id: Number(id)
                    },
                    data: {
                        likes: {
                            increment: 1
                        },
                        likedBy: {
                            push: userId
                        }
                    }
                });
            }

            return res.status(200).json({
                ...updatedMessage,
                liked: !alreadyLiked,
                time: getRelativeTime(updatedMessage.createdAt)
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