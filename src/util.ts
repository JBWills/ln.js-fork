

import Vector from './vector'
import { Path } from "./path"
import { Segment } from "./Segment"
import Ray from './ray'
import { Box } from './box'


function toPolylines(polyline: Path | Path[]): Path[] {
  if (polyline.length === 0) {
    return polyline as []
  }

  if (Array.isArray(polyline[0])) {
    return polyline as Path[]
  }

  return [polyline] as Path[]
}

export function* segments(polylineArg: Path | Path[]): Generator<Segment> {
  const polylines = toPolylines(polylineArg)

  for (const polyline of polylines) {
    let lastVertex: Vector | undefined = undefined

    for (const vertex of polyline) {
      if (lastVertex !== undefined) {
        yield new Segment(lastVertex, vertex)
      }

      lastVertex = vertex
    }
  }
}

export function rayIntersectsPolyline(
  ray: Ray,
  polylines: Path[],
  polylineBounds: Box
): { hit: true; hitDistance: number } | { hit: false } {
  if (!polylineBounds.intersect(ray)) {
    return { hit: false }
  }

  let closestHit: { hit: true; hitDistance: number } | undefined
  for (const polyline of polylines) {
    let lastVertex: Vector | undefined = undefined

    for (const vertex of polyline) {
      if (lastVertex !== undefined) {
        const segment =  new Segment(lastVertex, vertex)
        const maybeHit = rayHitSegment(ray, segment)
        if (maybeHit) {
          closestHit = {
            hit: true,
            hitDistance: Math.min(closestHit?.hitDistance ?? Number.MAX_SAFE_INTEGER, maybeHit),
          }
        }
      }

      lastVertex = vertex
    }
  }

  return closestHit ?? { hit: false }
}

const coPlanerThreshold = 0.7
const lengthErrorThreshold = 1e-3

function rayHitSegment(ray: Ray, segment: Segment): number | undefined {
  const rayDirection = ray.direction
  const rayOrigin = ray.origin
  const segmentDelta = segment.p2.sub(segment.p1)
  const segmentStartToRayOrigin = segment.p1.sub(rayOrigin)

  if (
    Math.abs(segmentStartToRayOrigin.dot(rayDirection.cross(segmentDelta))) >= coPlanerThreshold
  ) {
    // Lines are not coplanar
    return undefined
  }

  const s =
    segmentStartToRayOrigin.cross(segmentDelta).dot(rayDirection.cross(segmentDelta)) /
    rayDirection.cross(segmentDelta).lengthSquared()

  if (s >= 0.0 && s <= 1.0) {
    const distance =rayDirection.mul( s)
    // Means we have an intersection
    const intersection = rayOrigin.add( distance)

    // See if this lies on the segment
    if (
      intersection.distSquared(segment.p1) + intersection.distSquared(segment.p2) <=
      segment.lengthSquared + lengthErrorThreshold
    ) {
      return distance.length()
    }
  }

  return undefined
}
