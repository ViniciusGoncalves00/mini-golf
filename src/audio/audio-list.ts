import { AudioKey } from "./audio-API";
let base = import.meta.env.BASE_URL;
base = `${base}/sounds/`;

export const sounds = new Map<AudioKey, string[]>([
    [AudioKey.SHOT       , [`${base}/sfx/club/weak_sharp_1.mp3`, `${base}/sfx/club/medium_1.mp3`, `${base}/sfx/club/medium_2.mp3`, `${base}/sfx/club/strong_1.mp3`, `${base}/sfx/club/strong_2.mp3`]],
    [AudioKey.SHOT_WEAK  , [`${base}/sfx/club/weak_sharp_1.mp3`]],
    [AudioKey.SHOT_MEDIUM, [`${base}/sfx/club/medium_1.mp3`, `${base}/sfx/club/medium_2.mp3`,]],
    [AudioKey.SHOT_STRONG, [`${base}/sfx/club/strong_1.mp3`, `${base}/sfx/club/strong_2.mp3`]],
    [AudioKey.SHOT_CANCEL, [`${base}/sfx/club/free.mp3`]],
    [AudioKey.GRASS,       [`${base}/sfx/club/grass_1.mp3`, `${base}/sfx/club/grass_2.mp3`, `${base}/sfx/club/grass_3.mp3`]],
]);

// export enum AudioList {
//     WEAK_SHARP_1 = "weak_sharp_1",
//     MEDIUM_1 = "medium_1",
//     MEDIUM_2 = "medium_2",
//     STRONG_1 = "strong_1",
//     STRONG_2 = "strong_2",
//     FAIL_1 = "fail_1",
//     FAIL_2 = "fail_2",
//     MUFFLED = "muffled",
//     FREE = "free",
// }