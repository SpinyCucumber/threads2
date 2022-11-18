import { test, expect } from "@jest/globals";
import { Piece } from "./piece";

test("should check for connection", () => {
    const piece = new Piece(0, 0b100101, 1);
    expect(piece.hasConnection(0)).toBeTruthy();
    expect(piece.hasConnection(1)).toBeFalsy();
    expect(piece.hasConnection(2)).toBeFalsy();
    expect(piece.hasConnection(3)).toBeTruthy();
    expect(piece.hasConnection(4)).toBeFalsy();
    expect(piece.hasConnection(5)).toBeTruthy();
});