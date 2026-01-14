import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap, retry, timeout } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private apiUrl = 'https://openlibrary.org';
  private booksCache = new Map<string, any>();

  constructor(private http: HttpClient) { }

  // Récupère la liste de tous les livres d'informatique
  getBooks(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/subjects/computers.json`).pipe(
      timeout(5000),
      retry(1),
      tap(data => {
        console.log('✅ Livres reçus de l\'API:', data);
        // Enrichir les livres avec des descriptions
        if (data.works) {
          data.works = data.works.map((book: any) => this.enrichBookData(book));
        }
      }),
      catchError(error => {
        console.error('❌ Erreur getBooks:', error);
        return of({ works: [] });
      })
    );
  }

  // Récupère les détails d'un livre par son identifiant
  getBookById(id: string): Observable<any> {
    // Vérifier le cache d'abord
    if (this.booksCache.has(id)) {
      console.log('📦 Utilisation du cache pour:', id);
      return of(this.booksCache.get(id));
    }

    console.log('🌐 Appel API pour:', id);
    
    // Créer les formats possibles d'URL
    const urls = [
      `${this.apiUrl}/works/${id}.json`,
      `${this.apiUrl}/works/OL${id}M.json`,
      `${this.apiUrl}/works/${id.replace('OL', '').replace('M', '')}.json`
    ];

    return this.tryUrls(urls, 0, id);
  }

  private tryUrls(urls: string[], index: number, id: string): Observable<any> {
    if (index >= urls.length) {
      console.error('❌ Toutes les URLs ont échoué pour:', id);
      return of({
        key: `/works/${id}`,
        title: 'Impossible de charger ce livre',
        description: 'L\'API OpenLibrary n\'a pas pu être contactée. Vérifiez votre connexion Internet.',
        covers: [],
        first_publish_year: null,
        edition_count: 0
      });
    }

    return this.http.get<any>(urls[index]).pipe(
      timeout(3000), // Réduit à 3 secondes
      tap(data => {
        console.log('✅ Livre chargé de:', urls[index]);
        // Enrichir les données du livre
        data = this.enrichBookData(data);
        this.booksCache.set(id, data);
      }),
      catchError(error => {
        console.warn(`⚠️ URL ${index + 1}/${urls.length} échouée (${urls[index]}):`, error.message);
        return this.tryUrls(urls, index + 1, id);
      })
    );
  }

  // Recherche les livres par titre
  searchByTitle(title: string): Observable<any> {
    console.log('🔍 Recherche API par titre:', title);
    return this.http.get<any>(`${this.apiUrl}/search.json?title=${encodeURIComponent(title)}&limit=20`).pipe(
      timeout(5000),
      retry(1),
      tap(data => {
        console.log('✅ Résultats de recherche reçus:', data);
        // Enrichir les données avec des descriptions et auteurs
        if (data.docs) {
          data.docs = data.docs.map((book: any) => this.enrichSearchResult(book));
        }
      }),
      catchError(error => {
        console.error('❌ Erreur searchByTitle:', error);
        return of({ docs: [] });
      })
    );
  }

  // Recherche les livres par année de première édition
  searchByYear(year: number): Observable<any> {
    console.log('📅 Recherche API par année:', year);
    return this.http.get<any>(`${this.apiUrl}/search.json?first_publish_year=${year}&limit=20`).pipe(
      timeout(5000),
      retry(1),
      tap(data => {
        console.log('✅ Résultats année reçus:', data);
        // Enrichir les données
        if (data.docs) {
          data.docs = data.docs.map((book: any) => this.enrichSearchResult(book));
        }
      }),
      catchError(error => {
        console.error('❌ Erreur searchByYear:', error);
        return of({ docs: [] });
      })
    );
  }

  // Enrichir les données d'un livre avec une description générée
  private enrichBookData(book: any): any {
    if (!book.description) {
      // Générer une description basée sur le titre et les auteurs
      const authors = book.authors ? book.authors.map((a: any) => a.name).join(', ') : 'Auteur inconnu';
      const year = book.first_publish_year ? ` (${book.first_publish_year})` : '';
      const editions = book.edition_count ? ` Disponible en ${book.edition_count} édition(s).` : '';
      
      book.description = `${book.title} par ${authors}${year}.${editions} Un ouvrage d'informatique à découvrir.`;
    }
    return book;
  }

  // Enrichir un résultat de recherche
  private enrichSearchResult(book: any): any {
    console.log('📚 Enrichissement du résultat:', book.title, 'ID:', book.key);
    
    // Assurer que le key est au bon format (commençant par /works/)
    let bookKey = book.key;
    if (!bookKey.startsWith('/works/')) {
      bookKey = '/works/' + bookKey;
    }
    
    // Mapper les champs depuis la structure de recherche
    const enriched = {
      key: bookKey,
      title: book.title,
      first_publish_year: book.first_publish_year,
      edition_count: book.edition_count || 1,
      cover_id: book.cover_i,
      authors: book.author_name ? book.author_name.map((name: string) => ({ name })) : [],
      description: book.description || '',
      subtitle: book.subtitle || ''
    };

    // Générer une description si elle n'existe pas
    if (!enriched.description) {
      const authorNames = enriched.authors.length > 0 
        ? enriched.authors.map(a => a.name).join(', ')
        : 'Auteur inconnu';
      const year = enriched.first_publish_year ? ` (${enriched.first_publish_year})` : '';
      
      enriched.description = `${enriched.title} par ${authorNames}${year}. Un ouvrage d'informatique de qualité.`;
    }

    console.log('✅ Résultat enrichi:', enriched);
    return enriched;
  }

  // Extraire le nom d'un auteur à partir de sa structure
  private getAuthorName(author: any): string {
    if (typeof author === 'string') {
      return author;
    }
    if (author.name) {
      return author.name;
    }
    if (author.author && author.author.name) {
      return author.author.name;
    }
    return 'Auteur inconnu';
  }
}
