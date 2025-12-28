package com.flagcamp.dispatchanddelivery.controller;

import com.flagcamp.dispatchanddelivery.socket.MailboxWsHandler;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/dev/ws")
public class DevWsController {

    @PostMapping(value = "/broadcast", consumes = "application/json")
    public void broadcast(@RequestBody String json) {
        MailboxWsHandler.broadcast(json);
    }
}
