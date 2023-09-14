import { DB, readDB, writeDB } from "@/app/libs/DB";
import { checkToken } from "@/app/libs/checkToken";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import jwt from "jsonwebtoken";
import { indexOf, lastIndexOf } from "lodash";

export const GET = async () => {
  readDB();

  return NextResponse.json({
    ok: true,
    rooms: DB.rooms,
    totalRooms: lastIndexOf(DB.rooms),
  });
};

export const POST = async (request) => {
  readDB();
  const payload = checkToken();
  const body = await request.json();
  const { roomName } = body;
  if (payload == null) {
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid token",
      },
      { status: 401 }
    );
  }

  readDB();

  const foundDupe = DB.rooms.find((std) => std.roomName === roomName);
  if (foundDupe) {
    return NextResponse.json(
      {
        ok: false,
        message: `Room ${roomName} already exists`,
      },
      { status: 400 }
    );
  }

  const roomId = nanoid();

  //call writeDB after modifying Database
  DB.rooms.push({
    roomId,
    roomName,
  });
  writeDB();

  return NextResponse.json({
    ok: true,
    roomId,
    message: `Room ${body.roomName} has been created`,
  });
};
