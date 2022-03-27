import { Socket } from "socket.io";
import { SocketUserPayload } from "./socket-user-payload";

export interface MySocket extends Socket 
{
  currentUser?: SocketUserPayload;
  roomId?: string;
}