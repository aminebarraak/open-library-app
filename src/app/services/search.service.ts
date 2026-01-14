import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private searchTitleSubject = new BehaviorSubject<string>('');
  private searchYearSubject = new BehaviorSubject<number | null>(null);
  private sortBySubject = new BehaviorSubject<string>('title-asc');

  public searchTitle$: Observable<string> = this.searchTitleSubject.asObservable();
  public searchYear$: Observable<number | null> = this.searchYearSubject.asObservable();
  public sortBy$: Observable<string> = this.sortBySubject.asObservable();

  constructor() { }

  setSearchTitle(title: string) {
    console.log('🔍 Titre de recherche défini:', title);
    this.searchTitleSubject.next(title);
  }

  setSearchYear(year: number | null) {
    console.log('📅 Année de recherche définie:', year);
    this.searchYearSubject.next(year);
  }

  setSortBy(sortOption: string) {
    console.log('📊 Tri défini:', sortOption);
    this.sortBySubject.next(sortOption);
  }

  getSearchTitle(): string {
    return this.searchTitleSubject.value;
  }

  getSearchYear(): number | null {
    return this.searchYearSubject.value;
  }

  getSortBy(): string {
    return this.sortBySubject.value;
  }
}
