package com.flagcamp.dispatchanddelivery.model.event;

public record MessageCreatedEvent(String messageId, String userId) {}