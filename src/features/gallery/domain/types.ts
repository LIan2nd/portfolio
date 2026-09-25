export interface GalleryItem {
  id: string;
  title: string;
  description: string;
  alt: string;
  imageUrl: string;
  objectKey: string;
  width: number;
  height: number;
  takenAt?: string;
  createdAt: string;
}

export interface GalleryInput {
  title: string;
  description: string;
  alt?: string;
  objectKey: string;
  width: number;
  height: number;
  takenAt?: string;
}

export interface GalleryUpdateInput {
  title: string;
  description: string;
  alt?: string;
  takenAt?: string;
}

export interface GalleryUploadRequest {
  fileName: string;
  contentType: string;
  size: number;
}

export interface GalleryUploadTicket {
  uploadUrl: string;
  objectKey: string;
  publicUrl: string;
  expiresIn: number;
}
