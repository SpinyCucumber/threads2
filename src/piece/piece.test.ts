import { test, expect } from "@jest/globals";
import { Piece } from "./piece";
import Immutable from "immutable";

test("should check for connection", () => {
    const piece = new Piece(0, 0b100101, 1);
    expect(piece.hasConnection(0)).toBeTruthy();
    expect(piece.hasConnection(1)).toBeFalsy();
    expect(piece.hasConnection(2)).toBeFalsy();
    expect(piece.hasConnection(3)).toBeTruthy();
    expect(piece.hasConnection(4)).toBeFalsy();
    expect(piece.hasConnection(5)).toBeTruthy();
});

test("should compute connection list", () => {
    const piece = new Piece(0, 0b100101, 1);
    expect(piece.connectionList).toEqual(Immutable.List([0, 3, 5]));
});