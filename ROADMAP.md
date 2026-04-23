# Roadmap

This document describes the planned evolution of the project.

The roadmap is organized by **phases**, representing major milestones.

The dates presented are not planned start or end dates for a task, but rather the date on which, to my understanding, the task was completed.

# Phase 0 — Planning - [11/03/2026]

1. Understand how a golf and mini-golf games works.
2. Understand what's makes a golf / mini-golf game fun to play.
3. To plan the project.

# Phase 1 — Minimum Playable Game - [12/03/2026]

Establish the base systems to a golf game, that things that make a golf game... a golf game.

- [✔] To hit the ball with a club. [12/03/2026]
- [✔] Choose the force to apply to the ball. [12/03/2026]
- [✔] Choosing the direction of the shot. [12/03/2026]
- [✔] Check if the ball is in a specific region. [12/03/2026]

# Phase 2 — Main Features - [12/03/2026 - 24/03/2026]

Add basic behaviors that allow for an understanding of what is happening.

- [✔] Add visualization and feedback to user. [16/03/2026]
    - [✔] Shot direction. [12/03/2026]
    - [✔] Shot strength. [16/03/2026]
    - [✔] The ball is in the area. [16/03/2026]
- [✔] Adding movement to the ball over time. [12/03/2026]
- [✔] Add basic physics. [24/03/2026]
    - [✔] The ball collide with board bounding box. [15/03/2026]
    - [✔] The ball loses speed as it goes up and gains speed as it goes down. [24/03/2026]
- [✔] Allow multiplayer matches. [13/03/2026]
- [✔] Others. [17/03/2026]
    - [✔] The camera follows the ball. [17/03/2026]

# Phase 3 — General Features

Add most of the game's elements, such as user interface, sounds, improves the experience, etc.

* [ ] Add more physics.
    * [✔] The ball loses speed based on the terrain. [24/03/2026]
    * [✔] The ball loses speed based on the collision. [24/03/2026]
    * [✔] Apply a continuous physics detection. [03/04/2026]
    * [✔] The ball collide with other balls. [21/04/2026]
    * [ ] Add support to handle with rigid bodies (static, kinematic and dynamics).
* [ ] UI elements.
    * [✔] Main Menu. [18/04/2026]
    * [ ] Multiplayer Menu.
    * [ ] Settings Menu.
    * [ ] Credits Menu.
    * [ ] Game Menu.
        * [ ] Show the minimum shots.
        * [ ] Show the total shots.
        * [ ] Show the courses table.
* [ ] FX
    * [ ] On collision ("dust")
    * [ ] Ball tail
* [ ] SFX
    * [ ] On collision
    * [ ] On shot

# Phase 4 — Continuous Improvements

# Ideas

* Add support to cross-platform (tauri)
* Map Editor
* Ranking
