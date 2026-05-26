let messages = [
    {
        id: 1,
        name: "María González",
        location: "Caracas, Venezuela",
        text: "¡Felicidades a todos los graduados! Su dedicación y esfuerzo son un ejemplo para todos.",
        likes: 24,
        avatar: "https://i.pravatar.cc/150?img=1",
        createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString()
    },
    {
        id: 2,
        name: "Juan Pérez",
        location: "Maracaibo, Venezuela",
        text: "Dios los bendiga en esta nueva etapa. ¡Mucho éxito en todo lo que viene!",
        likes: 18,
        avatar: "https://i.pravatar.cc/150?img=2",
        createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString()
    },
    {
        id: 3,
        name: "Familia Rodríguez",
        location: "Valencia, Venezuela",
        text: "Estamos muy orgullosos de ustedes! Este es solo el comienzo de cosas increíbles.",
        likes: 31,
        avatar: "https://i.pravatar.cc/150?img=3",
        createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString()
    },
    {
        id: 4,
        name: "Carlos Ramírez",
        location: "Barquisimeto, Venezuela",
        text: "¡Felicitaciones a todos los graduados! Su esfuerzo y dedicación son inspiradoras.",
        likes: 15,
        avatar: "https://i.pravatar.cc/150?img=4",
        createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString()
    },
    {
        id: 5,
        name: "Ana Martínez",
        location: "Maracaibo, Venezuela",
        text: "¡Felicidades a todos los graduados! Su esfuerzo y dedicación son inspiradoras.",
        likes: 22,
        avatar: "https://i.pravatar.cc/150?img=5",
        createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString()
    },
    {
        id: 6,
        name: "Luis Hernández",
        location: "Caracas, Venezuela",
        text: "¡Felicidades a todos los graduados! Su esfuerzo y dedicación son inspiradoras.",
        likes: 19,
        avatar: "https://i.pravatar.cc/150?img=6",
        createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString()
    }
];

// Format relative time
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

export default function handler(req, res) {

    // =========================
    // GET ALL MESSAGES
    // =========================
    if (req.method === 'GET') {

        const formattedMessages = messages.map(message => ({
            ...message,
            time: getRelativeTime(message.createdAt)
        }));

        return res.status(200).json(formattedMessages);
    }

    // =========================
    // CREATE MESSAGE
    // =========================
    if (req.method === 'POST') {

        const { name, location, message } = req.body;

        // Basic validation
        if (!name || !location || !message) {

            return res.status(400).json({
                error: "All fields are required"
            });
        }

        const newMessage = {
            id: Date.now(),
            name: name.trim(),
            location: location.trim(),
            message: message.trim(),
            likes: 0,
            avatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(name)}`,
            createdAt: new Date().toISOString()
        };

        messages.unshift(newMessage);

        return res.status(201).json({
            ...newMessage,
            time: "Ahora"
        });
    }

    // =========================
    // LIKE MESSAGE
    // =========================
    if (req.method === 'PATCH') {

        const { id } = req.body;

        const message = messages.find(msg => msg.id === id);

        if (!message) {

            return res.status(404).json({
                error: "Message not found"
            });
        }

        message.likes += 1;

        return res.status(200).json(message);
    }

    // =========================
    // METHOD NOT ALLOWED
    // =========================
    return res.status(405).json({
        error: 'Method not allowed'
    });
}