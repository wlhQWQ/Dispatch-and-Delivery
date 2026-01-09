// package com.flagcamp.dispatchanddelivery.controller;

// import com.flagcamp.dispatchanddelivery.socket.MailboxWsHandler;
// import org.springframework.web.bind.annotation.*;

// //用于测试
// @RestController
// @RequestMapping("/dev/ws")
// public class DevWsController {

//     @PostMapping(value = "/broadcast", consumes = "application/json")
//     public void broadcast(@RequestBody String json) {
//         MailboxWsHandler.broadcast(json);
//     }

//     @PostMapping(value = "/send", consumes = "application/json")
//     public void sendToUser(@RequestParam String userId, @RequestBody String json) {
//         MailboxWsHandler.broadcastToUser(userId, json);
//     }
// }
