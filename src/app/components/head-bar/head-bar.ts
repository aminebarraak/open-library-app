// src/app/head-bar/head-bar.ts

import { Component } from '@angular/core';

@Component({
  selector: 'app-head-bar',
  standalone: true,
  imports: [],
  templateUrl: './head-bar.html',
  styleUrl: './head-bar.css'
})
export class HeadBarComponent {
  appTitle = 'Open Library - Bibliothèque IHEC';
}