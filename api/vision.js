export default async function handler(req, res) {

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {

    const { image } = req.body

    if (!image) {
      return res.status(400).json({ error: 'Missing image' })
    }

    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_VISION_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [
            {
              image: { content: image },
              features: [
                { type: 'DOCUMENT_TEXT_DETECTION' }
              ]
            }
          ]
        })
      }
    )

    const data = await response.json()

    const text =
      data.responses?.[0]?.fullTextAnnotation?.text || ''

    return res.status(200).json({ text })

  } catch (err) {

    console.error(err)

    return res.status(500).json({
      error: 'Vision API failed'
    })
  }
}