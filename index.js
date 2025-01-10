const { ONE_SIGNAL_CONFIG } = require("./config/app.config.js")
const pushNotificationService = require("./services/push-notification.services.js");
const express = require("express");
const http = require("http");
const app = express();
const routes = require("./routes");
const port = process.env.PORT || 3000;
const server = http.createServer(app);
const io = require("socket.io")(server);
const md5 = require("md5");

// Middleware
app.use(express.json());
app.use("/api", routes);
app.use("/uploads", express.static("uploads"));
app.use("/profile", express.static("profile"));


const clients = {};
const roomMetadata = [];
const movements = [];
const mysql = require('mysql2');


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

        if (roomData.players.length < 2) {
            // Add user to players if there are less than 2 players
            if (!userExistsInPlayers) {
                roomData.players.push(user);
            } 
            
        } else {
            // Add user to audience if players already has 2 users
            roomData.audience.push(user);
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
    
        // console.log(`Room metadata updated for room ${room}:`, roomData);
        // console.log(`Clients to room ${room}:`, roomClients);
    });

    socket.on('move', (move) => {
        let room = move.room;
        let row = move.row;
        let col = move.col;
        let piece = move.piece;
        let isWhite = move.isWhite;
        let uid = move.uid;
        let action = move.action;
        let time = move.time;
        
        

        socket.broadcast.to(room).emit('on-move', {
            room:room,
            row:row,
            col:col,
            piece:piece,
            isWhite:isWhite,
            uid:uid,
            action:action,
            time:time
        });

    });

    socket.on('rematch', (data) => {
        let room = data.room;
        let uid = data.uid;
        let action = data.action;
        let time = data.time; 

        socket.broadcast.to(room).emit('on-rematch', {
            room:room,
            uid:uid,
            action:action,
            time:time
        });
    });

    socket.on('exit-room', (data) => {
        let room = data.room;
        let uid = data.uid;
        let action = data.action;
        let time = data.time; 

        let roomData = roomMetadata.find((meta) => meta.room === room);

        if (!roomData) {
            console.log(`Room ${room} not found.`);
            return;
        }

        
    });

    
    socket.on("disconnect", (_) => {
        console.log("Disconnected. Reconnecting :", new Date().toLocaleTimeString().substring(0, 5));
    });

    socket.on("connect_error", (err) => {
        console.log("Connection error: ", err);
    });

    console.log(`Connect ${socket.connected}: ${new Date().toLocaleTimeString().substring(0, 5)}`);
});

const db = require('./config/db');

app.use(express.urlencoded({ extended: true })); 
const multer = require("multer");
const upload = multer({ dest: "profile/" });

app.post("/register", upload.single("image"), async (req, res) => {
    try {
        const {
            uid, username, first, last, email, phone, password, status, token, country
        } = req.body;

        const [existingUser] = await db.execute(
            "SELECT username FROM users WHERE username = ?",
            [username]
        );

        // Check if the email already exists
        const [existingEmail] = await db.execute(
            "SELECT email FROM users WHERE email = ?",
            [email]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Exists",
            });
        }

        if (existingEmail.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Error",
            });
        }

        // Process the image
        const image = req.file ? req.file.filename : "";

        // Insert new user into the database
        const sql = `
            INSERT INTO users 
            (uid, username, first, last, email, phone, password, image, status, token, country) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [uid, username, first, last, email, phone, password, image, status, token, country];

        const [result] = await db.execute(sql, values);

        res.status(201).json({
            success: true,
            image: image,
            message: `Success`,
            
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false,
             message: "Failed" });
    }
});

// Handle login route
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = md5(password); 

    const sql = `SELECT * FROM users WHERE BINARY email = '${email}' AND BINARY password = '${hashedPassword}'`;

    const db1 = mysql.createPool({
        host: '0.0.0.0',
        user: 'root',
        password: '',
        database: 'chess',
    });

    db1.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                success: false,
                message: "Database query failed"
            });
        }

        if (result.length === 1) {
            // Assuming 'result[0]' contains the user data
            const user = result[0]; // The first (and only) result from the query

            return res.json({
                success: true,
                message: "User login successfully",
                user: user  // Sending the user data as part of the response
            });
        } else {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }
    });
});


app.route("/check").get((req, res) => {
    return res.json("Your app is working fine");
});

server.listen(port, "0.0.0.0", () => {
    console.log("server started");
});