import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeadBarComponent } from './components/head-bar/head-bar';
import { SearchBarComponent } from './components/search-bar/search-bar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeadBarComponent, SearchBarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
}
