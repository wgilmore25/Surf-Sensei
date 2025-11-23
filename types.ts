export interface SurfData {
  sessionDateTime: string;
  spots: string;
  swellHeight: string;
  swellPeriod: string;
  swellDirection: string;
  windSpeed: string;
  windDirection: string;
  tideHeight: string;
  tideDirection: 'rising' | 'falling';
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  bodyWeight: string;
  userBoards: string;
}

export interface Recommendation {
  spot: string;
  board: string;
  comparison: string;
  strategy: string;
}

export interface FeedbackData {
  accuracy: 'accurate' | 'inaccurate';
  comments: string;
}
