package com.flagcamp.dispatchanddelivery.controller;

import com.flagcamp.dispatchanddelivery.model.dto.MessageDTO;
import com.flagcamp.dispatchanddelivery.model.request.ConfirmRequest;
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
    public ResponseEntity<List<MessageDTO>> getMailbox(@RequestParam String userId) {
        //直接返回数组（前端立刻能 map/normalize）
        List<MessageDTO> mailbox = messageService.getMailbox(userId);
        return ResponseEntity.ok(mailbox);
    }



    @PostMapping("/confirm")
    public ResponseEntity<?> confirmMailbox(
            @RequestBody ConfirmRequest req
    ) {
        System.out.println("=== Confirm Request Received ===");
        System.out.println("messageId: " + req.messageId);
        System.out.println("orderId: " + req.orderId);
        System.out.println("action: " + req.action);
        System.out.println("time: " + req.time);
        
        if (req.messageId == null || req.messageId.isEmpty()) {
            System.out.println("ERROR: messageId is null or empty");
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "messageId is required"));
        }

        try {
            messageService.confirmMailboxAction(req);
            System.out.println("SUCCESS: Message confirmed");
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            System.out.println("ERROR: " + e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage(), "messageId", req.messageId));
        } catch (Exception e) {
            System.out.println("UNEXPECTED ERROR: " + e.getClass().getName() + " - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Internal server error: " + e.getMessage()));
        }
    }
}