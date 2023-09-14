import { DB, readDB, writeDB } from "@/app/libs/DB";
import { checkToken } from "@/app/libs/checkToken";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";

export const GET = async (request) => {
  readDB();
  const roomId = request.nextUrl.searchParams.get("roomId");

  if (!roomId) {
    return NextResponse.json(
      {
        ok: false,
        message: `Room is not found`,
      },
      { status: 404 }
    );
  }
  let filtered = DB.messages;
  if (roomId) {
    filtered = filtered.filter((std) => std.roomId === roomId);
  }
  return NextResponse.json({ ok: true, message: filtered });
};

export const POST = async (request) => {
  readDB();
  const body = await request.json();
  const { roomId, messageText } = body;
  if (!roomId)
    return NextResponse.json(
      {
        ok: false,
        message: `Room is not found`,
      },
      { status: 404 }
    );

  const messageId = nanoid();

  DB.messages.push({
    messageId,
    message: messageText,
  });
  writeDB();

  return NextResponse.json({
    ok: true,
    messageId,
    message: "Message has been sent",
  });
};

export const DELETE = async (request) => {
  const payload = checkToken();

  if (payload == null || payload.role !== "SUPER_ADMIN")
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid token",
      },
      { status: 401 }
    );

  readDB();
  const body = await request.json();
  const { messageId } = body;

  const foundIndex = DB.messages.findIndex((x) => x.messageId === messageId);
  if (foundIndex === -1) {
    return NextResponse.json(
      {
        ok: false,
        message: "Message is not found",
      },
      { status: 404 }
    );
  }
  DB.messages.splice(foundIndex, 1);
  writeDB();

  return NextResponse.json({
    ok: true,
    message: "Message has been deleted",
  });
};
