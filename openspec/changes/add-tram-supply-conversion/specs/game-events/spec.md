## ADDED Requirements

### Requirement: Tram conversion offer is decidable
From the data-driven offer year (`history.json` `tramConversion.offerYear`, initial 1896) the tram company SHALL offer to the player to take over the tram's energy supply with three-phase: the player builds a converter station, the tram retires its depot plant, buys energy wholesale under the AC tariff with its priority factor — the overhead line stays 600 V DC. The offer SHALL arrive as a newspaper/article message (analogous to the coal-crisis telegraph); the player SHALL accept or reject.

#### Scenario: Offer arrives in the offer year
- **WHEN** the game year reaches `offerYear` (1896)
- **THEN** a newspaper/message presents the conversion offer with accept/reject choice

#### Scenario: Accept
- **WHEN** the tram company offers the conversion and the player accepts
- **THEN** the converter station becomes buildable in the tram region and the conversion process starts

#### Scenario: Reject
- **WHEN** the player rejects the conversion offer
- **THEN** no converter station becomes buildable and the tram remains a DC load for the rest of the campaign; the rejection is final (no re-offer)
