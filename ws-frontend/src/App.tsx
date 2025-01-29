import React, { useEffect, useRef, useState } from "react";
import "./App.css";

export default function App() {
  const [roomId, setRoomId] = useState<string>(""); // Room ID
  const [message, setMessage] = useState<string>(""); // Message
  const [messages, setMessages] = useState<{ room: string; message: string }[]>([]); // Chat messages
  const [joinedRoom, setJoinedRoom] = useState<boolean>(false); // Room joined state
  const [error, setError] = useState<string>(""); // Error message
  const wsRef = useRef<WebSocket | null>(null); // WebSocket reference

  useEffect(() => {
    const ws = new WebSocket("https://chat-app-1-nupk.onrender.com/");

    ws.onopen = () => {
      console.log("WebSocket connected!");
    };

    ws.onmessage = (event) => {
      try {
        const parsedMessage = JSON.parse(event.data);
        if (parsedMessage.type === "chat" && parsedMessage.payload) {
          setMessages((prev) => [
            ...prev,
            { room: parsedMessage.payload.room, message: parsedMessage.payload.message },
          ]);
        }
      } catch (err) {
        console.error("Failed to process message:", err);
      }
    };

    wsRef.current = ws;

    return () => {
      ws.close();
      console.log("WebSocket disconnected!");
    };
  }, []);

  const joinRoom = () => {
    if (!roomId) {
      setError("Room ID cannot be empty!");
      return;
    }
    setError("");

    if (wsRef.current) {
      wsRef.current.send(
        JSON.stringify({
          type: "join",
          payload: { roomId },
        })
      );
      setJoinedRoom(true);
      setTimeout(() => setJoinedRoom(false), 2000); // Show confirmation for 2 seconds
      setRoomId(""); // Clear the input
      console.log(`Joined room: ${roomId}`);
    }
  };

  const sendMessage = () => {
    if (message && wsRef.current) {
      wsRef.current.send(
        JSON.stringify({
          type: "chat",
          payload: { message },
        })
      );
      setMessage(""); // Clear input
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-6">
      {/* Header */}
      <div className="w-full max-w-3xl bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 p-6 rounded-lg shadow-xl mb-6 text-center">
        <h1 className="text-3xl font-bold text-white tracking-wide drop-shadow-lg">
          🌌 Dark Chat Room
        </h1>
        <p className="text-gray-400 mt-2">
          Join a room to start chatting with style in the dark.
        </p>
      </div>

      {/* Join Room Section */}
      <div className="w-full max-w-3xl flex flex-col gap-4 mb-6">
        {error && <div className="text-red-500 text-sm">{error}</div>}
        {joinedRoom && (
          <div className="text-green-500 text-sm">
            Successfully joined room: <strong>{roomId}</strong>
          </div>
        )}
        <div className="flex items-center gap-4">
          <input
            type="text"
            className="flex-1 p-4 bg-gray-800 text-white rounded-lg shadow-lg focus:ring-2 focus:ring-purple-500 focus:outline-none placeholder-gray-500"
            placeholder="Enter Room ID (e.g., room1)"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
          <button
            onClick={joinRoom}
            className="p-4 bg-gradient-to-r from-purple-700 to-purple-900 text-white rounded-lg shadow-md hover:from-purple-600 hover:to-purple-800 active:scale-95 transition-transform"
          >
            Join Room
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="w-full max-w-3xl flex-1 bg-gray-800 bg-opacity-90 rounded-lg shadow-lg p-6 overflow-y-auto">
        {messages.length > 0 ? (
          messages.map((msg, index) => (
            <div
              key={index}
              className="mb-4 p-3 rounded-lg bg-gradient-to-r from-gray-700 to-gray-800 shadow-md text-sm text-gray-200"
            >
              <span className="text-purple-500 font-semibold">[{msg.room}]</span>: {msg.message}
            </div>
          ))
        ) : (
          <div className="text-gray-400 text-center">No messages yet...</div>
        )}
      </div>

      {/* Send Message Section */}
      <div className="w-full max-w-3xl mt-6 flex items-center gap-4">
        <input
          type="text"
          className="flex-1 p-4 bg-gray-800 text-white rounded-lg shadow-md focus:ring-2 focus:ring-green-500 focus:outline-none placeholder-gray-500"
          placeholder="Enter your message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          onClick={sendMessage}
          className="p-4 bg-gradient-to-r from-green-700 to-green-900 text-white rounded-lg shadow-md hover:from-green-600 hover:to-green-800 active:scale-95 transition-transform"
        >
          Send
        </button>
      </div>
    </div>
  );
}
