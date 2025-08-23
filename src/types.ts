export interface CapsuleFileMeta {
  name: string
  type: string
  size: number
}

export interface Capsule {
  id: string
  ownerEmail: string
  title: string
  description: string
  deliveryAt: string // ISO
  isPublic: boolean
  secretKey: string
  unlockUrl: string
  createdAt: string // ISO
  files: CapsuleFileMeta[]
  imageUrls?: string[]
}

export interface CreateCapsuleInput {
  title: string
  description?: string
  deliveryAt: string
  isPublic: boolean
  files: File[]
}
