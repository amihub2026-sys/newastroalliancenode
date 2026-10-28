/**
 * Homepage illustration gallery. These are sample wedding photographs, NOT
 * verified Astro Alliance customer success stories.
 *
 * To publish a real story, first obtain explicit permission from both people;
 * replace the JPG at the indicated path and update text only with approved facts.
 * The sample badge should remain until real couples grant publishing consent.
 */
export interface SuccessStoryPhoto {
  readonly id: string;
  readonly src: string;
  readonly alt: string;
  readonly captionEn: string;
  readonly captionTa: string;
  readonly sample: boolean;
}

export const SUCCESS_STORY_PHOTOS: readonly SuccessStoryPhoto[] = [
  {
    id: 'story-01',
    src: 'assets/success-stories/story-01.jpg',
    alt: 'South Indian couple smiling during a wedding celebration',
    captionEn: 'Joy in every little moment',
    captionTa: 'ஒவ்வொரு தருணத்திலும் மகிழ்ச்சி',
    sample: true
  },
  {
    id: 'story-02',
    src: 'assets/success-stories/story-02.jpg',
    alt: 'Bride and groom sharing a joyful wedding moment',
    captionEn: 'A beautiful new beginning',
    captionTa: 'அழகான புதிய தொடக்கம்',
    sample: true
  },
  {
    id: 'story-03',
    src: 'assets/success-stories/story-03.jpg',
    alt: 'Traditional South Indian bride and groom in wedding attire',
    captionEn: 'Together with love and blessings',
    captionTa: 'அன்பும் ஆசீர்வாதமும் நிறைந்த இணைவு',
    sample: true
  }
];
