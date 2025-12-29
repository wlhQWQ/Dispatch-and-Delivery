package com.flagcamp.dispatchanddelivery.controller;

import com.flagcamp.dispatchanddelivery.mailbox.ConfirmRequest;
import com.flagcamp.dispatchanddelivery.mailbox.MailboxMessage;
import com.flagcamp.dispatchanddelivery.service.MailboxService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/dashboard/mailbox")
public class MailboxController {

    private final MailboxService mailboxService;

    public MailboxController(MailboxService mailboxService) {
        this.mailboxService = mailboxService;
    }

    @GetMapping
    public List<MailboxMessage> list() {
        return mailboxService.list();
    }

    @PostMapping("/confirm")
    public void confirm(@RequestBody ConfirmRequest req) {
        mailboxService.confirm(req);
    }
}
