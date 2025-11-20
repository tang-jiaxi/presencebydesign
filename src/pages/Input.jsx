import { useState } from 'react'
import { useBrush, Artboard } from 'react-artboard'
import { supabase } from '@/lib/supabase/client'

export default function App() {
  const [color, setColor] = useState('#993366')
  const [strokeWidth, setStrokeWidth] = useState(40)
  const brush = useBrush({ color, strokeWidth })
  const [artboardRef, setArtboardRef] = useState(null)

  const handleUpload = async () => {
    if (!artboardRef) return

    // Get PNG from Artboard
    const dataUrl = artboardRef.getImageAsDataUri('image/png')
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

    artboardRef.clear()
  }

  return (
    <main className="flex flex-col gap-4 p-4">
      <div className="flex gap-4">
        <button onClick={handleUpload}>Upload</button>

        <input type="color" value={color} onInput={(e) => setColor(e.target.value)} />

        <input
          type="range"
          min={5}
          max={50}
          value={strokeWidth}
          onInput={(e) => setStrokeWidth(parseInt(e.target.value))}
        />

        <button onClick={() => artboardRef?.clear()}>Clear</button>
      </div>

      <Artboard
        tool={brush}
        style={{ width: 800, height: 600 }}
        className="border border-black"
        ref={setArtboardRef}
      />
    </main>
  )
}
