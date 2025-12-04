export function wrap(body, minX, maxX) {
  const t = body.translation()
  const v = body.linvel()

  if (t.x > maxX) {
    body.setTranslation({ x: minX, y: 0.0178, z: t.z }, true)
    body.setLinvel({ x: v.x, y: 0, z: v.z }, true)
  }

  if (t.x < minX) {
    body.setTranslation({ x: maxX, y: 0.0178, z: t.z }, true)
    body.setLinvel({ x: v.x, y: 0, z: v.z }, true)
  }
}
