package com.flagcamp.dispatchanddelivery.model.event;

public record MessageCreatedEvent(Long messageId, String userId) {}