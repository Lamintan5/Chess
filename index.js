const { ONE_SIGNAL_CONFIG } = require("./config/app.config.js")
const pushNotificationService = require("./services/push-notification.services.js");
const express = require("express");
const http = require("http");
const app = express();
const port = process.env.PORT || 3000;
const server = http.createServer(app);
const io = require("socket.io")(server);
const routes = require("./routes");


// Middleware
app.use(express.json());
app.use("/api", routes);
app.use("/uploads", express.static("uploads"));

const clients = {};
const roomMetadata = [];

io.on("connection", (socket) => {
    // console.log(socket.id, "has joined");

    socket.on("signin", (id) => {
        console.log(`User ${id} has signed in`);
        clients[id] = socket;
        // console.log("Connected clients:", clients);
    });

    socket.on("signout", (id) => {
        console.log(`User ${id} has signed out`);
        delete clients[id];
        // console.log("Connected clients:", clients);
    });

    socket.on("message", (msg)=>{
        console.log(msg);
        let targetId = msg.targetId;
        let messageText = msg.message;
        let username = msg.title;
        let recipientToken = msg.token;
        let profile = msg.profile;
        let image = msg.path;

        if (clients[targetId]) {
            clients[targetId].emit("message", msg);
            console.log(`Sent message to user ${targetId}`);
            
        } else {
            console.log(`User ${targetId} not found`);
        }
        var message = {
            app_id: ONE_SIGNAL_CONFIG.APP_ID,
            contents: {en : messageText,},
            headings: {en: username,},
            included_segments: ["Subscribed Users"],
            buttons: [
                { id: "1", text: "Reply", action: { url: `Zelli://message?userId=${targetId}` } },
                { id: "2", text: "Ignore",},
            ],
            include_player_ids: recipientToken,
            content_available: true,
            small_icon: "ic_app_log",
            groupSummaryIcon: "ic_app_log",
            large_icon: profile,
            big_picture: image,
            data: {
                PushTitle: "STUDIO5IVE",
                group: "123456",
            },
            ios_sound: "default", 
            android_sound: "default",
            priority: 10,
        };
        pushNotificationService.SendNotification(message, (error, results) => {
            if(error){
                console.log(`Error`);
            } else {
                console.log(`Success`)
            }
            
        });
    });

    socket.on("group", (msg) => {
        console.log("Received group message:", msg);

        let targetIds = msg.targetId || [];
        let messageText = msg.message;
        let title = msg.title;
        let recipientToken = msg.token;
        let profile = msg.profile;
        let image = msg.path;
        let username = msg.username;

        targetIds.forEach(targetId => {
            if (clients[targetId]) {
                clients[targetId].emit("group", msg);
                console.log(`Sent group message to user ${targetId}`);
            } else {
                console.log(`User ${targetId} not found`);
            }
        });
        var message = {
            app_id: ONE_SIGNAL_CONFIG.APP_ID,
            contents: {en : `${username} : ${messageText}`,},
            headings: {en: title,},
            included_segments: ["Grouped Users"],
            buttons: [
                { id: "1", text: "Reply", action: { url: `Zelli://message?userId=123` } },
                { id: "2", text: "Ignore",},
            ],
            include_player_ids: recipientToken,
            content_available: true,
            small_icon: "ic_app_log",
            large_icon: profile,
            big_picture: image,
            data: {
                PushTitle: "STUDIO5IVE"
            },
            ios_sound: "default", 
            android_sound: "default",
            priority: 10,
        };
        pushNotificationService.SendNotification(message, (error, results) => {
            if(error){
                return console.log(`Error`)
            } else {
                console.log(`Success`)
            }
            
        });
    });
    
    socket.on("notif", (msg)=>{
        console.log(msg);
        let targetIds = msg.pid || [];
        let messageText = msg.message;
        let title = msg.title;
        let recipientToken = msg.token;
        let profile = msg.profile;
        let image = msg.path;

        targetIds.forEach(pid => {
            if (clients[pid]) {
                clients[pid].emit("notif", msg);
                console.log(`Sent Notification to user ${pid}`);
            } else {
                console.log(`User ${pid} not found`);
            }
        });
        var message = {
            app_id: ONE_SIGNAL_CONFIG.APP_ID,
            contents: {en : messageText,},
            headings: {en: title,},
            included_segments: ["Subscribed Users"],
            
            include_player_ids: recipientToken,
            content_available: true,
            small_icon: "ic_app_log",
            groupSummaryIcon: "ic_app_log",
            large_icon: profile,
            big_picture: image,
           
            data: {
                PushTitle: "STUDIO5IVE",
                group: "123456",
            },
            ios_sound: "default", 
            android_sound: "default",
            priority: 10,
        };
        pushNotificationService.SendNotification(message, (error, results) => {
            if(error){
                console.log(`Error`);
            } else {
                console.log(`Success`)
            }
            
        });
    });

    // Game
    // Join Game Room
    socket.on('join-room', (data, callback) => {
        const room = data.room;
        const user = data.user;
        const time = data.time;
    
        // Find room metadata
        let roomData = roomMetadata.find((meta) => meta.room === room);
    
        if (!roomData) {
            // If room does not exist, create it
            roomData = {
                room: room,
                players: [],
                audience: [],
                time: time
            };
            roomMetadata.push(roomData);
        }
    
        // Check if user exists in players
        const userExistsInPlayers = roomData.players.some(
            (player) => player.uid === user.uid
        );
    
        if (!userExistsInPlayers) {
            if (roomData.players.length < 2) {
                // Add user to players if there are less than 2 players
                roomData.players.push(user);
            } else {
                // Add user to audience if players already has 2 users
                roomData.audience.push(user);
            }
        }
    
        // Join the socket room
        socket.join(room);
        
        const roomClients = io.sockets.adapter.rooms.get(room);
        const clientsArray = roomClients ? Array.from(roomClients) : [];
    
        // Callback response
        callback({
            room: room,
            players: roomData.players,
            audience: roomData.audience,
            success: true,
            message: `User ${user.username} joined room ${room}`
        });

        io.emit('room-created', {
            room: room,
            players: roomData.players,
            audience: roomData.audience,
            time: time,
            message: `User ${user.username} successfully joined room ${room}`
        });

        socket.broadcast.to(room).emit('room-joined', {
            room: room,
            user:user,
            time: time,
        });
    
        console.log(`Room metadata updated for room ${room}:`, roomData);
        console.log(`Clients to room ${room}:`, roomClients);
    });
    
    socket.on("disconnect", (_) => {
        console.log("Disconnected. Reconnecting :", new Date().toLocaleTimeString().substring(0, 5));
    });

    socket.on("connect_error", (err) => {
        console.log("Connection error: ", err);
    });

    console.log(`Connect ${socket.connected}: ${new Date().toLocaleTimeString().substring(0, 5)}`);
});


app.route("/check").get((req, res) => {
    return res.json("Your app is working fine");
});

server.listen(port, "0.0.0.0", () => {
    console.log("server started");
});