export interface VideoType {
  id: string;
  videoNumber: string;
  title: string;
  description: string;
  platform: string;
  embedUrl: string;
  tags: string[];
  viewCount: number;
  pinned: boolean;
  createdAt: string;
}

export interface ResourceLinkType {
  id: string;
  videoId: string;
  title: string;
  url: string;
  description: string;
  visitCount: number;
  createdAt: string;
}

export interface VideoWithResources extends VideoType {
  resources: ResourceLinkType[];
}

export interface PaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
  total: number;
}
