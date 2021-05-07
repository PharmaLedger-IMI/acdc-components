import {Component, Input, OnInit} from '@angular/core';

import {AppComponent} from '../app.component';
import {Event} from '../acdc/event.model';
import {EventService} from '../event.service';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {EventInput} from '../acdc/eventinput.model';
import {EventOutput} from '../eventoutput.model';

@Component({
  selector: 'app-event',
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.css']
})
export class EventDetailComponent implements OnInit {

  event?: Event;
  eventMetadata?: object;
  eventInputs?: EventInput[];
  eventOutputs?: EventOutput[];

  constructor(
    private appComponent: AppComponent,
    private eventService: EventService,
    private route: ActivatedRoute,
    private location: Location
  ) {
  }

  ngOnInit(): void {
    this.appComponent.setNavMenuHighlight('admin', 'event', 'Event Detail');
    this.getEvent();
  }

  getEvent(): void {
    const eventId = this.route.snapshot.paramMap.get('id');
    if (!eventId) {
      throw new Error('request id is null');
    }
    console.log(`eventDetail.component.getEvent id=${eventId}`);
    this.eventService.getEvent(eventId).subscribe((resp) => {
      const {eventInputs, eventOutputs, ...event} = resp;
      this.eventInputs = eventInputs;
      this.eventOutputs = eventOutputs;
      this.eventMetadata = event;
      resp.createdOn = new Date(event.createdOn);
      this.event = resp;
    });
  }

  goBack(): void {
    this.location.back();
  }
}
