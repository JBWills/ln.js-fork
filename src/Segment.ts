
import Vector from "./vector"

export class Segment {
  p1: Vector

  p2: Vector

  constructor(p1: Vector, p2: Vector) {
    this.p1 = p1
    this.p2 = p2
  }

  public get lengthSquared(): number {
    return this.p1.distSquared(this.p2)
  }
}
