package com.flagcamp.dispatchanddelivery.controller;

import com.flagcamp.dispatchanddelivery.mailbox.ConfirmRequest;
import com.flagcamp.dispatchanddelivery.mailbox.MailboxMessage;
import com.flagcamp.dispatchanddelivery.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/dashboard/mailbox")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;


    @GetMapping
    public ResponseEntity<?> getMailbox(
            @RequestParam(required = false) Long userId
    ) {
        if (userId == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "userId is required"));
        }

        List<MailboxMessage> mailbox = messageService.getMailbox(userId);
        return ResponseEntity.ok(
                Map.of(
                        "success", true,
                        "data", mailbox
                )
        );
    }


    @PostMapping("/confirm")
    public ResponseEntity<?> confirmMailbox(
            @RequestBody ConfirmRequest req
    ) {
        if (req.messageId == 0) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "messageId is required"));
        }

        messageService.confirmMailboxAction(req);
        return ResponseEntity.noContent().build();
    }
}