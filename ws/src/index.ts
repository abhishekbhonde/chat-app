import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 8080 });

interface SocketProps {
  room: string;
  socket: WebSocket;
}

let allSockets: SocketProps[] = [];

wss.on("connection", (socket) => {
  socket.on("message", (message) => {
    try {
      // Parse the incoming message
      const parsedMessage = JSON.parse(message.toString());

      // Handle "join" logic
      if (parsedMessage.type === "join") {
        const { roomId } = parsedMessage.payload;

        if (!roomId) {
          socket.send(
            JSON.stringify({
              type: "error",
              message: "Room ID is required to join a room.",
            })
          );
          return;
        }

        allSockets.push({ socket, room: roomId });
        console.log(`Socket joined room: ${roomId}`);
      }

      // Handle "chat" logic
      if (parsedMessage.type === "chat") {
        const currentRoom = allSockets.find((x) => x.socket === socket)?.room;

        if (!currentRoom) {
          socket.send(
            JSON.stringify({
              type: "error",
              message: "You must join a room before sending messages.",
            })
          );
          return;
        }

        const messageText = parsedMessage.payload?.message;
        if (!messageText) {
          socket.send(
            JSON.stringify({
              type: "error",
              message: "Message text cannot be empty.",
            })
          );
          return;
        }

        const currentRoomUsers = allSockets.filter((x) => x.room === currentRoom);

        currentRoomUsers.forEach((user) => {
          user.socket.send(
            JSON.stringify({
              type: "chat",
              payload: { message: messageText, room: currentRoom },
            })
          );
        });

        console.log(`Message sent to room ${currentRoom}: ${messageText}`);
      }
    } catch (error) {
      console.error("Failed to process message:", error);
      socket.send(
        JSON.stringify({
          type: "error",
          message: "Invalid message format.",
        })
      );
    }
  });

  // Cleanup disconnected sockets
  socket.on("close", () => {
    allSockets = allSockets.filter((x) => x.socket !== socket);
    console.log("Socket disconnected");
  });
});
