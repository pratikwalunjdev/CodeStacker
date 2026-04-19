export interface Blog {
  id: string;
  title: string;
  content: string;
  tags: string[];
  category: string;
  authorId: string;
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
  readTime: number;
  featuredImage?: string;
  views: number;
  slug: string;
}

export interface Tag {
  id: string;
  name: string;
  count: number;
}
