export interface TitleConfig {
  videoIdea: string;
  keywords: string[];
  niche: string;
  format: string;
  audience: string[];
  tone: string;
  maturity: string;
}

export interface TitleItem {
  title: string;
  framework: string;
  curiosity_score: number;
  seo_score: number;
  safety: "SAFE" | "CAUTION" | "DANGER";
  chars: number;
  front_loaded: boolean;
  why: string;
}

export interface TitleGenerationResponse {
  niche_detected: string;
  track_a: TitleItem[];
  track_b: TitleItem[];
}
