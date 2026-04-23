export enum StorageKey {
    SESSION = "session",
    USER = "user",
}

export enum Tiles {
    CORNER   = "plane_corner",
    HOLE     = "plane_hole",
    PARALLEL = "plane_parallel",
    U        = "plane_u",
    WALL     = "plane_wall",
    PLANE_45 = "plane_45",
    PLANE    = "plane",
    LOOP     = "loop",
    RAMP_15_NO_WALLS    = "ramp_15_no_walls",
    RAMP_15_WALL_LEFT   = "ramp_15_wall_left",
    RAMP_15_WALL_RIGHT  = "ramp_15_wall_right",
    RAMP_15_TWO_WALLS   = "ramp_15_two_walls",
}

export enum Textures {
    GRASS_NORMAL = "grass_normal",
}

export enum Color {
    LIGHT_GREEN   = 0x00cc00,
    DARK_GREEN    = 0x00aa00,
}

export enum BodyType {
    DYNAMIC,
    KINEMATIC,
    STATIC,
}

export enum CameraType {
    FREE,
    TARGET,
}

export enum MatchMode {
    SINGLEPLAYER,
    MULTIPLAYER,
}