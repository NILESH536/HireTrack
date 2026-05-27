package com.hirectrack.model;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
@JsonSubTypes({
    @JsonSubTypes.Type(value = RoundStatus.Pending.class, name = "pending"),
    @JsonSubTypes.Type(value = RoundStatus.Cleared.class, name = "cleared"),
    @JsonSubTypes.Type(value = RoundStatus.Rejected.class, name = "rejected")
})
public sealed interface RoundStatus permits RoundStatus.Pending, RoundStatus.Cleared, RoundStatus.Rejected {
    record Pending() implements RoundStatus {}
    record Cleared() implements RoundStatus {}
    record Rejected(String reason) implements RoundStatus {}
}
