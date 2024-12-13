import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({port:8080})
interface socketProps {
    room:string,
    socket:WebSocket
}

let allSocket : socketProps[] = []
wss.on("connection", function(socket){
    socket.on("message", function(message){
        // @ts-ignore
        // by default message is string that's why we need to convert it to the object
        const parsedMessage = JSON.parse(message)
        // join room logic
        if(parsedMessage.type==="join"){
            allSocket.push({
                socket,
                room:parsedMessage.playload.roomId
            })
        }
        if(parsedMessage.type==="chat"){
            // @ts-ignore
          const currentRoom = allSocket.find((x)=>x.socket==socket).room
          const currentRoomUsers = allSocket.filter((x)=>x.room==currentRoom)
          //@ts-ignore
          currentRoomUsers.forEach(element => {
            element.socket.send(parsedMessage.playload.message)
          });
        }
    })
})
















// join

// {
//     "type":"join",
//     playload:{
//         message:"join here",
//         roomId:"lksdjf"
//     }
// }