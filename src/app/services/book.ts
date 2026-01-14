import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import type { Book } from '../models/book.interface';

interface WorksResponse {
  works: Book[];
}

interface SearchResponse {
  docs: Book[];
}

@Injectable({
  providedIn: 'root',
})
export class BookService {
  private readonly baseUrl = 'https://openlibrary.org';

  constructor(private http: HttpClient) {}

  getBooks(): Observable<WorksResponse> {
    // Exemple : liste des livres de science-fiction
    return this.http.get<WorksResponse>(`${this.baseUrl}/subjects/science_fiction.json`);
  }

  searchByTitle(title: string): Observable<SearchResponse> {
    return this.http.get<SearchResponse>(`${this.baseUrl}/search.json`, {
      params: { title },
    });
  }

  searchByYear(year: number): Observable<SearchResponse> {
    return this.http.get<SearchResponse>(`${this.baseUrl}/search.json`, {
      params: { first_publish_year: year.toString() },
    });
  }

  getBookById(id: string): Observable<Book> {
    // L’API Open Library pour un livre unique utilise la « work key »,
    // mais ici on suppose un id de type "OL12345W".
    return this.http.get<Book>(`${this.baseUrl}/works/${id}.json`);
  }
}
