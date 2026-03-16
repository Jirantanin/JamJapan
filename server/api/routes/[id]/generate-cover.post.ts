import { GoogleGenerativeAI } from '@google/generative-ai'
import { v2 as cloudinary } from 'cloudinary'
import getPrisma from '../../../utils/prisma'
import { transformRoute } from '../../../utils/transform'
import { requireAdmin } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Route ID is required' })
  }

  const prisma = await getPrisma()
  const route = await prisma.route.findUnique({ where: { id } })
  if (!route) {
    throw createError({ statusCode: 404, statusMessage: 'Route not found' })
  }

  // Validate env vars
  const geminiKey = process.env.GEMINI_API_KEY
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const cloudApiKey = process.env.CLOUDINARY_API_KEY
  const cloudApiSecret = process.env.CLOUDINARY_API_SECRET

  if (!geminiKey) {
    throw createError({ statusCode: 500, statusMessage: 'GEMINI_API_KEY not configured' })
  }
  if (!cloudName || !cloudApiKey || !cloudApiSecret) {
    throw createError({ statusCode: 500, statusMessage: 'Cloudinary credentials not configured' })
  }

  // Build prompt from route data
  const prompt = `Generate a beautiful, photorealistic cover image for a walking route guide in Japan.

Route: ${route.title}
City: ${route.city}
Description: ${route.description}

Style: Photograph-style, vibrant colors, daytime or golden hour lighting, showing a Japanese street scene or landmark relevant to this walking route. Include recognizable Japanese architectural elements, signage, or scenery. The image should feel inviting and inspire travelers to walk this route. No text or watermarks.`

  // Generate image via Gemini
  const genAI = new GoogleGenerativeAI(geminiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image' })

  const response = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
  })

  const parts = response.response.candidates?.[0]?.content?.parts ?? []
  const imagePart = parts.find((p: any) => p.inlineData)

  if (!imagePart?.inlineData?.data) {
    throw createError({ statusCode: 502, statusMessage: 'Gemini did not return an image' })
  }

  // Upload to Cloudinary
  cloudinary.config({
    cloud_name: cloudName,
    api_key: cloudApiKey,
    api_secret: cloudApiSecret,
  })

  const dataUri = `data:image/png;base64,${imagePart.inlineData.data}`

  const uploadResult = await cloudinary.uploader.upload(dataUri, {
    folder: 'jamjapan/covers',
    public_id: id,
    overwrite: true,
    transformation: [{ width: 1200, crop: 'limit', quality: 'auto', fetch_format: 'webp' }],
    eager: [{ width: 400, crop: 'limit', quality: 'auto', fetch_format: 'webp' }],
  })

  const fullUrl = uploadResult.secure_url
  const thumbUrl = uploadResult.eager?.[0]?.secure_url || fullUrl

  // Update DB
  const updated = await prisma.route.update({
    where: { id },
    data: {
      coverImage: fullUrl,
      coverImageThumb: thumbUrl,
    },
    include: {
      steps: true,
      createdBy: { select: { id: true, name: true, avatar: true } },
    },
  })

  return transformRoute(updated)
})
