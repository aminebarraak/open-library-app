// src/app/models/book.interface.ts

export interface Book {
  key: string;  // Identifiant du livre sous la forme /works/id
  title: string;
  edition_count: number;
  cover_id: number;
  first_publish_year: number;
  subtitle: string;
  description: string;
}