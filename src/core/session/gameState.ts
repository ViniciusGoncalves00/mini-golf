// import * as THREE from "three";
// import { CameraType, MatchMode } from "../common/enums";
// import { level1, level3 } from "../course/courses";
// import { Match } from "../match/match";
// import { Player } from "../match/player";
// import { NetworkClientMessage, NetworkHostMessage, NetworkMessagesTypes } from "../network/networkMessage";
// import { GamePage } from "../ui/GameMenu";
// import { State } from "./state";
// import Alpine from 'alpinejs';
// import { SinglePlayerMatch } from "../match/singleplayer-match";
// import { MultiPlayerMatch } from "../match/multiplayer-match";

// export class GameState extends State {
//     private match: Match | null = null;
//     private matchMode: MatchMode = MatchMode.SINGLEPLAYER;

//     public enterState(): void {
//         (Alpine.store("gamePage") as GamePage).attach();
        
//         switch (this.matchMode) {
//             case MatchMode.SINGLEPLAYER: this.startSinglePlayerMatch(); break;
//             case MatchMode.MULTIPLAYER: this.startMultiplayerMatch(); break;
//             default: break;
//         }
//     }

//     public leaveState(): void {
//         (Alpine.store("gamePage") as GamePage).dettach();

//         this.match = null;
//     }

//     public setMatchMode(mode: MatchMode): void {
//         this.matchMode = mode;
//     }

//     private startSinglePlayerMatch(): void {
//         const player = new Player(this.session.user);
//         const courses = [level3()];

//         const canvas = document.getElementById("game")!;
//         this.match = new SinglePlayerMatch(canvas, courses, player);

//         player.club.onFreeShot.push((force) => {
//             player.ball.rigidBody.unfreeze();
//             player.ball.rigidBody.applyForce(force);
//             player.club.hideDirectionGizmo();
//         })

//         this.match.world.sceneWrapper.renderer.domElement.addEventListener("mousemove", (e) => {
//             player.club.calculateDirection(this.match!.world.cameraWrapper.camera, e, this.match!.world.sceneWrapper.renderer.domElement.getBoundingClientRect(), player.ball)
//         })

//         this.match.world.sceneWrapper.renderer.domElement.addEventListener("mousedown", (e) => {
//             if (e.button == 2) player.club.startShot();
//         })

//         this.match.world.sceneWrapper.renderer.domElement.addEventListener("mouseup", (e) => {
//             if (e.button == 2) player.club.freeShot();
//         })

//         this.match?.world.cameraWrapper.setTargetMode(player.ball.rigidBody);
//         document.addEventListener("keypress", (e) => {
//             if (e.key === "t") {
//                 if (this.match?.world.cameraWrapper.cameraMode === CameraType.FREE) {
//                     this.match?.world.cameraWrapper.setTargetMode(player.ball.rigidBody);
//                 } else if (this.match?.world.cameraWrapper.cameraMode === CameraType.TARGET) {
//                     this.match?.world.cameraWrapper.setFreeMode();
//                 }
//             }
//         })
        
//         Alpine.store("gamePage").users.splice(0);
//         Alpine.store("gamePage").users.push(this.session.user);
//     }

//     private startMultiplayerMatch(): void {
//         if (!this.session.network) return;
    
//         const users = Array.from(this.session.network.users.values());
    
//         const players: Player[] = [];
//         users.values().forEach(user => players.push(new Player(user)));

//         const player = new Player(this.session.user);
//         players.push(player);

//         const courses = [level1()];
//         this.match = new MultiPlayerMatch(document.getElementById("game")!, courses, players);

//         this.setClientSide(player);

//         Alpine.store("gamePage").users.splice(0);
//         Alpine.store("gamePage").users.push(...users);
//     }

//     private setClientSide(player: Player): void {
//         this.match!.world.sceneWrapper.renderer.domElement.addEventListener("mousemove", (e) => {
//             player.club.calculateDirection(this.match!.world.cameraWrapper.camera, e, this.match!.world.sceneWrapper.renderer.domElement.getBoundingClientRect(), player.ball)
//         })

//         this.match!.world.sceneWrapper.renderer.domElement.addEventListener("mousedown", (e) => {
//             if (e.button == 2) player.club.startShot();
//         })

//         this.match!.world.sceneWrapper.renderer.domElement.addEventListener("mouseup", (e) => {
//             if (e.button == 2) player.club.freeShot();
//         })

//         player.club.onFreeShot.push((force) => {
//             const message: NetworkClientMessage = {
//                 type: NetworkMessagesTypes.SHOT_FIRE,
//                 payload: { vector: [force.x, force.y, force.z] },
//             }

//             this.session.network?.send(message);
//         })

//         this.session.network?.onReceiveData.push((peerId, data) => {
//             switch (data.type) {
//                 case NetworkMessagesTypes.SHOT_FIRE:
//                     if (!this.session.match) return;
//                     const match = this.session.match as MultiPlayerMatch;
//                     const player = match.players.find(player => player.user.ID === peerId);
//                     if (!player) return;

//                     player.ball.rigidBody.unfreeze();
//                     player.ball.rigidBody.applyForce(new THREE.Vector3(...data.payload.vector));
//                     break;
//                 default:
//                     break;
//             }
//         })
//     }
// }
