export interface ProfilePhoto {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export const PROFILE_PHOTOS = [
  {
    src: "/img/profile/profile-1.png",
    alt: "Alfian Nur Usyaid standing before a hot-air-balloon landscape",
    width: 800,
    height: 1200,
  },
  {
    src: "/img/profile/profile-2.jpg",
    alt: "Alfian Nur Usyaid holding a small bucket beside water tanks",
    width: 720,
    height: 1280,
  },
  {
    src: "/img/profile/profile-3.jpg",
    alt: "Formal portrait of Alfian Nur Usyaid in a white shirt against a red background",
    width: 800,
    height: 1200,
  },
  {
    src: "/img/profile/profile-4.jpg",
    alt: "Outdoor selfie of Alfian Nur Usyaid wearing a dark jacket",
    width: 800,
    height: 1067,
  },
] as const satisfies readonly ProfilePhoto[];

export const PRIMARY_PROFILE_PHOTO = PROFILE_PHOTOS[0];
