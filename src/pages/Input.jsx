import { useState, useRef, useEffect } from 'react'
import { useBrush, Artboard } from '@/lib/react-artboard'
import { supabase } from '@/lib/supabase/client'

export default function Input() {
  const [color, setColor] = useState('#993366')
  const [strokeWidth, setStrokeWidth] = useState(40)
  // const [size, setSize] = useState({ width: 0, height: 0 })
  const brush = useBrush({ color, strokeWidth })
  const artboardRef = useRef()
  const wrapperRef = useRef()

  const handleUpload = async () => {
    if (!artboardRef.current) return

    const ctx = artboardRef.current.context
    const canvas = ctx.canvas

    // Force fully transparent background
    ctx.save()
    ctx.globalCompositeOperation = 'destination-over'
    ctx.fillStyle = 'rgba(0,0,0,0)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.restore()
    const dataUrl = artboardRef.current.getImageAsDataUri('image/png')
    if (!dataUrl) throw new Error('Failed to upload image')

    // Convert to Blob → File
    const blob = await (await fetch(dataUrl)).blob()
    const file = new File([blob], `${Date.now()}.png`, { type: 'image/png' })
    const path = `${Date.now()}.png`

    // Upload to Supabase Storage
    const { error } = await supabase.storage.from('images').upload(path, file, { upsert: false })
    if (error) throw error

    // Get public URL
    const { data: publicData } = supabase.storage.from('images').getPublicUrl(path)

    // Store reference in database
    await supabase.from('images').insert([{ image_url: publicData.publicUrl }])

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    artboardRef.current.clear()
  }

  // useEffect(() => {
  //   if (!wrapperRef.current) return
  //   const observer = new ResizeObserver(([entry]) => {
  //     setSize(entry.contentRect)
  //   })
  //   observer.observe(wrapperRef.current)
  //   return () => observer.disconnect()
  // }, [wrapperRef])

  return (
    <main className="flex flex-col gap-2 bg-amber-50 px-12 py-8">
      <h1 className="font-[palatino-linotype] text-3xl font-bold text-[#db452c]">
        The Pavilion of Floating Thoughts
        <span className="font-[hellofont-id-aqingranti] text-3xl">《浮思亭》</span>
      </h1>
      <p className="font-[palatino-linotype]">
        The Chinese have long released water lanterns
        <br />
        to express hopes, blessings, and remembrance.
        <br />
        During the Hungry Ghost Festival <br /> the lanterns guide spirits to the afterlife.
      </p>
      <p className="font-[palatino-linotype]">
        Now, it's your turn to give it a try. <br />
        Pick a color
        <br />
        and write a wish in the box below.
      </p>
      <p className="font-[palatino-linotype]">
        When you are done, click 'Set afloat'. <br />
        Watch the big screen on the right.
        <br /> The screen will refresh, <br /> and a lantern with your wish will appear.
      </p>
      <div className="flex max-w-[87vw] justify-between pt-4">
        <div className="flex gap-4">
          <input type="color" value={color} onInput={(e) => setColor(e.target.value)} />

          <input
            type="range"
            min={5}
            max={50}
            value={strokeWidth}
            onInput={(e) => setStrokeWidth(parseInt(e.target.value))}
          />

          <button
            className="border-[#db452c] font-[palatino-linotype] text-[#db452c]"
            onClick={() => {
              const ctx = artboardRef.current.context
              ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
              artboardRef.current.clear()
            }}
          >
            Clear drawing
          </button>
        </div>

        <button
          className="rounded-md bg-[#db452c] p-2 font-[palatino-linotype] text-white hover:bg-[#bf3a27] active:bg-[#a83221]"
          onClick={handleUpload}
        >
          Set afloat
        </button>
      </div>
      <div
        ref={wrapperRef}
        className="w-full"
        style={{
          height: 'calc(100vh * 189 / 187)',
        }}
      >
        <Artboard
          ref={artboardRef}
          tool={brush}
          className="border border-black"
          style={{
            width: '87vw',
            height: 'calc(87vw * 189 / 187)',
          }}
        />
      </div>
    </main>
  )
}
