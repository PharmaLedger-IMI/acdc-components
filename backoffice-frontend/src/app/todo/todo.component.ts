import { Component, OnInit } from '@angular/core';
import {AppComponent} from "../app.component";

@Component({
  selector: 'app-todo',
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.css']
})
export class TodoComponent implements OnInit {

  constructor(private appComponent: AppComponent) { }

  ngOnInit(): void {
    this.appComponent.setNavMenuHighlight('data', 'For future development');
  }

}
