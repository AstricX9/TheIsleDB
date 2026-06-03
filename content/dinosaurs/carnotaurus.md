---json
{
    "date": "2026-05-29",
    "category": "dinosaurs",
    "slug": "carnotaurus",
    "description": "",
    "lastUpdated": {
        "date": "7/02/2026",
        "gameVersion": "0.20.967 HT",
        "isOutdated": false
    },
    "heroImage": {
        "src": "/images/carnotaurus/Carno_Default_New.png",
        "alt": "Carnotaurus default skin"
    },
    "basicStats": {
        "diet": "Carnivore",
        "size": "Medium",
        "speed": "Fast",
        "difficulty": "Moderate"
    },
    "characteristics": [
        "Medium-sized theropod dinosaur",
        "Distinctive horns above eyes",
        "Powerful bite force",
        "Fastest dinosaur in the game",
        "Well-suited for ambush hunting"
    ],
    "adultStats": {
        "weight": "1300",
        "biteDamage": "150",
        "sprintSpeed": "55.6",
        "stamina": "2.15"
    },
    "recommendedMutations": [
        {
            "name": "Reabsorption",
            "description": "Recover a small amount of water during rainy weather."
        },
        {
            "name": "Gastronomic Regeneration",
            "description": "Eating restores a small amount of health, ~5%."
        },
        {
            "name": "Epidermal Fibrosis",
            "description": "Increase bleed resistance, ~15%."
        }
    ],
    "growthTable": [
        {
            "stage": "Juvenile",
            "weight": "3.76",
            "bite": "120",
            "sprint": "13.8",
            "stamina": "80"
        },
        {
            "stage": "Sub-Adult",
            "weight": "900",
            "bite": "250",
            "sprint": "50.4",
            "stamina": "90"
        },
        {
            "stage": "Adult",
            "weight": "1300",
            "bite": "150",
            "sprint": "55.6",
            "stamina": "2.15"
        }
    ],
    "diet": {
        "alpha": [
            { "name": "Pachycephalosaurus", "location": "Coastal" },
            { "name": "Tenontosaurus", "location": "Riverdelta, Grasslands, Jungles, Island" },
            { "name": "Herrerasaurus", "location": "Jungles, Riverdelta" },
            { "name": "Boar", "location": "All Land Biomes" }
        ],
        "beta": [
            { "name": "Omniraptor", "location": "Grasslands, Jungles" },
            { "name": "Diabloceratops", "location": "Highland, Grassland" },
            { "name": "Troodon", "location": "Coastal, Grasslands, Highlands" },
            { "name": "Deer", "location": "All Land Biomes" }
        ],
        "gamma": [
            { "name": "Dryosaurus", "location": "Grasslands, Riverdelta, Swamp" },
            { "name": "Gallimimus", "location": "Highlands, Grasslands" },
            { "name": "Maiasaura", "location": "Highland, Grassland, Riverdelta" }
        ]
    },
    "combatMatchups": {
        "dataDate": "June 2025 (Patch 0.20.87 HT)",
        "strongAgainst": [
            { "name": "Gallimimus (Solo)", "winRate": 100 },
            { "name": "Omniraptor (Solo)", "winRate": 95 },
            { "name": "Troodon (Solo)", "winRate": 95 },
            { "name": "Dryosaurus", "winRate": 95 },
            { "name": "Pachycephalosaurus (Solo)", "winRate": 82 },
            { "name": "Herrerasaurus", "winRate": 65 }
        ],
        "weakAgainst": [
            { "name": "Troodon (Pack)", "winRate": 50 },
            { "name": "Omniraptor (Pack)", "winRate": 20 },
            { "name": "Tenontosaurus (Solo)", "winRate": 15 },
            { "name": "Stegosaurus", "winRate": 5 },
            { "name": "Diabloceratops (Solo)", "winRate": 5 }
        ]
    },
    "calls": [
        { "name": "Broadcast", "key": "1", "cooldown": "5s", "range": "3.5km", "soundSample": "/audio/dinosaurs/carnotaurus/carno_broadcast_01.mp3" },
        { "name": "Friendly", "key": "2", "cooldown": "3s", "range": "350m", "soundSample": "/audio/dinosaurs/carnotaurus/carno_attract_01.mp3" },
        { "name": "Threaten", "key": "3", "cooldown": "3s", "range": "350m", "soundSample": "/audio/dinosaurs/carnotaurus/carno_threaten.mp3" },
        { "name": "Danger", "key": "4", "cooldown": "3s", "range": "350m", "soundSample": "/audio/dinosaurs/carnotaurus/carno_danger_01.mp3" }
    ],
    "skins": [
        {
            "src": "/images/carnotaurus/skins/Skin_Carnotaurus_Adult_Male.png",
            "label": "Adult Male"
        },
        {
            "src": "/images/carnotaurus/skins/Skin_Carnotaurus_Adult_Female.png",
            "label": "Adult Female"
        }
    ],
    "survivalTips": [
        "Your speed and instant acceleration is your greatest asset, use it to your advantage",
        "Avoid any animals larger than yourself",
        "Use your charge to quickly close distance to your prey",
        "You are always more likely to survive in a group of 3",
        "Never sprint below 60% stamina",
        "Rest in open areas to better see approaching threats",
        "Use your speed advantage against larger predators and head to jungles to escape"
    ],
    "attacks": [
        {
            "name": "Bite",
            "key": "LMB",
            "description": "Mediocre damage, can be used as a basic attack"
        },
        {
            "name": "Charge",
            "key": "SHIFT + RMB",
            "description": "To initiate, you must be running and holding RMB; can be triggered instantly once running"
        },
        {
            "name": "Alternative Bite",
            "key": "ALT + LMB",
            "description": "Hold alt and aim with your mouse. Standard attack for this playable."
        }
    ],
    "biomeInfo": {
        "preferred": ["Grasslands", "Riverdelta", "Coastal", "Flat Land"],
        "avoid": ["Swamp", "Dense Jungles"]
    },
    "nesting": {
        "eggs": "3-5",
        "incubationTime": "30 minutes",
        "nestType": "Sticks",
        "nestImage": "/images/carnotaurus/Carnotaurus_Nest.png"
    },
    "mapResources": {
        "description": "For detailed map information including AI spawns, danger zones, and nesting areas, visit these comprehensive map resources:",
        "links": [
            {
                "name": "Vulnona Interactive Map",
                "url": "https://vulnona.com/game/map/#",
                "description": "Interactive map with AI spawns, danger zones, and biome information"
            },
            {
                "name": "Isle Maps",
                "url": "https://www.islemaps.com/",
                "description": "Detailed maps and location guides for The Isle"
            }
        ]
    },
    "calculatedStats": {
        "decay": {
            "hunger": -0.022222,
            "thirst": -0.027778
        },
        "timeToZero": {
            "hunger": "1h 15m 0s",
            "thirst": "1h 0m 0s"
        }
    },
    "media": {
        "videos": [
            {
                "title": "CARNOTAURUS: Ultimate Guide & Legacy Comparison - The Isle Evrima",
                "url": "https://www.youtube.com/embed/CGYPYJx0sOI",
                "description": "CARNOTAURUS: Official Guide & Tips"
            },
            {
                "title": "EVRIMA GUIDE - Carnotaurus (2025)",
                "url": "https://www.youtube.com/embed/2nbsYdU-qKI?si=bO-4Zx0ndogXqR-0",
                "description": "CARNOTAURUS: Combat Guide"
            }
        ]
    },
    "notes": {
        "adultStamina": {
            "title": "Adult Stamina",
            "source": "Doqi"
        }
    }
}
---

# Carnotaurus

## Game Description

Stalk the plains as the terrifying Carnotaurus, the absolute nightmare of every small critter as this ravenous mouth-on-legs blitzes across the island. Whilst it lacks maneuverability of the nimble Omniraptor, its insane speed and ability to knock others down more than makes up for it. Be sure to look left and right before crossing the street!

Official The Isle Roadmap

*Carnotaurus* is a genus of theropod dinosaur in The Isle. It is a medium-sized carnivorous dinosaur known for its distinctive horns above its eyes and powerful bite force. As the fastest dinosaur in the game, it is well-suited for ambush hunting and hit-and-run tactics.

---

## Overview

The Carnotaurus is a medium-sized carnivorous dinosaur known for its distinctive horns above its eyes and powerful bite force. As the fastest dinosaur in the game, it is well-suited for ambush hunting and hit-and-run tactics.
