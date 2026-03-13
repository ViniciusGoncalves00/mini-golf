import Peer, { DataConnection } from "peerjs";

export class PeerNetwork {

  private peer: Peer;
  private connections: DataConnection[] = [];

  public onReceive: ((data: any) => void)[] = [];

  constructor() {

    this.peer = new Peer();

    this.peer.on("open", (id) => {
      console.log("Room ID:", id);
      const MyID = document.getElementById("MyID")!;
      MyID.innerText = id;
    });

    this.peer.on("connection", (conn) => {
      console.log("Player joined:", conn.peer);

      this.connections.push(conn);

      this.setupConnection(conn);
    });
  }

  private setupConnection(conn: DataConnection) {

    conn.on("data", (data) => {
      console.log("Received:", data);
      this.onReceive.forEach((callback) => callback(data));
    });

    conn.on("close", () => {
      console.log("Player disconnected");
      this.connections = this.connections.filter(c => c !== conn);
    });

  }

  joinRoom(roomId: string) {

    const connection = this.peer.connect(roomId);

    connection.on("open", () => {
      console.log("Connected to room:", roomId);
      this.connections.push(connection);
    });

    this.setupConnection(connection);
  }

  send(data: any) {

    for (const conn of this.connections) {
      if (conn.open) conn.send(data);
    }

  }



  getRoomId() {
    return this.peer.id;
  }

}