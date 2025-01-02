const { ONE_SIGNAL_CONFIG } = require("../config/app.config")
const pushNotificationService = require("../services/push-notification.services.js");

exports.SendNotification = (req, res, next) => {
    var message = {
        app_id: ONE_SIGNAL_CONFIG.APP_ID,
        contents: { en : "Test Push Notification"},
        included_segments: ["All"],
        content_available: true,
        small_icon: "ic_notification_icon",
        data: {
            PushTitle: "CUSTOM NOTIFICATION"
        }
    };

    pushNotificationService.SendNotification(message, (error, results) => {
        if(error){
            return next(error);
        }
        return res.status(200).send({
            message: "Success",
            data: results
        });
    });
};


exports.SendNotificationToDevice = (req, res, next) => {
    var message = {
        app_id: ONE_SIGNAL_CONFIG.APP_ID,
        contents: {en : "Big bank take little bank",},
        headings: {en: "Zelli",},
        subtitle: {en: "This is subtitle",},
        included_segments: ["included_player_ids"],
        buttons: [
            { id: "id1", text: "Button 1", icon: "ic_launcher_foreground" },
            { id: "id2", text: "Button 2", icon: "ic_launcher_foreground" },
        ],
        include_player_ids: req.body.devices,
        content_available: true,
        small_icon: "ic_app_log",
        large_icon: "https://images.unsplash.com/photo-1555353540-64580b51c258?q=80&w=1956&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        big_picture: "https://images.unsplash.com/photo-1555353540-64580b51c258?q=80&w=1956&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        data: {
            PushTitle: "CUSTOM NOTIFICATION"
        },
        ios_sound: "default", 
        android_sound: "default",
        android_fullscreen_intent: true,
        priority: 10,
        
    };

    pushNotificationService.SendNotification(message, (error, results) => {
        if(error){
            return next(error);
        }
        return res.status(200).send({
            message: "Success",
            data: results,
        });
    });
};