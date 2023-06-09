import Ray from "./ray";
import { ShapeT } from "./shape";
import Vector from "./vector";
import { Path } from "./path";
import { Paths } from "./paths";
import { Box } from "./box";
import Hit, { NoHit } from "./hit";
import { rayIntersectsPolyline } from "./util";

export class Polyline implements ShapeT {
  path: Path[]
  bounds: Box

  constructor(pathOrPaths: Path | Path[], bounds: Box) {
    this.path = toPaths(pathOrPaths)
    this.bounds = bounds
  }

  compile() {
    // noop
  }

  boundingBox(): Box {
    return this.bounds;
  }

  contains(_v: Vector, _f: number): boolean {
    return false
  }

  intersect(r: Ray): Hit {
    const rayIntersects = rayIntersectsPolyline(r, this.path, this.bounds)
    if (rayIntersects.hit === false) {
      return NoHit
    } else {
      return new Hit(this, rayIntersects.hitDistance)
    }
  }

  paths(): Paths {
    return this.path
  }
}

function toPaths(path: Path | Path[]): Path[] {
  if (path.length === 0) {
    return []
  }
  if (path[0] instanceof Vector) {
    return [path as Path]
  }
  return path as Path[]
}